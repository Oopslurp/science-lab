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
  BISECTION_FUNCTIONS,
  MAX_ITER,
  bisectionSteps,
  type BisectionFunctionId,
} from './bisectionMath';
import BisectionPlot, { BISECTION_COLORS } from './BisectionPlot';

// Fenêtre des bornes : a ≥ 0 garantit que chaque fonction n'a qu'UNE racine dans
// l'intervalle accessible (l'erreur affichée vise donc toujours la bonne racine).
const A_MIN = 0;
const B_MAX = 4;
const STEP = 0.1;

// Cadence de lecture automatique : une bissection toutes les STEP_MS.
const STEP_MS = 650;

const FUNCTION_IDS: BisectionFunctionId[] = ['sqrt2', 'plastic', 'dottie', 'ln3'];

const content = {
  fr: {
    theory: [
      "La méthode de dichotomie cherche une solution de f(x) = 0 sur un intervalle [a, b] où f change de signe. D'après le théorème des valeurs intermédiaires, si f est continue et f(a)·f(b) < 0, alors f s'annule au moins une fois entre a et b.",
      'À chaque étape on calcule le milieu m = (a + b)/2 et le signe de f(m), puis on garde la moitié de l’intervalle où le signe change encore : [a, m] ou [m, b]. La largeur de l’encadrement est ainsi divisée par 2 à chaque itération.',
      'La convergence est lente mais garantie : il faut environ une itération par chiffre binaire de précision (≈ 3,3 par chiffre décimal). D’autres méthodes (Newton) vont plus vite, mais sans garantir d’encadrement — ici on privilégie la sûreté.',
    ],
    observe: [
      "Augmente le nombre d’itérations (ou lance la lecture) : l’encadrement [a, b] se resserre autour de la racine, sa largeur étant divisée par 2 à chaque pas.",
      'Regarde f(xₙ) : son signe décide quelle moitié on conserve. Le milieu xₙ est l’approximation courante de la racine.',
      'L’erreur |xₙ − r| décroît très régulièrement (géométriquement) — chaque itération gagne un chiffre binaire, quelle que soit la fonction.',
      'Choisis a et b donnant à f le même signe : il n’y a plus de changement de signe, le TVI ne s’applique pas et la méthode ne peut pas démarrer.',
    ],
    curriculum:
      'Terminale spécialité mathématiques (Analyse — algorithmique) : recherche d’une solution approchée de f(x) = 0 par dichotomie, en appui sur le théorème des valeurs intermédiaires ; convergence et encadrement.',
    labels: { fn: 'Fonction', a: 'Borne a', b: 'Borne b', iter: 'Itérations n' },
    stats: { title: 'Après n =', approx: 'Approximation xₙ', fm: 'f(xₙ)', width: 'Largeur [a, b]', error: 'Erreur |xₙ − r|' },
    legend: { curve: 'f(x)', bracket: 'Encadrement [a, b] et milieu', root: 'Racine (cible)' },
    invalid:
      'Pas de changement de signe : f(a) et f(b) ont le même signe sur [a, b]. Choisis un intervalle où f(a)·f(b) < 0 pour que la dichotomie démarre.',
    playback: { play: 'Lecture', pause: 'Pause', reset: 'Réinitialiser' },
    aria: 'Graphe de f, de l’intervalle d’encadrement et du point milieu de la dichotomie.',
  },
  en: {
    theory: [
      'The bisection method looks for a solution of f(x) = 0 on an interval [a, b] where f changes sign. By the intermediate value theorem, if f is continuous and f(a)·f(b) < 0, then f has at least one zero between a and b.',
      'At each step we compute the midpoint m = (a + b)/2 and the sign of f(m), then keep the half-interval where the sign still changes: [a, m] or [m, b]. The width of the bracket is thus halved at every iteration.',
      'Convergence is slow but guaranteed: about one iteration per binary digit of precision (≈ 3.3 per decimal digit). Other methods (Newton) are faster but give no bracket guarantee — here we favour reliability.',
    ],
    observe: [
      'Increase the number of iterations (or press play): the bracket [a, b] tightens around the root, its width halved at each step.',
      'Watch f(xₙ): its sign decides which half is kept. The midpoint xₙ is the current approximation of the root.',
      'The error |xₙ − r| shrinks very steadily (geometrically) — each iteration gains one binary digit, whatever the function.',
      'Pick a and b giving f the same sign: there is no longer a sign change, the IVT does not apply and the method cannot start.',
    ],
    curriculum:
      'Final-year specialty mathematics (Analysis — algorithmics): approximate solution of f(x) = 0 by bisection, based on the intermediate value theorem; convergence and bracketing.',
    labels: { fn: 'Function', a: 'Bound a', b: 'Bound b', iter: 'Iterations n' },
    stats: { title: 'After n =', approx: 'Approximation xₙ', fm: 'f(xₙ)', width: 'Width [a, b]', error: 'Error |xₙ − r|' },
    legend: { curve: 'f(x)', bracket: 'Bracket [a, b] and midpoint', root: 'Root (target)' },
    invalid:
      'No sign change: f(a) and f(b) have the same sign on [a, b]. Choose an interval where f(a)·f(b) < 0 so bisection can start.',
    playback: { play: 'Play', pause: 'Pause', reset: 'Reset' },
    aria: 'Graph of f, of the bracketing interval and of the bisection midpoint.',
  },
} as const;

function fmt(v: number): string {
  if (!Number.isFinite(v)) return '—';
  const a = Math.abs(v);
  if (a !== 0 && (a >= 1e4 || a < 1e-4)) return v.toExponential(2);
  return v.toFixed(6);
}

export default function BisectionSimulation({ meta }: SimulationComponentProps) {
  const { lang } = useTranslation();
  const c = content[lang];
  const eyebrow = pick(getCategory(meta.category).label, lang);

  const [funcId, setFuncId] = useState<BisectionFunctionId>('sqrt2');
  const [a, setA] = useState(BISECTION_FUNCTIONS.sqrt2.defaultA);
  const [b, setB] = useState(BISECTION_FUNCTIONS.sqrt2.defaultB);
  const [iter, setIter] = useState(0);
  const [playing, setPlaying] = useState(false);

  const fn = BISECTION_FUNCTIONS[funcId];
  const steps = useMemo(() => bisectionSteps(fn.f, a, b, MAX_ITER), [fn, a, b]);
  const valid = steps.length > 0;
  const maxIndex = Math.max(0, steps.length - 1);
  const current = valid ? steps[Math.min(iter, maxIndex)] : null;

  // Sélection d'une fonction : repart de son encadrement par défaut.
  const selectFn = (id: BisectionFunctionId) => {
    const f = BISECTION_FUNCTIONS[id];
    setFuncId(id);
    setA(f.defaultA);
    setB(f.defaultB);
    setIter(0);
    setPlaying(false);
  };

  // Garde l'itération dans les bornes quand l'encadrement change.
  useEffect(() => {
    setIter((i) => Math.min(i, maxIndex));
  }, [maxIndex]);

  // Arrêt de la lecture en fin de course (ou si l'encadrement devient invalide).
  useEffect(() => {
    if (playing && iter >= maxIndex) setPlaying(false);
  }, [playing, iter, maxIndex]);

  // Lecture automatique : avance d'une bissection toutes les STEP_MS (rAF + accumulateur).
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    let acc = 0;
    const tick = (now: number) => {
      acc += Math.min(now - last, 200); // plafond anti-saut au retour d'onglet
      last = now;
      if (acc >= STEP_MS) {
        acc = 0;
        setIter((i) => Math.min(maxIndex, i + 1));
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, maxIndex]);

  const togglePlay = () => {
    if (!playing && iter >= maxIndex) setIter(0); // relance depuis le début
    setPlaying((p) => !p);
  };
  const reset = () => {
    setPlaying(false);
    setIter(0);
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
          {/* Sélecteur de fonction */}
          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700">{c.labels.fn}</span>
            <div className="flex flex-wrap gap-2">
              {FUNCTION_IDS.map((id) => (
                <SegButton key={id} active={id === funcId} onClick={() => selectFn(id)}>
                  {BISECTION_FUNCTIONS[id].expr}
                </SegButton>
              ))}
            </div>
          </div>

          <Slider
            label={c.labels.a}
            value={a}
            min={A_MIN}
            max={Math.max(A_MIN, b - STEP)}
            step={STEP}
            onChange={(v) => {
              setA(v);
              setPlaying(false);
            }}
            format={(v) => v.toFixed(1)}
          />
          <Slider
            label={c.labels.b}
            value={b}
            min={Math.min(B_MAX, a + STEP)}
            max={B_MAX}
            step={STEP}
            onChange={(v) => {
              setB(v);
              setPlaying(false);
            }}
            format={(v) => v.toFixed(1)}
          />
          <Slider
            label={c.labels.iter}
            value={Math.min(iter, maxIndex)}
            min={0}
            max={MAX_ITER}
            step={1}
            onChange={(v) => {
              setIter(v);
              setPlaying(false);
            }}
          />

          <PlaybackControls
            playing={playing}
            onToggle={togglePlay}
            onReset={reset}
            labels={c.playback}
          />
        </div>
      }
      visualization={
        valid && current ? (
          <div className="space-y-4">
            <BisectionPlot fn={fn} a={a} b={b} step={current} ariaLabel={c.aria} />

            <Legend
              items={[
                { color: BISECTION_COLORS.curve, label: c.legend.curve, variant: 'line' },
                { color: BISECTION_COLORS.bracket, label: c.legend.bracket, variant: 'line' },
                { color: BISECTION_COLORS.root, label: c.legend.root, variant: 'line', dashed: true },
              ]}
            />

            <StatList
              title={`${c.stats.title} ${Math.min(iter, maxIndex)}`}
              items={[
                { label: c.stats.approx, value: fmt(current.m), emphasize: true },
                { label: c.stats.fm, value: fmt(current.fm) },
                { label: c.stats.width, value: fmt(current.width) },
                { label: c.stats.error, value: fmt(Math.abs(current.m - fn.root)) },
              ]}
            />
          </div>
        ) : (
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
            {c.invalid}
          </div>
        )
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

function SegButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={
        'rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ' +
        (active
          ? 'border-slate-900 bg-slate-900 text-white'
          : 'border-slate-300 text-slate-600 hover:bg-slate-100')
      }
    >
      {children}
    </button>
  );
}
