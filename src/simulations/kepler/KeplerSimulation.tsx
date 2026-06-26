import { useCallback, useEffect, useRef, useState } from 'react';
import SimulationSection from '../../components/SimulationSection';
import Slider from '../../components/ui/Slider';
import StatList from '../../components/ui/StatList';
import PlaybackControls from '../../components/ui/PlaybackControls';
import Vec from '../../components/ui/Vec';
import { useTranslation } from '../../i18n/useTranslation';
import { getCategory } from '../categories';
import { pick, type SimulationComponentProps } from '../types';
import {
  gravityStep,
  initialState,
  isCollision,
  theoreticalPeriod,
  type OrbitState,
  type Vec2,
} from './keplerMath';
import OrbitView from './OrbitView';

// Pas d'intégration physique FIXE (découplé du framerate).
const DT = 0.004;
// Plafond de sous-pas par frame : empêche le navigateur de tenter des milliers de
// pas d'un coup au retour d'un onglet resté en arrière-plan.
const MAX_SUBSTEPS = 240;
const TRAIL_MAX = 600; // longueur max de la traînée
const VIEW_HALF = 4; // demi-largeur du monde visible (viewBox FIXE, pas de zoom dynamique)
const ESCAPE_PCT = Math.SQRT2 * 100; // seuil d'évasion ≈ 141,42 %

const content = {
  fr: {
    theory: [
      'Un corps en orbite autour d’un astre central subit une accélération gravitationnelle dirigée vers le centre, donnée par :',
      'où r est le vecteur position et r³ le cube de sa norme. Ici GM = 1 en unités normalisées (pas de valeurs astronomiques réelles). On lance le corps depuis une distance r₀ avec une vitesse perpendiculaire au rayon ; à la vitesse circulaire v_circ = √(GM/r₀), l’orbite est un cercle parfait.',
      'L’intégration utilise la méthode d’Euler semi-implicite (symplectique) : on met à jour la vitesse avant la position. Contrairement à l’Euler explicite (simulation de maths), elle conserve l’énergie et n’envoie pas l’orbite en spirale. L’orbite elliptique et l’évasion sont un enrichissement au-delà du strict exigible.',
    ],
    observe: [
      'v₀ = 100 % : orbite circulaire parfaite, distance au centre constante.',
      'v₀ < 100 % : le point de départ est le plus éloigné (apoapside) ; l’orbite plonge plus près ailleurs.',
      'v₀ > 100 % (sous le seuil d’évasion) : le point de départ est le plus proche (périapside) ; l’orbite s’éloigne davantage ailleurs.',
      'v₀ ≥ 141,4 % (√2) : la trajectoire ne revient pas, le corps s’échappe.',
      'À vitesse circulaire, fais varier r₀ : T²/r₀³ reste constant (3ᵉ loi de Kepler).',
    ],
    curriculum:
      'Spécialité physique-chimie : mouvement dans un champ de gravitation, vecteurs vitesse/accélération en mouvement circulaire et 3ᵉ loi de Kepler (cas circulaire, exigible). L’orbite elliptique et le seuil d’évasion sont un enrichissement visuel au-delà du strict exigible.',
    labels: { r0: 'Distance initiale r₀', v0: 'Vitesse initiale (% de v_circ)', speed: 'Vitesse d’animation' },
    buttons: { play: '▶ Lecture', pause: '❚❚ Pause', reset: '↺ Réinitialiser' },
    stats: { v0: 'Vitesse initiale', tTheo: 'T théorique (circ.)', tMeasured: 'T mesurée', kepler: 'T²/r₀³' },
    status: {
      collision: 'Collision avec le corps central — réinitialise pour relancer.',
      escape: 'Régime d’évasion : la trajectoire ne revient pas.',
    },
    aria: 'Vue de l’orbite : corps central et corps en mouvement avec sa trajectoire.',
  },
  en: {
    theory: [
      'A body orbiting a central star feels a gravitational acceleration directed toward the centre, given by:',
      'where r is the position vector and r³ the cube of its magnitude. Here GM = 1 in normalised units (not real astronomical values). The body is launched from a distance r₀ with a velocity perpendicular to the radius; at the circular speed v_circ = √(GM/r₀), the orbit is a perfect circle.',
      'Integration uses the semi-implicit (symplectic) Euler method: velocity is updated before position. Unlike explicit Euler (the maths simulation), it conserves energy and does not send the orbit spiralling. The elliptical orbit and escape are enrichment beyond the strict syllabus.',
    ],
    observe: [
      'v₀ = 100 %: perfect circular orbit, constant distance to the centre.',
      'v₀ < 100 %: the start point is the farthest (apoapsis); the orbit dips closer elsewhere.',
      'v₀ > 100 % (below escape): the start point is the closest (periapsis); the orbit reaches farther elsewhere.',
      'v₀ ≥ 141.4 % (√2): the trajectory does not return, the body escapes.',
      'At circular speed, vary r₀: T²/r₀³ stays constant (Kepler’s 3rd law).',
    ],
    curriculum:
      'Specialty physics-chemistry: motion in a gravitational field, velocity/acceleration vectors in circular motion and Kepler’s 3rd law (circular case, required). The elliptical orbit and escape threshold are visual enrichment beyond the strict syllabus.',
    labels: { r0: 'Initial distance r₀', v0: 'Initial speed (% of v_circ)', speed: 'Animation speed' },
    buttons: { play: '▶ Play', pause: '❚❚ Pause', reset: '↺ Reset' },
    stats: { v0: 'Initial speed', tTheo: 'T theoretical (circ.)', tMeasured: 'T measured', kepler: 'T²/r₀³' },
    status: {
      collision: 'Collision with the central body — reset to relaunch.',
      escape: 'Escape regime: the trajectory does not return.',
    },
    aria: 'Orbit view: central body and moving body with its trajectory.',
  },
} as const;

export default function KeplerSimulation({ meta }: SimulationComponentProps) {
  const { lang } = useTranslation();
  const c = content[lang];
  const eyebrow = pick(getCategory(meta.category).label, lang);

  const [r0, setR0] = useState(1);
  const [v0Pct, setV0Pct] = useState(100);
  const [speed, setSpeed] = useState(1.5);
  const [playing, setPlaying] = useState(false);
  const [collided, setCollided] = useState(false);
  const [measuredPeriod, setMeasuredPeriod] = useState<number | null>(null);
  const [view, setView] = useState<{ pos: Vec2; trail: Vec2[] }>(() => {
    const s = initialState(1, 100);
    return { pos: s.pos, trail: [s.pos] };
  });

  // État physique et accumulateurs dans des refs (pas de re-rendu par sous-pas).
  const stateRef = useRef<OrbitState>(initialState(1, 100));
  const trailRef = useRef<Vec2[]>([initialState(1, 100).pos]);
  const accRef = useRef(0); // temps simulé accumulé non encore consommé
  const simTimeRef = useRef(0);
  const sweptRef = useRef(0); // angle balayé (mesure de période)
  const lastAngleRef = useRef(0);
  const revStartRef = useRef(0);
  const collidedRef = useRef(false);

  const initOrbit = useCallback(() => {
    const s = initialState(r0, v0Pct);
    stateRef.current = s;
    trailRef.current = [s.pos];
    accRef.current = 0;
    simTimeRef.current = 0;
    sweptRef.current = 0;
    lastAngleRef.current = Math.atan2(s.pos.y, s.pos.x);
    revStartRef.current = 0;
    collidedRef.current = false;
    setCollided(false);
    setMeasuredPeriod(null);
    setView({ pos: s.pos, trail: [s.pos] });
  }, [r0, v0Pct]);

  // Réinitialise quand r₀ ou v₀ change.
  useEffect(() => {
    initOrbit();
  }, [initOrbit]);

  // Boucle d'animation à pas fixe.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const realDt = (now - last) / 1000;
      last = now;
      accRef.current += realDt * speed; // « speed » = unités de temps simulé / seconde réelle

      let steps = 0;
      while (accRef.current >= DT && steps < MAX_SUBSTEPS && !collidedRef.current) {
        const s = gravityStep(stateRef.current.pos, stateRef.current.vel, DT);
        stateRef.current = s;
        simTimeRef.current += DT;

        // Mesure de période : angle balayé jusqu'à un tour complet.
        const ang = Math.atan2(s.pos.y, s.pos.x);
        let d = ang - lastAngleRef.current;
        if (d > Math.PI) d -= 2 * Math.PI;
        else if (d < -Math.PI) d += 2 * Math.PI;
        sweptRef.current += d;
        lastAngleRef.current = ang;
        if (Math.abs(sweptRef.current) >= 2 * Math.PI) {
          setMeasuredPeriod(simTimeRef.current - revStartRef.current);
          revStartRef.current = simTimeRef.current;
          sweptRef.current -= Math.sign(sweptRef.current) * 2 * Math.PI;
        }

        const tr = trailRef.current;
        tr.push(s.pos);
        if (tr.length > TRAIL_MAX) tr.shift();

        if (isCollision(s.pos)) {
          collidedRef.current = true;
          setCollided(true);
          setPlaying(false);
          break;
        }
        accRef.current -= DT;
        steps++;
      }
      // Retour d'onglet : on jette le retard accumulé plutôt que de rattraper.
      if (steps >= MAX_SUBSTEPS) accRef.current = 0;

      setView({ pos: stateRef.current.pos, trail: trailRef.current.slice() });
      if (!collidedRef.current) raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed]);

  const togglePlay = () => {
    if (collidedRef.current) {
      initOrbit();
      setPlaying(true);
      return;
    }
    setPlaying((p) => !p);
  };
  const reset = () => {
    setPlaying(false);
    initOrbit();
  };

  const tTheo = theoreticalPeriod(r0);
  const isEscape = v0Pct >= ESCAPE_PCT;

  return (
    <SimulationSection
      id={meta.id}
      eyebrow={eyebrow}
      title={pick(meta.title, lang)}
      description={pick(meta.description, lang)}
      theory={
        <div className="space-y-3">
          <p>{c.theory[0]}</p>
          <p className="py-1 text-center text-[15px] text-slate-900">
            <Vec>a</Vec> = −GM·<Vec>r</Vec> / r³
          </p>
          <p>{c.theory[1]}</p>
          <p>{c.theory[2]}</p>
        </div>
      }
      controls={
        <div className="space-y-5">
          <Slider
            label={c.labels.r0}
            value={r0}
            min={0.5}
            max={1.5}
            step={0.1}
            onChange={setR0}
            format={(v) => v.toFixed(1)}
          />
          <Slider
            label={c.labels.v0}
            value={v0Pct}
            min={40}
            max={145}
            step={1}
            onChange={setV0Pct}
            format={(v) => `${v.toFixed(0)} %`}
          />
          <Slider
            label={c.labels.speed}
            value={speed}
            min={0.5}
            max={4}
            step={0.5}
            onChange={setSpeed}
            format={(v) => `${v.toFixed(1)}×`}
          />
          <PlaybackControls playing={playing} onToggle={togglePlay} onReset={reset} labels={c.buttons} />
        </div>
      }
      visualization={
        <div className="space-y-4">
          <OrbitView
            bodyPos={view.pos}
            trail={view.trail}
            r0={r0}
            viewHalf={VIEW_HALF}
            collided={collided}
            ariaLabel={c.aria}
          />

          {collided ? (
            <p className="rounded-lg border border-rose-300 bg-rose-50 p-3 text-sm text-rose-800">
              {c.status.collision}
            </p>
          ) : isEscape ? (
            <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800">
              {c.status.escape}
            </p>
          ) : null}

          <StatList
            items={[
              { label: c.stats.v0, value: `${v0Pct} %` },
              { label: c.stats.tTheo, value: tTheo.toFixed(2) },
              {
                label: c.stats.tMeasured,
                value: measuredPeriod ? measuredPeriod.toFixed(2) : '—',
                emphasize: true,
              },
              { label: c.stats.kepler, value: (tTheo ** 2 / r0 ** 3).toFixed(2) },
            ]}
          />
        </div>
      }
      observe={
        <ul className="list-disc space-y-2 pl-5 marker:text-accent">
          {c.observe.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ul>
      }
      curriculum={<p>{c.curriculum}</p>}
    />
  );
}
