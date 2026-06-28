import { useState } from 'react';
import SimulationSection from '../../components/SimulationSection';
import Slider from '../../components/ui/Slider';
import Legend from '../../components/ui/Legend';
import StatList from '../../components/ui/StatList';
import { useTranslation } from '../../i18n/useTranslation';
import { getCategory } from '../categories';
import { pick, type SimulationComponentProps } from '../types';
import {
  CONVEXITY_FUNCTIONS,
  convexitySign,
  osculatingCircle,
  snapToInflection,
  type ConvexityFunctionId,
} from './convexityMath';
import ConvexityPlot, { CONVEXITY_COLORS } from './ConvexityPlot';

const FUNCTION_IDS: ConvexityFunctionId[] = ['cubic', 'quartic', 'sine', 'exp'];

const content = {
  fr: {
    theory: [
      'Une fonction est convexe sur un intervalle si sa courbe reste au-dessus de chacune de ses tangentes (elle « tourne » vers le haut) ; elle est concave si la courbe reste en dessous. Critère pratique : f est convexe là où f″ ≥ 0, concave là où f″ ≤ 0.',
      'Un point d’inflexion est un point où la convexité change : la tangente y traverse la courbe, et f″ s’y annule en changeant de signe. On le trouve exactement en résolvant f″(x) = 0.',
      'Attention : f″(x₀) = 0 ne suffit pas, il faut un changement de signe. Et certaines fonctions n’ont aucun point d’inflexion — par exemple eˣ, dont f″ = eˣ > 0 partout : convexe sur ℝ tout entier.',
      'Complément visuel (hors-programme à ce niveau, mais correct) : le cercle osculateur est le cercle qui épouse le mieux la courbe en x₀ (même tangente ET même courbure), de rayon R = (1 + f′²)^{3/2} / |f″|, centré du côté où la courbe se creuse. Près d’une inflexion, f″ → 0 donc R → ∞ : le cercle enfle puis disparaît — autre façon de « voir » que la convexité s’inverse.',
    ],
    observe: [
      'Déplace x₀ : la tangente reste sous la courbe là où f est convexe (tronçon indigo, f″ > 0) et au-dessus là où f est concave (tronçon ambre, f″ < 0).',
      'Aux points d’inflexion (cercles), la couleur de la courbe change et la tangente traverse la courbe.',
      'Lis f″(x₀) : son signe donne directement la convexité au point ; à l’inflexion, f″(x₀) = 0.',
      'Choisis eˣ : la courbe est entièrement convexe, sans aucun point d’inflexion — un contre-exemple utile.',
    ],
    curriculum:
      'Terminale spécialité mathématiques (Analyse) : convexité et concavité, lien avec le signe de la dérivée seconde f″, position relative de la courbe et de ses tangentes, et points d’inflexion.',
    labels: { fn: 'Fonction', x0: 'Point x₀' },
    interval: 'Courbe tracée seulement sur l’intervalle',
    stats: { title: 'Au point x₀ =', fx: 'f(x₀)', d1: 'f′(x₀) (pente)', d2: 'f″(x₀)', state: 'Convexité', radius: 'Rayon de courbure R' },
    states: { convex: 'convexe', concave: 'concave', inflection: 'inflexion' },
    legend: {
      convex: 'Convexe (f″ > 0)',
      concave: 'Concave (f″ < 0)',
      tangent: 'Tangente en x₀',
      inflection: 'Point d’inflexion',
      osculating: 'Cercle osculateur',
    },
    aria: 'Courbe colorée selon la convexité, sa tangente au point x₀ et ses points d’inflexion.',
  },
  en: {
    theory: [
      'A function is convex on an interval if its curve stays above each of its tangents (it “turns” upward); it is concave if the curve stays below. Practical test: f is convex where f″ ≥ 0, concave where f″ ≤ 0.',
      'An inflection point is where convexity changes: the tangent crosses the curve there, and f″ vanishes while changing sign. It is found exactly by solving f″(x) = 0.',
      'Careful: f″(x₀) = 0 is not enough, a sign change is required. And some functions have no inflection point at all — for instance eˣ, whose f″ = eˣ > 0 everywhere: convex over all of ℝ.',
      'Visual extra (beyond the syllabus at this level, but correct): the osculating circle is the circle that best hugs the curve at x₀ (same tangent AND same curvature), of radius R = (1 + f′²)^{3/2} / |f″|, centred on the side the curve bends towards. Near an inflection, f″ → 0 so R → ∞: the circle swells then vanishes — another way to “see” convexity flip.',
    ],
    observe: [
      'Move x₀: the tangent stays below the curve where f is convex (indigo segment, f″ > 0) and above where f is concave (amber segment, f″ < 0).',
      'At inflection points (circles), the curve colour switches and the tangent crosses the curve.',
      'Read f″(x₀): its sign gives the convexity at the point directly; at an inflection, f″(x₀) = 0.',
      'Pick eˣ: the curve is entirely convex, with no inflection point at all — a useful counter-example.',
    ],
    curriculum:
      'Final-year specialty mathematics (Analysis): convexity and concavity, link with the sign of the second derivative f″, relative position of the curve and its tangents, and inflection points.',
    labels: { fn: 'Function', x0: 'Point x₀' },
    interval: 'Curve drawn only on the interval',
    stats: { title: 'At point x₀ =', fx: 'f(x₀)', d1: 'f′(x₀) (slope)', d2: 'f″(x₀)', state: 'Convexity', radius: 'Radius of curvature R' },
    states: { convex: 'convex', concave: 'concave', inflection: 'inflection' },
    legend: {
      convex: 'Convex (f″ > 0)',
      concave: 'Concave (f″ < 0)',
      tangent: 'Tangent at x₀',
      inflection: 'Inflection point',
      osculating: 'Osculating circle',
    },
    aria: 'Curve coloured by convexity, its tangent at point x₀ and its inflection points.',
  },
} as const;

function fmt(v: number): string {
  if (!Number.isFinite(v)) return '—';
  const a = Math.abs(v);
  if (a < 1e-9) return '0'; // arrondit l'epsilon machine (ex. f″ aux inflexions)
  if (a >= 1e4 || a < 1e-3) return v.toExponential(2);
  return v.toFixed(3);
}

/** Borne d'intervalle : entier tel quel, sinon une décimale. */
function bound(v: number): string {
  return Number.isInteger(v) ? String(v) : v.toFixed(1);
}

export default function ConvexitySimulation({ meta }: SimulationComponentProps) {
  const { lang } = useTranslation();
  const c = content[lang];
  const eyebrow = pick(getCategory(meta.category).label, lang);

  const [funcId, setFuncId] = useState<ConvexityFunctionId>('cubic');
  const fn = CONVEXITY_FUNCTIONS[funcId];
  const [x0, setX0] = useState(fn.defaultX0);

  const selectFn = (id: ConvexityFunctionId) => {
    setFuncId(id);
    setX0(CONVEXITY_FUNCTIONS[id].defaultX0);
  };

  const sign = convexitySign(fn, x0);
  const stateLabel = sign === 0 ? c.states.inflection : sign > 0 ? c.states.convex : c.states.concave;
  const circle = osculatingCircle(fn, x0); // null à l'inflexion ⇒ rayon infini

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
                  {CONVEXITY_FUNCTIONS[id].expr}
                </SegButton>
              ))}
            </div>
          </div>

          <Slider
            label={c.labels.x0}
            value={x0}
            min={fn.domainA}
            max={fn.domainB}
            step={0.1}
            onChange={(v) => setX0(snapToInflection(fn, v))}
            format={(v) => v.toFixed(1)}
          />
        </div>
      }
      visualization={
        <div className="space-y-4">
          <ConvexityPlot fn={fn} x0={x0} ariaLabel={c.aria} />

          <p className="text-center text-xs text-slate-500">
            {c.interval} [{bound(fn.domainA)} ; {bound(fn.domainB)}]
          </p>

          <Legend
            items={[
              { color: CONVEXITY_COLORS.convex, label: c.legend.convex, variant: 'line' },
              { color: CONVEXITY_COLORS.concave, label: c.legend.concave, variant: 'line' },
              { color: CONVEXITY_COLORS.tangent, label: c.legend.tangent, variant: 'line', dashed: true },
              { color: CONVEXITY_COLORS.osculating, label: c.legend.osculating, variant: 'line' },
              { color: '#0f172a', label: c.legend.inflection, variant: 'dot' },
            ]}
          />

          <StatList
            title={`${c.stats.title} ${x0.toFixed(1)}`}
            items={[
              { label: c.stats.fx, value: fmt(fn.f(x0)) },
              { label: c.stats.d1, value: fmt(fn.d1(x0)) },
              { label: c.stats.d2, value: fmt(fn.d2(x0)) },
              { label: c.stats.state, value: stateLabel, emphasize: true },
              { label: c.stats.radius, value: circle ? fmt(circle.r) : '∞' },
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
