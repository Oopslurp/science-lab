import { useState } from 'react';
import SimulationSection from '../../components/SimulationSection';
import Slider from '../../components/ui/Slider';
import StatList from '../../components/ui/StatList';
import { useTranslation } from '../../i18n/useTranslation';
import { getCategory } from '../categories';
import { pick, type SimulationComponentProps } from '../types';
import {
  RIEMANN_FUNCTIONS,
  exactIntegral,
  integralError,
  isDomainValid,
  riemannSum,
  type RiemannFunctionId,
  type RiemannMethod,
} from './riemannMath';
import RiemannChart from './RiemannChart';

// Bornes des curseurs (unités sans dimension ; a < b garanti par les min/max dynamiques).
const A_MIN = -3;
const B_MAX = 6;
const STEP = 0.5;
const N_MIN = 1;
const N_MAX = 50;

const METHODS: RiemannMethod[] = ['left', 'right', 'midpoint', 'trapezoid'];
const FUNCTION_IDS: RiemannFunctionId[] = ['square', 'inverse', 'exp', 'sin'];

const content = {
  fr: {
    theory: [
      "La méthode des rectangles approche l'aire sous la courbe de f sur [a, b] en découpant l'intervalle en n sous-intervalles et en sommant des aires de rectangles. Quand n augmente, la somme converge vers l'intégrale exacte.",
      'Trois choix de hauteur : rectangle à gauche, à droite, ou au point milieu de chaque sous-intervalle ; les trapèzes relient les deux extrémités. La valeur exacte est obtenue ici par la primitive F : ∫ₐᵇ f = F(b) − F(a).',
      "Selon le sens de variation de f, les rectangles à gauche et à droite encadrent l'intégrale : là où f est croissante, la droite sur-estime et la gauche sous-estime ; c'est l'inverse là où f est décroissante.",
    ],
    observe: [
      "Augmente n : les rectangles épousent la courbe et la somme se rapproche de la valeur exacte (l'erreur diminue).",
      'Compare gauche et droite sur x² (croissante sur [0, 2]) : la droite est au-dessus, la gauche en dessous de la valeur exacte.',
      'Essaie sin(x) sur [0, 3] (qui change de variation) : la règle « la gauche sous-estime » n’est plus universelle.',
      'Le point milieu et les trapèzes convergent bien plus vite que gauche/droite.',
    ],
    curriculum:
      'Spécialité mathématiques (Analyse — calcul intégral) : méthode des rectangles, encadrement d’une intégrale, et dialogue entre le discret (sommes) et le continu (intégrale).',
    labels: { fn: 'Fonction', a: 'Borne a', b: 'Borne b', n: 'Subdivisions n', method: 'Méthode' },
    methods: { left: 'Gauche', right: 'Droite', midpoint: 'Milieu', trapezoid: 'Trapèzes' },
    stats: { sum: 'Somme approchée', exact: 'Valeur exacte', error: 'Erreur absolue' },
    invalid:
      'La fonction 1/x n’est pas définie sur un intervalle contenant 0. Choisis une borne a > 0.',
    aria: 'Graphe de la fonction et des rectangles d’approximation de l’aire.',
  },
  en: {
    theory: [
      'The rectangle method approximates the area under f on [a, b] by splitting the interval into n subintervals and summing rectangle areas. As n grows, the sum converges to the exact integral.',
      'Three height choices: left, right, or midpoint of each subinterval; trapezoids join the two endpoints. The exact value comes from the antiderivative F: ∫ₐᵇ f = F(b) − F(a).',
      'Depending on whether f increases or decreases, left and right rectangles bracket the integral: where f increases, the right overestimates and the left underestimates; it is the opposite where f decreases.',
    ],
    observe: [
      'Increase n: the rectangles hug the curve and the sum approaches the exact value (error shrinks).',
      'Compare left and right on x² (increasing on [0, 2]): the right is above, the left below the exact value.',
      'Try sin(x) on [0, 3] (which changes monotonicity): the rule “left underestimates” is no longer universal.',
      'Midpoint and trapezoids converge much faster than left/right.',
    ],
    curriculum:
      'Specialty mathematics (Analysis — integral calculus): the rectangle method, bracketing an integral, and the link between discrete (sums) and continuous (integral).',
    labels: { fn: 'Function', a: 'Bound a', b: 'Bound b', n: 'Subdivisions n', method: 'Method' },
    methods: { left: 'Left', right: 'Right', midpoint: 'Midpoint', trapezoid: 'Trapezoids' },
    stats: { sum: 'Approximate sum', exact: 'Exact value', error: 'Absolute error' },
    invalid: 'The function 1/x is undefined on an interval containing 0. Choose a lower bound a > 0.',
    aria: 'Graph of the function and the area-approximation rectangles.',
  },
} as const;

function fmt(v: number): string {
  if (!Number.isFinite(v)) return '—';
  return Math.abs(v) >= 1000 ? v.toExponential(2) : v.toFixed(4);
}

export default function RiemannSimulation({ meta }: SimulationComponentProps) {
  const { lang } = useTranslation();
  const c = content[lang];
  const eyebrow = pick(getCategory(meta.category).label, lang);

  const [funcId, setFuncId] = useState<RiemannFunctionId>('square');
  const [a, setA] = useState(0);
  const [b, setB] = useState(2);
  const [n, setN] = useState(8);
  const [method, setMethod] = useState<RiemannMethod>('left');

  const fn = RIEMANN_FUNCTIONS[funcId];
  const valid = isDomainValid(fn, a, b);

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
                <SegButton key={id} active={id === funcId} onClick={() => setFuncId(id)}>
                  {RIEMANN_FUNCTIONS[id].expr}
                </SegButton>
              ))}
            </div>
          </div>

          <Slider
            label={c.labels.a}
            value={a}
            min={A_MIN}
            max={b - STEP}
            step={STEP}
            onChange={setA}
            format={(v) => v.toFixed(1)}
          />
          <Slider
            label={c.labels.b}
            value={b}
            min={a + STEP}
            max={B_MAX}
            step={STEP}
            onChange={setB}
            format={(v) => v.toFixed(1)}
          />
          <Slider label={c.labels.n} value={n} min={N_MIN} max={N_MAX} step={1} onChange={setN} />

          {/* Méthode */}
          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700">{c.labels.method}</span>
            <div className="flex flex-wrap gap-2">
              {METHODS.map((m) => (
                <SegButton key={m} active={m === method} onClick={() => setMethod(m)}>
                  {c.methods[m]}
                </SegButton>
              ))}
            </div>
          </div>
        </div>
      }
      visualization={
        valid ? (
          <div className="space-y-4">
            <RiemannChart fn={fn} a={a} b={b} n={n} method={method} ariaLabel={c.aria} />
            <StatList
              items={[
                { label: c.stats.sum, value: fmt(riemannSum(fn, a, b, n, method)), emphasize: true },
                { label: c.stats.exact, value: fmt(exactIntegral(fn, a, b)) },
                { label: c.stats.error, value: fmt(integralError(fn, a, b, n, method)) },
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
