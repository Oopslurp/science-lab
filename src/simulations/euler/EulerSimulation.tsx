import { useMemo, useState } from 'react';
import SimulationSection from '../../components/SimulationSection';
import Slider from '../../components/ui/Slider';
import { useTranslation } from '../../i18n/useTranslation';
import { pick, type SimulationComponentProps } from '../types';
import { getCategory } from '../categories';
import { eulerPoints, exactPoints, errorSummary, type EulerParams } from './eulerMath';
import EulerChart, { COLORS } from './EulerChart';

// Textes propres à la simulation, co-localisés (sélectionnés via la langue active).
const content = {
  fr: {
    theory: [
      "La méthode d'Euler approche pas à pas la solution d'une équation différentielle. On résout ici y′ = k·y, dont la solution exacte est y(x) = y₀·e^(k·x).",
      "En partant de (0, y₀), on avance par petits segments de pente y′ : y_{i+1} = y_i + h·(k·y_i). Plus le pas h est petit, plus la ligne brisée colle à la courbe exacte.",
      "⚠️ C'est une illustration abstraite de l'erreur numérique, pas un phénomène physique : on étudie la qualité de l'approximation, pas des atomes (voir la simulation suivante pour un vrai cas physique).",
    ],
    observe: [
      "Diminuez le pas h (ou augmentez le nombre de pas) : la ligne brisée d'Euler se rapproche de la courbe exacte.",
      "Avec un grand pas h, l'écart entre les deux courbes (en pointillés rouges) devient net et s'accumule le long de x.",
      'Pour k > 0 (croissance), Euler sous-estime la solution exacte ; pour k < 0, la solution décroît vers 0.',
      'Poussez k < 0 avec un grand h : Euler peut devenir négatif — un comportement impossible pour une vraie exponentielle.',
    ],
    curriculum:
      "Terminale spécialité mathématiques : méthode d'Euler pour la résolution approchée des équations différentielles du type y′ = a·y, et lien avec la fonction exponentielle, unique solution de y′ = k·y vérifiant y(0) = y₀.",
    labels: {
      y0: 'Valeur initiale y₀',
      k: 'Paramètre k',
      h: 'Pas h',
      steps: 'Nombre de pas',
    },
    legend: {
      exact: 'Solution exacte y₀·e^(k·x)',
      euler: "Méthode d'Euler",
      error: "Erreur (écart à chaque pas)",
    },
    stats: {
      title: 'Au point final x =',
      exact: 'Exacte',
      euler: 'Euler',
      abs: 'Erreur absolue',
      rel: 'Erreur relative',
    },
  },
  en: {
    theory: [
      "Euler's method approximates the solution of a differential equation step by step. Here we solve y′ = k·y, whose exact solution is y(x) = y₀·e^(k·x).",
      'Starting from (0, y₀), we advance with short segments of slope y′: y_{i+1} = y_i + h·(k·y_i). The smaller the step h, the closer the broken line follows the exact curve.',
      '⚠️ This is an abstract illustration of numerical error, not a physical phenomenon: we study approximation quality, not atoms (see the next simulation for a real physical case).',
    ],
    observe: [
      "Decrease the step h (or increase the number of steps): Euler's broken line gets closer to the exact curve.",
      'With a large step h, the gap between the two curves (red dashed) becomes clear and accumulates along x.',
      'For k > 0 (growth), Euler underestimates the exact solution; for k < 0, the solution decays toward 0.',
      'Push k < 0 with a large h: Euler can go negative — impossible for a true exponential.',
    ],
    curriculum:
      "Final-year specialty mathematics: Euler's method for the approximate solution of differential equations of the form y′ = a·y, and its link to the exponential function, the unique solution of y′ = k·y with y(0) = y₀.",
    labels: {
      y0: 'Initial value y₀',
      k: 'Parameter k',
      h: 'Step size h',
      steps: 'Number of steps',
    },
    legend: {
      exact: 'Exact solution y₀·e^(k·x)',
      euler: "Euler's method",
      error: 'Error (gap at each step)',
    },
    stats: {
      title: 'At final point x =',
      exact: 'Exact',
      euler: 'Euler',
      abs: 'Absolute error',
      rel: 'Relative error',
    },
  },
} as const;

const DEFAULTS: EulerParams = { y0: 1, k: 0.8, h: 0.5, steps: 8 };

function fmtNum(v: number): string {
  const a = Math.abs(v);
  if (a !== 0 && (a >= 10000 || a < 0.001)) return v.toExponential(2);
  return v.toFixed(a >= 100 ? 1 : 3);
}

export default function EulerSimulation({ meta }: SimulationComponentProps) {
  const { lang } = useTranslation();
  const c = content[lang];
  const eyebrow = pick(getCategory(meta.category).label, lang);

  const [params, setParams] = useState<EulerParams>(DEFAULTS);
  const set = <K extends keyof EulerParams>(key: K, value: number) =>
    setParams((prev) => ({ ...prev, [key]: value }));

  const { eulerPts, exactPts, err } = useMemo(() => {
    const xMax = params.steps * params.h;
    return {
      eulerPts: eulerPoints(params),
      exactPts: exactPoints(params.y0, params.k, xMax),
      err: errorSummary(params),
    };
  }, [params]);

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
            label={c.labels.y0}
            value={params.y0}
            min={0.5}
            max={5}
            step={0.5}
            onChange={(v) => set('y0', v)}
            format={(v) => v.toFixed(1)}
          />
          <Slider
            label={c.labels.k}
            value={params.k}
            min={-1.5}
            max={1.5}
            step={0.1}
            onChange={(v) => set('k', v)}
            format={(v) => v.toFixed(1)}
          />
          <Slider
            label={c.labels.h}
            value={params.h}
            min={0.05}
            max={1}
            step={0.05}
            onChange={(v) => set('h', v)}
            format={(v) => v.toFixed(2)}
          />
          <Slider
            label={c.labels.steps}
            value={params.steps}
            min={1}
            max={20}
            step={1}
            onChange={(v) => set('steps', v)}
          />
        </div>
      }
      visualization={
        <div className="space-y-4">
          <EulerChart eulerPts={eulerPts} exactPts={exactPts} y0={params.y0} k={params.k} />

          {/* Légende */}
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-600">
            <LegendItem color={COLORS.exact} label={c.legend.exact} />
            <LegendItem color={COLORS.euler} label={c.legend.euler} dotted={false} />
            <LegendItem color={COLORS.error} label={c.legend.error} dotted />
          </div>

          {/* Statistiques d'erreur au point final */}
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              {c.stats.title} {err.xMax.toFixed(2)}
            </p>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-sm tabular-nums sm:grid-cols-4">
              <Stat label={c.stats.exact} value={fmtNum(err.exactValue)} />
              <Stat label={c.stats.euler} value={fmtNum(err.eulerValue)} />
              <Stat label={c.stats.abs} value={fmtNum(err.absolute)} />
              <Stat
                label={c.stats.rel}
                value={`${(err.relative * 100).toFixed(1)} %`}
                emphasize
              />
            </dl>
          </div>
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

function LegendItem({
  color,
  label,
  dotted = false,
}: {
  color: string;
  label: string;
  dotted?: boolean;
}) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <svg width={20} height={8} aria-hidden>
        <line
          x1={0}
          y1={4}
          x2={20}
          y2={4}
          stroke={color}
          strokeWidth={2.5}
          strokeDasharray={dotted ? '3 2' : undefined}
        />
      </svg>
      {label}
    </span>
  );
}

function Stat({
  label,
  value,
  emphasize = false,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div>
      <dt className="font-sans text-[11px] uppercase tracking-wide text-slate-400">
        {label}
      </dt>
      <dd className={emphasize ? 'text-accent' : 'text-slate-800'}>{value}</dd>
    </div>
  );
}
