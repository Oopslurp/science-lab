import { useEffect, useMemo, useRef, useState } from 'react';
import SimulationSection from '../../components/SimulationSection';
import Slider from '../../components/ui/Slider';
import Legend from '../../components/ui/Legend';
import StatList from '../../components/ui/StatList';
import PlaybackControls from '../../components/ui/PlaybackControls';
import { useTranslation } from '../../i18n/useTranslation';
import { getCategory } from '../categories';
import { pick, type SimulationComponentProps } from '../types';
import {
  MAX_ANIMATED_BALLS,
  binomialDistribution,
  binomialMean,
  binomialStdDev,
} from './galtonMath';
import GaltonBoard, { GALTON_COLORS, GALTON_ENTRY_DEPTH, type BallView } from './GaltonBoard';

const INITIAL_N = 10;
const FALL_SECONDS = 1.4; // durée de chute d'une bille à travers les rangées
const SPAWN_INTERVAL = 0.12; // période d'émission des billes (s)
const BATCH = 200; // bouton « lâcher d'un coup »

interface Ball {
  id: number;
  path: number[];
  d: number;
}

const content = {
  fr: {
    theory: [
      'La planche de Galton illustre la loi binomiale. Une bille tombe à travers n rangées de clous ; à chaque clou elle part à droite avec la probabilité p, à gauche sinon. Le numéro de la case d’arrivée k est le nombre de fois où elle est allée à droite.',
      'La probabilité de finir dans la case k suit la loi binomiale P(X = k) = C(n, k)·pᵏ·(1−p)^(n−k), d’espérance μ = n·p et d’écart-type σ = √(n·p·(1−p)). En accumulant beaucoup de billes, l’histogramme épouse cette loi (loi des grands nombres).',
      'Pour n grand, la loi binomiale prend la forme d’une cloche : c’est son approximation par la loi normale N(μ, σ) (théorème central limite). Avec p = 0,5 la distribution est symétrique ; en décalant p elle se déforme mais tend toujours vers une cloche.',
    ],
    observe: [
      'Lâche des billes : l’histogramme (barres indigo) se construit case par case et se rapproche de la loi binomiale (verte).',
      'Augmente le nombre de rangées n : la distribution s’élargit et épouse de mieux en mieux la cloche normale (ambre).',
      'Change p : le sommet se décale vers μ = n·p (à droite si p > 0,5) et la binomiale devient dissymétrique, tout en restant proche de la normale.',
      'Plus tu lâches de billes, plus l’écart entre l’histogramme et la loi théorique se réduit — c’est la loi des grands nombres en action.',
    ],
    curriculum:
      'Terminale spécialité mathématiques : loi binomiale, coefficient binomial, espérance et écart-type, et approximation par la loi normale — la planche de Galton modélise n épreuves de Bernoulli indépendantes.',
    labels: { n: 'Rangées n', p: 'Probabilité à droite p', batch: `Lâcher ${BATCH}` },
    buttons: { play: '▶ Lâcher', pause: '❚❚ Pause', reset: '↺ Vider' },
    legend: { bar: 'Histogramme observé', binomial: 'Loi binomiale', normal: 'Approx. normale' },
    stats: { total: 'Billes lâchées', mean: 'Moyenne μ = n·p', sd: 'Écart-type σ', observed: 'Moyenne observée' },
    aria: 'Planche de Galton : billes tombant à travers les clous et histogramme des cases d’arrivée.',
  },
  en: {
    theory: [
      'The Galton board illustrates the binomial distribution. A ball falls through n rows of pegs; at each peg it goes right with probability p, otherwise left. The arrival bin k is the number of times it went right.',
      'The probability of ending in bin k follows the binomial law P(X = k) = C(n, k)·pᵏ·(1−p)^(n−k), with mean μ = n·p and standard deviation σ = √(n·p·(1−p)). As many balls accumulate, the histogram matches this law (law of large numbers).',
      'For large n, the binomial law takes a bell shape: its approximation by the normal law N(μ, σ) (central limit theorem). With p = 0.5 the distribution is symmetric; shifting p skews it but it still tends to a bell.',
    ],
    observe: [
      'Drop balls: the histogram (indigo bars) builds bin by bin and approaches the binomial law (green).',
      'Increase the number of rows n: the distribution widens and matches the normal bell (amber) better and better.',
      'Change p: the peak shifts towards μ = n·p (right if p > 0.5) and the binomial becomes skewed, while staying close to the normal.',
      'The more balls you drop, the smaller the gap between the histogram and the theoretical law — the law of large numbers at work.',
    ],
    curriculum:
      'Final-year specialty mathematics: binomial distribution, binomial coefficient, mean and standard deviation, and the normal approximation — the Galton board models n independent Bernoulli trials.',
    labels: { n: 'Rows n', p: 'Probability right p', batch: `Drop ${BATCH}` },
    buttons: { play: '▶ Drop', pause: '❚❚ Pause', reset: '↺ Clear' },
    legend: { bar: 'Observed histogram', binomial: 'Binomial law', normal: 'Normal approx.' },
    stats: { total: 'Balls dropped', mean: 'Mean μ = n·p', sd: 'Std deviation σ', observed: 'Observed mean' },
    aria: 'Galton board: balls falling through pegs and histogram of arrival bins.',
  },
} as const;

interface View {
  bins: number[];
  balls: BallView[];
}

export default function GaltonSimulation({ meta }: SimulationComponentProps) {
  const { lang } = useTranslation();
  const c = content[lang];
  const eyebrow = pick(getCategory(meta.category).label, lang);

  const [n, setN] = useState(INITIAL_N);
  const [p, setP] = useState(0.5);
  const [playing, setPlaying] = useState(false);
  const [view, setView] = useState<View>(() => ({ bins: new Array(INITIAL_N + 1).fill(0), balls: [] }));

  // Lus dans la boucle sans la relancer à chaque réglage.
  const nRef = useRef(n);
  nRef.current = n;
  const pRef = useRef(p);
  pRef.current = p;

  const binsRef = useRef<number[]>(new Array(INITIAL_N + 1).fill(0));
  const ballsRef = useRef<Ball[]>([]);
  const idRef = useRef(0);
  const spawnAccRef = useRef(0);

  const syncView = () =>
    setView({
      bins: [...binsRef.current],
      balls: ballsRef.current.map((b) => ({ id: b.id, path: b.path, d: b.d })),
    });

  // Changer n ou p réinitialise le comptage (la loi change).
  useEffect(() => {
    binsRef.current = new Array(n + 1).fill(0);
    ballsRef.current = [];
    spawnAccRef.current = 0;
    setView({ bins: [...binsRef.current], balls: [] });
  }, [n, p]);

  // Animation : émission + chute des billes.
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1); // plafond anti-saut au retour d'onglet
      last = now;

      spawnAccRef.current += dt;
      while (spawnAccRef.current >= SPAWN_INTERVAL && ballsRef.current.length < MAX_ANIMATED_BALLS) {
        spawnAccRef.current -= SPAWN_INTERVAL;
        const path: number[] = [];
        for (let i = 0; i < nRef.current; i++) path.push(Math.random() < pRef.current ? 1 : 0);
        ballsRef.current.push({ id: idRef.current++, path, d: -GALTON_ENTRY_DEPTH }); // apparaît au-dessus
      }

      const speed = nRef.current / FALL_SECONDS;
      const remaining: Ball[] = [];
      for (const b of ballsRef.current) {
        b.d += speed * dt;
        if (b.d >= nRef.current) {
          const bin = b.path.reduce((a, x) => a + x, 0);
          if (binsRef.current[bin] !== undefined) binsRef.current[bin] += 1;
        } else {
          remaining.push(b);
        }
      }
      ballsRef.current = remaining;
      syncView();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  // Lâcher d'un coup (comptage instantané, sans animation).
  const dropBatch = () => {
    for (let i = 0; i < BATCH; i++) {
      let rights = 0;
      for (let j = 0; j < n; j++) if (Math.random() < p) rights += 1;
      binsRef.current[rights] += 1;
    }
    syncView();
  };

  const reset = () => {
    setPlaying(false);
    binsRef.current = new Array(n + 1).fill(0);
    ballsRef.current = [];
    spawnAccRef.current = 0;
    setView({ bins: [...binsRef.current], balls: [] });
  };

  const distribution = useMemo(() => binomialDistribution(n, p), [n, p]);
  const mu = binomialMean(n, p);
  const sigma = binomialStdDev(n, p);
  const total = view.bins.reduce((a, b) => a + b, 0);
  const observedMean = total > 0 ? view.bins.reduce((a, b, k) => a + k * b, 0) / total : 0;

  return (
    <SimulationSection
      id={meta.id}
      eyebrow={eyebrow}
      title={pick(meta.title, lang)}
      description={pick(meta.description, lang)}
      theory={
        <div className="space-y-3">
          {c.theory.map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      }
      controls={
        <div className="space-y-5">
          <Slider label={c.labels.n} value={n} min={4} max={12} step={1} onChange={setN} />
          <Slider
            label={c.labels.p}
            value={p}
            min={0.1}
            max={0.9}
            step={0.05}
            onChange={setP}
            format={(v) => v.toFixed(2)}
          />
          <PlaybackControls
            playing={playing}
            onToggle={() => setPlaying((prev) => !prev)}
            onReset={reset}
            labels={c.buttons}
          />
          <button
            type="button"
            onClick={dropBatch}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            {c.labels.batch}
          </button>
        </div>
      }
      visualization={
        <div className="space-y-4">
          <GaltonBoard
            n={n}
            bins={view.bins}
            total={total}
            distribution={distribution}
            mu={mu}
            sigma={sigma}
            balls={view.balls}
            ariaLabel={c.aria}
          />
          <Legend
            items={[
              { color: GALTON_COLORS.bar, label: c.legend.bar, variant: 'dot' },
              { color: GALTON_COLORS.binomial, label: c.legend.binomial, variant: 'line' },
              { color: GALTON_COLORS.normal, label: c.legend.normal, variant: 'line', dashed: true },
            ]}
          />
          <StatList
            items={[
              { label: c.stats.total, value: String(total) },
              { label: c.stats.mean, value: mu.toFixed(2) },
              { label: c.stats.sd, value: sigma.toFixed(2) },
              { label: c.stats.observed, value: total > 0 ? observedMean.toFixed(2) : '—', emphasize: true },
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
