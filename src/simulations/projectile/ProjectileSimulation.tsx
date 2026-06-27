import { useEffect, useMemo, useRef, useState } from 'react';
import SimulationSection from '../../components/SimulationSection';
import Slider from '../../components/ui/Slider';
import StatList from '../../components/ui/StatList';
import Legend from '../../components/ui/Legend';
import PlaybackControls from '../../components/ui/PlaybackControls';
import { useTranslation } from '../../i18n/useTranslation';
import { getCategory } from '../categories';
import { pick, type SimulationComponentProps } from '../types';
import {
  EARTH_G,
  G_MIN,
  M_REF,
  MARS_G,
  MOON_G,
  energySeries,
  flightTime,
  maxHeight,
  range,
  trajectory,
} from './projectileMath';
import TrajectoryPlot, { TRAJ_COLORS } from './TrajectoryPlot';
import EnergyChart, { ENERGY_COLORS } from './EnergyChart';

type Mode = 'gravity' | 'electric';
type Preset = 'earth' | 'moon' | 'mars' | 'custom';

const PRESET_G: Record<Exclude<Preset, 'custom'>, number> = {
  earth: EARTH_G,
  moon: MOON_G,
  mars: MARS_G,
};

// Durée d'animation PROPORTIONNELLE au temps de vol réel, mais BORNÉE : un tir lunaire
// (g faible → longue suspension) défile visiblement plus lentement qu'un tir terrestre,
// ce qui rend la différence entre astres lisible — sans être ni trop lent ni trop rapide.
const ANIM_SCALE = 0.7; // secondes d'animation par seconde de vol simulée
const MIN_ANIM_S = 1.4;
const MAX_ANIM_S = 6;
function clampAnim(seconds: number): number {
  return Math.min(MAX_ANIM_S, Math.max(MIN_ANIM_S, seconds));
}

const content = {
  fr: {
    theoryCommon: [
      'Un projectile lancé du sol (y(0) = 0) avec une vitesse v₀ inclinée d’un angle θ combine deux mouvements indépendants : horizontal uniforme et vertical uniformément accéléré. Les équations horaires sont :',
      'La seule force étant le champ uniforme (frottements négligés), l’énergie mécanique Em = Ec + Ep se conserve : à la montée l’énergie cinétique se convertit en énergie potentielle, puis l’inverse à la descente — Em reste plate.',
    ],
    modes: {
      gravity: {
        name: 'Pesanteur',
        accelLabel: 'Intensité de pesanteur g',
        analogy:
          'Ici le champ est la pesanteur : g est son intensité (m·s⁻²). En changeant d’astre — Lune ou Mars, où g est plus faible — la portée et la hauteur deviennent bien plus grandes à v₀ et θ identiques.',
        xAxis: 'Portée x',
        yAxis: 'Altitude y',
        epName: 'Ep (pesanteur)',
        observe:
          'Mode pesanteur : le tir classique (balle, jet d’eau). Bascule en « Champ électrique » pour voir que les mêmes équations décrivent une tout autre physique.',
      },
      electric: {
        name: 'Champ électrique',
        accelLabel: 'Accélération a = qE/m',
        analogy:
          'Mêmes équations pour une particule chargée dans un champ électrique uniforme : g devient l’accélération a = qE/m. Les préréglages réutilisent les mêmes valeurs numériques à simple titre d’illustration — ce ne sont plus des astres, juste des accélérations commodes. C’est exactement ce qui dévie un électron entre les plaques d’un oscilloscope.',
        xAxis: 'Distance x',
        yAxis: 'Déviation y',
        epName: 'Ep (électrique)',
        observe:
          'Tout l’intérêt de l’analogie : les MÊMES équations décrivent un électron dévié entre deux plaques chargées (oscilloscope, ancien tube cathodique). Même parabole, même conservation de l’énergie — un seul modèle pour deux phénomènes très différents.',
      },
    } as Record<Mode, { name: string; accelLabel: string; analogy: string; xAxis: string; yAxis: string; epName: string; observe: string }>,
    observe: [
      'À v₀ fixée, la portée est maximale pour θ = 45° (compare 30°, 45° puis 60° : 45° va le plus loin).',
      'À v₀ et θ identiques, la portée et la hauteur sont bien plus grandes sur la Lune ou Mars que sur Terre (g plus petit).',
      'La courbe Em reste horizontale du départ à l’atterrissage, quel que soit θ : conservation de l’énergie mécanique. Ec et Ep s’échangent en miroir.',
    ],
    curriculum:
      'Terminale spécialité physique-chimie : mouvement dans un champ uniforme (pesanteur et champ électrique, même formalisme), équations horaires et équation de la trajectoire, conservation de l’énergie mécanique en l’absence de frottements.',
    labels: { v0: 'Vitesse initiale v₀', theta: 'Angle de tir θ', custom: 'Valeur personnalisée', mode: 'Type de champ' },
    presets: { earth: 'Terre', moon: 'Lune', mars: 'Mars', custom: 'Personnalisé' },
    buttons: { play: '▶ Lancer', pause: '❚❚ Pause', reset: '↺ Réinitialiser' },
    stats: { range: 'Portée R', height: 'Hauteur max H', flight: 'Temps de vol', em: 'Énergie méca. Em' },
    legend: { apex: 'Sommet', landing: 'Atterrissage' },
    energy: { time: 't (s)', ec: 'Ec (cinétique)', em: 'Em (mécanique)' },
    trajAria: 'Trajectoire parabolique du projectile, avec le sommet et le point d’atterrissage.',
    energyAria: 'Courbes des énergies cinétique, potentielle et mécanique au cours du vol.',
  },
  en: {
    theoryCommon: [
      'A projectile launched from the ground (y(0) = 0) with speed v₀ at an angle θ combines two independent motions: uniform horizontal and uniformly accelerated vertical. The equations of motion are:',
      'Since the only force is the uniform field (friction neglected), the mechanical energy Em = Ec + Ep is conserved: on the way up kinetic energy turns into potential energy, then the reverse on the way down — Em stays flat.',
    ],
    modes: {
      gravity: {
        name: 'Gravity',
        accelLabel: 'Gravity strength g',
        analogy:
          'Here the field is gravity: g is its strength (m·s⁻²). Switching body — Moon or Mars, where g is weaker — makes the range and height much larger for the same v₀ and θ.',
        xAxis: 'Range x',
        yAxis: 'Altitude y',
        epName: 'Ep (gravity)',
        observe:
          'Gravity mode: the classic launch (ball, water jet). Switch to “Electric field” to see the same equations describe an entirely different physics.',
      },
      electric: {
        name: 'Electric field',
        accelLabel: 'Acceleration a = qE/m',
        analogy:
          'Same equations for a charged particle in a uniform electric field: g becomes the acceleration a = qE/m. The presets reuse the same numbers purely for illustration — no longer celestial bodies, just handy accelerations. This is exactly what deflects an electron between the plates of an oscilloscope.',
        xAxis: 'Distance x',
        yAxis: 'Deflection y',
        epName: 'Ep (electric)',
        observe:
          'The whole point of the analogy: the SAME equations describe an electron deflected between two charged plates (oscilloscope, old CRT). Same parabola, same energy conservation — one model for two very different phenomena.',
      },
    } as Record<Mode, { name: string; accelLabel: string; analogy: string; xAxis: string; yAxis: string; epName: string; observe: string }>,
    observe: [
      'For a fixed v₀, the range is maximal at θ = 45° (compare 30°, 45° then 60°: 45° goes farthest).',
      'For the same v₀ and θ, range and height are much larger on the Moon or Mars than on Earth (smaller g).',
      'The Em curve stays horizontal from launch to landing, whatever θ: conservation of mechanical energy. Ec and Ep mirror each other.',
    ],
    curriculum:
      'Final-year specialty physics-chemistry: motion in a uniform field (gravity and electric field, same formalism), equations of motion and trajectory equation, conservation of mechanical energy without friction.',
    labels: { v0: 'Initial speed v₀', theta: 'Launch angle θ', custom: 'Custom value', mode: 'Field type' },
    presets: { earth: 'Earth', moon: 'Moon', mars: 'Mars', custom: 'Custom' },
    buttons: { play: '▶ Launch', pause: '❚❚ Pause', reset: '↺ Reset' },
    stats: { range: 'Range R', height: 'Max height H', flight: 'Flight time', em: 'Mech. energy Em' },
    legend: { apex: 'Apex', landing: 'Landing' },
    energy: { time: 't (s)', ec: 'Ec (kinetic)', em: 'Em (mechanical)' },
    trajAria: 'Parabolic trajectory of the projectile, with the apex and the landing point.',
    energyAria: 'Kinetic, potential and mechanical energy curves during the flight.',
  },
} as const;

export default function ProjectileSimulation({ meta }: SimulationComponentProps) {
  const { lang } = useTranslation();
  const c = content[lang];
  const eyebrow = pick(getCategory(meta.category).label, lang);

  const [v0, setV0] = useState(20);
  const [theta, setTheta] = useState(45);
  const [preset, setPreset] = useState<Preset>('earth');
  const [customG, setCustomG] = useState(EARTH_G);
  const [mode, setMode] = useState<Mode>('gravity');
  const [progress, setProgress] = useState(0); // fraction du temps de vol ∈ [0, 1]
  const [playing, setPlaying] = useState(false);

  const g = preset === 'custom' ? customG : PRESET_G[preset];
  const m = c.modes[mode];

  // Durée d'animation courante (lue par la boucle sans relancer l'effet à chaque réglage).
  const durationRef = useRef(MIN_ANIM_S);

  // Animation : avance la fraction parcourue à cadence murale fixe.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1); // plafond anti-saut au retour d'onglet
      last = now;
      setProgress((prev) => {
        const next = prev + dt / durationRef.current;
        if (next >= 1) {
          setPlaying(false);
          return 1;
        }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const points = useMemo(() => trajectory(v0, theta, g), [v0, theta, g]);
  const energy = useMemo(() => energySeries(v0, theta, g), [v0, theta, g]);

  const tVol = flightTime(v0, theta, g);
  const R = range(v0, theta, g);
  const H = maxHeight(v0, theta, g);
  const em = 0.5 * M_REF * v0 * v0; // énergie mécanique constante
  const currentT = progress * tVol;

  // Cadence d'animation : proportionnelle au temps de vol, bornée (cf. constantes).
  durationRef.current = clampAnim(tVol * ANIM_SCALE);

  const togglePlay = () => {
    if (!playing && progress >= 1) setProgress(0);
    setPlaying((p) => !p);
  };
  const reset = () => {
    setPlaying(false);
    setProgress(0);
  };

  const presetBtn = (key: Preset, label: string, value?: number) => {
    const active = preset === key;
    return (
      <button
        key={key}
        type="button"
        onClick={() => setPreset(key)}
        className={
          'rounded-lg border px-2 py-1.5 text-center text-sm font-medium transition-colors ' +
          (active
            ? 'border-accent bg-accent/10 text-accent'
            : 'border-slate-300 text-slate-700 hover:bg-slate-100')
        }
      >
        {label}
        {value !== undefined ? (
          <span className="block font-mono text-[11px] tabular-nums text-slate-400">{value.toFixed(2)}</span>
        ) : null}
      </button>
    );
  };

  return (
    <SimulationSection
      id={meta.id}
      eyebrow={eyebrow}
      title={pick(meta.title, lang)}
      description={pick(meta.description, lang)}
      theory={
        <div className="space-y-3">
          <p>{c.theoryCommon[0]}</p>
          <p className="py-1 text-center text-[15px] text-slate-900">
            x(t) = v₀·cos θ·t&nbsp;&nbsp;,&nbsp;&nbsp;y(t) = v₀·sin θ·t − ½·g·t²
          </p>
          <p>{m.analogy}</p>
          <p>{c.theoryCommon[1]}</p>
        </div>
      }
      controls={
        <div className="space-y-5">
          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700">{c.labels.mode}</span>
            <div className="flex gap-2">
              {(['gravity', 'electric'] as const).map((md) => {
                const active = mode === md;
                return (
                  <button
                    key={md}
                    type="button"
                    onClick={() => setMode(md)}
                    className={
                      'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ' +
                      (active
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-slate-300 text-slate-700 hover:bg-slate-100')
                    }
                  >
                    {c.modes[md].name}
                  </button>
                );
              })}
            </div>
          </div>

          <Slider
            label={c.labels.v0}
            value={v0}
            min={5}
            max={50}
            step={1}
            onChange={setV0}
            unit="m/s"
          />
          <Slider
            label={c.labels.theta}
            value={theta}
            min={1}
            max={89}
            step={1}
            onChange={setTheta}
            format={(v) => `${v.toFixed(0)}°`}
          />

          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700">{m.accelLabel}</span>
            <div className="grid grid-cols-2 gap-2">
              {presetBtn('earth', c.presets.earth, EARTH_G)}
              {presetBtn('moon', c.presets.moon, MOON_G)}
              {presetBtn('mars', c.presets.mars, MARS_G)}
              {presetBtn('custom', c.presets.custom)}
            </div>
            {preset === 'custom' ? (
              <div className="mt-3">
                <Slider
                  label={c.labels.custom}
                  value={customG}
                  min={G_MIN}
                  max={20}
                  step={0.1}
                  onChange={setCustomG}
                  format={(v) => v.toFixed(1)}
                  unit="m/s²"
                />
              </div>
            ) : null}
          </div>

          <PlaybackControls playing={playing} onToggle={togglePlay} onReset={reset} labels={c.buttons} />
        </div>
      }
      visualization={
        <div className="space-y-4">
          <TrajectoryPlot
            points={points}
            progress={progress}
            range={R}
            maxHeight={H}
            axisLabels={{ x: m.xAxis, y: m.yAxis }}
            ariaLabel={c.trajAria}
          />

          <StatList
            items={[
              { label: c.stats.range, value: `${R.toFixed(2)} m` },
              { label: c.stats.height, value: `${H.toFixed(2)} m` },
              { label: c.stats.flight, value: `${tVol.toFixed(2)} s` },
              { label: c.stats.em, value: `${em.toFixed(1)} J`, emphasize: true },
            ]}
          />

          <EnergyChart
            data={energy}
            currentT={currentT}
            tMax={tVol}
            emMax={em * 1.12}
            labels={{ time: c.energy.time, ec: c.energy.ec, ep: m.epName, em: c.energy.em }}
            ariaLabel={c.energyAria}
          />
          <Legend
            items={[
              { color: ENERGY_COLORS.ec, label: c.energy.ec, variant: 'line' },
              { color: ENERGY_COLORS.ep, label: m.epName, variant: 'line' },
              { color: ENERGY_COLORS.em, label: c.energy.em, variant: 'line', dashed: true },
              { color: TRAJ_COLORS.apex, label: c.legend.apex, variant: 'dot' },
              { color: TRAJ_COLORS.landing, label: c.legend.landing, variant: 'dot' },
            ]}
          />
        </div>
      }
      observe={
        <ul className="list-disc space-y-2 pl-5 marker:text-accent">
          {c.observe.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
          <li className="font-medium text-accent">{m.observe}</li>
        </ul>
      }
      curriculum={<p>{c.curriculum}</p>}
    />
  );
}
