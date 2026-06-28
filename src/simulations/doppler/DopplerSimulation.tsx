import { useEffect, useRef, useState } from 'react';
import SimulationSection from '../../components/SimulationSection';
import Slider from '../../components/ui/Slider';
import Legend from '../../components/ui/Legend';
import StatList from '../../components/ui/StatList';
import PlaybackControls from '../../components/ui/PlaybackControls';
import { useTranslation } from '../../i18n/useTranslation';
import { getCategory } from '../categories';
import { pick, type SimulationComponentProps } from '../types';
import { SOUND_SPEED, perceivedFrequency, radialVelocity } from './dopplerMath';
import DopplerScene, { DOPPLER_COLORS, SCENE, type Tone, type Wave } from './DopplerScene';

// Constantes d'animation (mise en scène : le RESSERREMENT des fronts ne dépend que
// de v/c, pas des valeurs absolues — on choisit donc une célérité visuelle et une
// cadence d'émission lisibles, indépendantes de f0 réel, trop élevé pour être animé).
const C_VISUAL = 150; // célérité visuelle des fronts d'onde (unités viewBox / s)
const EMIT_INTERVAL = 0.13; // période d'émission visuelle (s)
const MAX_WAVEFRONTS = 48; // garde mémoire : nombre maximal de fronts vivants

const TONE_TOLERANCE = 1; // |f' − f0| (Hz) sous lequel on considère le son inchangé

const content = {
  fr: {
    theory: [
      'Effet Doppler : quand une source sonore se déplace, l’observateur perçoit une fréquence f’ différente de la fréquence émise f0. En s’approchant, les fronts d’onde se resserrent (son plus aigu) ; en s’éloignant, ils s’espacent (son plus grave).',
      'Pour une vitesse radiale v de la source vers l’observateur (positive si elle s’approche), f’ = f0·c / (c − v), avec c ≈ 340 m/s la célérité du son. f’ > f0 à l’approche, f’ < f0 à l’éloignement, et f’ = f0 quand la source passe au plus près (vitesse radiale nulle).',
      'Modèle acoustique (source mobile dans l’air immobile) : on borne |v| à 0,9·c, car au-delà la source rattrape ses propres ondes (c − v → 0, mur du son), hors de ce modèle. Pour la lumière, l’idée est la même mais la formule diffère (relativité).',
    ],
    observe: [
      'Regarde les cercles : ils se resserrent devant la source et s’espacent derrière — c’est l’origine géométrique de l’effet.',
      'La fréquence perçue passe d’aiguë (approche) à grave (éloignement) au moment où la source dépasse l’observateur (point fixe).',
      'Augmente la vitesse v : l’écart entre f’ à l’approche et au départ se creuse nettement.',
      'À vitesse faible, l’effet est imperceptible ; c’est pour les sources rapides (sirène, voiture) qu’on l’entend.',
      'La couleur de l’observateur suit la convention de l’astrophysique : bleu quand la source s’approche (fréquence plus haute, « blueshift »), rouge quand elle s’éloigne (« redshift ») — une analogie visuelle, pas une vraie couleur du son.',
    ],
    curriculum:
      'Terminale spécialité physique-chimie : effet Doppler, décalage de fréquence d’une onde émise par une source en mouvement, relation f’ = f0·c / (c − v) et applications (radar, échographie Doppler, décalage spectral en astrophysique).',
    labels: { f0: 'Fréquence émise f0', v: 'Vitesse de la source v' },
    buttons: { play: '▶ Lecture', pause: '❚❚ Pause', reset: '↺ Réinitialiser' },
    stats: {
      f0: 'Fréquence émise f0',
      approach: 'f’ à l’approche',
      recede: 'f’ à l’éloignement',
      current: 'f’ perçue (instant)',
    },
    sceneAria: 'Source mobile émettant des fronts d’onde vers un observateur fixe.',
    labelsScene: { source: 'Source', observer: 'Observateur' },
    legend: {
      higher: 'Son plus aigu — source qui s’approche (« blueshift »)',
      lower: 'Son plus grave — source qui s’éloigne (« redshift »)',
    },
  },
  en: {
    theory: [
      'Doppler effect: when a sound source moves, the observer perceives a frequency f’ different from the emitted frequency f0. Approaching, the wavefronts bunch up (higher pitch); receding, they spread out (lower pitch).',
      'For a radial source velocity v towards the observer (positive when approaching), f’ = f0·c / (c − v), with c ≈ 340 m/s the speed of sound. f’ > f0 when approaching, f’ < f0 when receding, and f’ = f0 at closest approach (zero radial velocity).',
      'Acoustic model (source moving through still air): |v| is capped at 0.9·c, because beyond it the source catches its own waves (c − v → 0, sound barrier), outside this model. For light the idea is the same but the formula differs (relativity).',
    ],
    observe: [
      'Watch the circles: they bunch up ahead of the source and spread out behind — the geometric origin of the effect.',
      'The perceived frequency goes from high (approaching) to low (receding) just as the source passes the fixed observer.',
      'Increase the speed v: the gap between approaching and receding f’ widens markedly.',
      'At low speed the effect is imperceptible; it is for fast sources (siren, car) that we hear it.',
      'The observer’s colour follows the astrophysics convention: blue when the source approaches (higher frequency, “blueshift”), red when it recedes (“redshift”) — a visual analogy, not a real colour of sound.',
    ],
    curriculum:
      'Final-year specialty physics-chemistry: Doppler effect, frequency shift of a wave emitted by a moving source, the relation f’ = f0·c / (c − v) and applications (radar, Doppler ultrasound, spectral shift in astrophysics).',
    labels: { f0: 'Emitted frequency f0', v: 'Source speed v' },
    buttons: { play: '▶ Play', pause: '❚❚ Pause', reset: '↺ Reset' },
    stats: {
      f0: 'Emitted frequency f0',
      approach: 'f’ approaching',
      recede: 'f’ receding',
      current: 'f’ perceived (now)',
    },
    sceneAria: 'Moving source emitting wavefronts towards a fixed observer.',
    labelsScene: { source: 'Source', observer: 'Observer' },
    legend: {
      higher: 'Higher pitch — source approaching (“blueshift”)',
      lower: 'Lower pitch — source receding (“redshift”)',
    },
  },
} as const;

interface View {
  srcX: number;
  waves: Wave[];
  radialV: number;
}

function initialView(): View {
  return { srcX: SCENE.srcMinX, waves: [], radialV: 0 };
}

export default function DopplerSimulation({ meta }: SimulationComponentProps) {
  const { lang } = useTranslation();
  const c = content[lang];
  const eyebrow = pick(getCategory(meta.category).label, lang);

  const [f0, setF0] = useState(440);
  const [v, setV] = useState(120);
  const [playing, setPlaying] = useState(true);
  const [view, setView] = useState<View>(initialView);

  // Lues dans la boucle d'animation sans la relancer à chaque réglage.
  const vRef = useRef(v);
  vRef.current = v;

  // État physique dans des refs (pas de re-rendu par sous-pas).
  const srcXRef = useRef(SCENE.srcMinX);
  const wavesRef = useRef<{ x: number; y: number; born: number }[]>([]);
  const clockRef = useRef(0);
  const emitAccRef = useRef(0);

  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1); // plafond anti-saut au retour d'onglet
      last = now;
      clockRef.current += dt;

      // Déplacement de la source (vitesse écran ∝ v/c ⇒ resserrement = v/c).
      const speedPx = C_VISUAL * (vRef.current / SOUND_SPEED);
      srcXRef.current += speedPx * dt;
      if (srcXRef.current > SCENE.srcMaxX) {
        srcXRef.current = SCENE.srcMinX; // boucle : repart à gauche
        wavesRef.current = [];
        emitAccRef.current = 0;
      }

      // Émission périodique de fronts d'onde.
      emitAccRef.current += dt;
      while (emitAccRef.current >= EMIT_INTERVAL) {
        emitAccRef.current -= EMIT_INTERVAL;
        wavesRef.current.push({ x: srcXRef.current, y: SCENE.lineY, born: clockRef.current });
      }
      if (wavesRef.current.length > MAX_WAVEFRONTS) {
        wavesRef.current.splice(0, wavesRef.current.length - MAX_WAVEFRONTS);
      }

      // Rayons courants + élagage des fronts hors champ.
      const t = clockRef.current;
      const waves: Wave[] = [];
      for (const w of wavesRef.current) {
        const r = C_VISUAL * (t - w.born);
        if (r <= SCENE.maxR) waves.push({ x: w.x, y: w.y, r });
      }

      const radialV = radialVelocity(vRef.current, srcXRef.current, SCENE.lineY, SCENE.obs.x, SCENE.obs.y);
      setView({ srcX: srcXRef.current, waves, radialV });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  const reset = () => {
    setPlaying(false);
    srcXRef.current = SCENE.srcMinX;
    wavesRef.current = [];
    clockRef.current = 0;
    emitAccRef.current = 0;
    setView(initialView());
  };

  const fApproach = perceivedFrequency(f0, v, SOUND_SPEED);
  const fRecede = perceivedFrequency(f0, -v, SOUND_SPEED);
  const fCurrent = perceivedFrequency(f0, view.radialV, SOUND_SPEED);
  const tone: Tone =
    fCurrent > f0 + TONE_TOLERANCE ? 'higher' : fCurrent < f0 - TONE_TOLERANCE ? 'lower' : 'same';

  const fmtHz = (x: number) => (Number.isFinite(x) ? `${Math.round(x)} Hz` : '—');

  return (
    <SimulationSection
      id={meta.id}
      eyebrow={eyebrow}
      title={pick(meta.title, lang)}
      description={pick(meta.description, lang)}
      theory={
        <div className="space-y-3">
          {c.theory.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      }
      controls={
        <div className="space-y-5">
          <Slider
            label={c.labels.f0}
            value={f0}
            min={200}
            max={1000}
            step={20}
            onChange={setF0}
            unit="Hz"
          />
          <Slider
            label={c.labels.v}
            value={v}
            min={0}
            max={300}
            step={10}
            onChange={setV}
            unit="m/s"
          />
          <PlaybackControls
            playing={playing}
            onToggle={() => setPlaying((p) => !p)}
            onReset={reset}
            labels={c.buttons}
          />
        </div>
      }
      visualization={
        <div className="space-y-4">
          <DopplerScene
            srcX={view.srcX}
            waves={view.waves}
            tone={tone}
            labels={c.labelsScene}
            ariaLabel={c.sceneAria}
          />
          <Legend
            items={[
              { color: DOPPLER_COLORS.higher, label: c.legend.higher, variant: 'dot' },
              { color: DOPPLER_COLORS.lower, label: c.legend.lower, variant: 'dot' },
            ]}
          />
          <StatList
            items={[
              { label: c.stats.f0, value: `${f0} Hz` },
              { label: c.stats.approach, value: fmtHz(fApproach) },
              { label: c.stats.recede, value: fmtHz(fRecede) },
              { label: c.stats.current, value: fmtHz(fCurrent), emphasize: true },
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
