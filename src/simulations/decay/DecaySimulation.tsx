import { useEffect, useMemo, useState } from 'react';
import SimulationSection from '../../components/SimulationSection';
import Slider from '../../components/ui/Slider';
import Legend from '../../components/ui/Legend';
import StatList from '../../components/ui/StatList';
import PlaybackControls from '../../components/ui/PlaybackControls';
import { useTranslation } from '../../i18n/useTranslation';
import { getCategory } from '../categories';
import { pick, type SimulationComponentProps } from '../types';
import {
  decayCurve,
  fractionRemaining,
  halfLifeMarkers,
  lambda,
  remaining,
} from './decayMath';
import DecayChart, { DECAY_COLORS } from './DecayChart';
import AtomGrid from './AtomGrid';

const TMAX = 30; // horizon temporel fixe (unités arbitraires)

const content = {
  fr: {
    theory: [
      "La décroissance radioactive est un phénomène physique réel : un noyau instable se désintègre à un instant imprévisible. Mais sur un grand nombre de noyaux, la population suit une loi exacte.",
      'Loi de décroissance : N(t) = N₀·e^(−λt), où λ est la constante radioactive. La demi-vie t½ est le temps au bout duquel la moitié des noyaux se sont désintégrés : t½ = ln 2 / λ.',
      "Contrairement à la méthode d'Euler (simulation de maths), il n'y a ici aucune approximation : on trace la loi exacte. La grille illustre que la désintégration d'un noyau est aléatoire, alors que la moyenne suit la courbe.",
    ],
    observe: [
      'À chaque demi-vie écoulée, il reste deux fois moins de noyaux : N₀ → N₀/2 → N₀/4 → N₀/8… (points verts sur la courbe).',
      'La demi-vie ne dépend pas de N₀ : changez N₀, la forme de la courbe et le rythme de la grille restent identiques.',
      'Diminuez la demi-vie : la décroissance est plus rapide (λ plus grand).',
      "Lancez l'animation : les noyaux s'éteignent dans un ordre aléatoire, mais leur nombre suit toujours la courbe.",
    ],
    curriculum:
      'Terminale spécialité physique-chimie : loi de décroissance radioactive N(t) = N₀·e^(−λt), constante radioactive λ, demi-vie t½ = ln 2 / λ, et caractère aléatoire de la désintégration d’un noyau individuel.',
    aria: 'Courbe de décroissance du nombre de noyaux en fonction du temps.',
    labels: {
      n0: 'Nombre initial de noyaux N₀',
      halfLife: 'Demi-vie t½',
      time: 'Temps écoulé t',
      speed: "Vitesse d'animation",
    },
    buttons: { play: '▶ Lecture', pause: '❚❚ Pause', reset: '↺ Réinitialiser' },
    stats: {
      lambda: 'Constante λ',
      remaining: 'Noyaux restants N(t)',
      fraction: 'Fraction restante',
      halfLives: 'Demi-vies écoulées',
    },
    legend: { present: 'Noyau présent', decayed: 'Désintégré', marker: 'Demi-vies' },
    chart: { time: 't', remaining: 'N(t)' },
  },
  en: {
    theory: [
      'Radioactive decay is a real physical phenomenon: an unstable nucleus decays at an unpredictable instant. But across a large number of nuclei, the population follows an exact law.',
      'Decay law: N(t) = N₀·e^(−λt), where λ is the decay constant. The half-life t½ is the time after which half of the nuclei have decayed: t½ = ln 2 / λ.',
      "Unlike Euler's method (the maths simulation), there is no approximation here: we plot the exact law. The grid shows that an individual nucleus decays at random, while the average follows the curve.",
    ],
    observe: [
      'After each half-life, half as many nuclei remain: N₀ → N₀/2 → N₀/4 → N₀/8… (green points on the curve).',
      'The half-life does not depend on N₀: change N₀ and the curve shape and grid pace stay the same.',
      'Decrease the half-life: decay is faster (larger λ).',
      'Start the animation: nuclei switch off in a random order, but their count always follows the curve.',
    ],
    curriculum:
      'Final-year specialty physics-chemistry: radioactive decay law N(t) = N₀·e^(−λt), decay constant λ, half-life t½ = ln 2 / λ, and the random nature of an individual nuclear decay.',
    aria: 'Decay curve of the number of nuclei over time.',
    labels: {
      n0: 'Initial number of nuclei N₀',
      halfLife: 'Half-life t½',
      time: 'Elapsed time t',
      speed: 'Animation speed',
    },
    buttons: { play: '▶ Play', pause: '❚❚ Pause', reset: '↺ Reset' },
    stats: {
      lambda: 'Decay constant λ',
      remaining: 'Remaining nuclei N(t)',
      fraction: 'Remaining fraction',
      halfLives: 'Half-lives elapsed',
    },
    legend: { present: 'Present nucleus', decayed: 'Decayed', marker: 'Half-lives' },
    chart: { time: 't', remaining: 'N(t)' },
  },
} as const;

export default function DecaySimulation({ meta }: SimulationComponentProps) {
  const { lang } = useTranslation();
  const c = content[lang];
  const eyebrow = pick(getCategory(meta.category).label, lang);

  const [n0, setN0] = useState(196);
  const [halfLife, setHalfLife] = useState(5);
  const [t, setT] = useState(0);
  const [speed, setSpeed] = useState(1);
  const [playing, setPlaying] = useState(false);

  // Animation : avance t (TMAX parcouru en ~12 s à vitesse 1×).
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1); // plafond anti-saut au retour d'onglet
      last = now;
      setT((prev) => {
        const next = prev + dt * speed * (TMAX / 12);
        if (next >= TMAX) {
          setPlaying(false);
          return TMAX;
        }
        return next;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, speed]);

  const { curve, markers } = useMemo(
    () => ({
      curve: decayCurve(n0, halfLife, TMAX),
      markers: halfLifeMarkers(n0, halfLife, TMAX),
    }),
    [n0, halfLife]
  );

  const fraction = fractionRemaining(halfLife, t);
  const nNow = remaining(n0, halfLife, t);

  const togglePlay = () => {
    if (!playing && t >= TMAX) setT(0);
    setPlaying((p) => !p);
  };
  const reset = () => {
    setPlaying(false);
    setT(0);
  };

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
            label={c.labels.n0}
            value={n0}
            min={16}
            max={400}
            step={1}
            onChange={setN0}
          />
          <Slider
            label={c.labels.halfLife}
            value={halfLife}
            min={1}
            max={20}
            step={0.5}
            onChange={setHalfLife}
            format={(v) => v.toFixed(1)}
          />
          <Slider
            label={c.labels.time}
            value={t}
            min={0}
            max={TMAX}
            step={0.1}
            onChange={(v) => {
              setPlaying(false);
              setT(v);
            }}
            format={(v) => v.toFixed(1)}
          />
          <Slider
            label={c.labels.speed}
            value={speed}
            min={0.5}
            max={5}
            step={0.5}
            onChange={setSpeed}
            format={(v) => `${v.toFixed(1)}×`}
          />
          <PlaybackControls
            playing={playing}
            onToggle={togglePlay}
            onReset={reset}
            labels={c.buttons}
          />
        </div>
      }
      visualization={
        <div className="space-y-4">
          <DecayChart
            data={curve}
            markers={markers}
            currentT={t}
            n0={n0}
            tMax={TMAX}
            labels={c.chart}
            ariaLabel={c.aria}
          />

          {/* Grille de noyaux */}
          <AtomGrid n0={n0} fraction={fraction} />
          <Legend
            items={[
              { color: DECAY_COLORS.curve, label: c.legend.present },
              { color: '#e2e8f0', label: c.legend.decayed },
              { color: DECAY_COLORS.marker, label: c.legend.marker },
            ]}
          />

          <StatList
            items={[
              { label: c.stats.lambda, value: lambda(halfLife).toFixed(3) },
              { label: c.stats.remaining, value: Math.round(nNow).toString(), emphasize: true },
              { label: c.stats.fraction, value: `${(fraction * 100).toFixed(1)} %` },
              { label: c.stats.halfLives, value: (t / halfLife).toFixed(2) },
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
