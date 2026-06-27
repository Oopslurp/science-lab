import { useEffect, useMemo, useState } from 'react';
import SimulationSection from '../../components/SimulationSection';
import Slider from '../../components/ui/Slider';
import StatList from '../../components/ui/StatList';
import { useTranslation } from '../../i18n/useTranslation';
import { getCategory } from '../categories';
import { pick, type SimulationComponentProps } from '../types';
import {
  MAX_DISPLAYED_DRAWS,
  MAX_TOTAL_DRAWS,
  type LawId,
  average,
  bandHalfWidth,
  chebyshevBound,
  clampSampleN,
  histogramBins,
  lawStats,
  mulberry32,
  proportionInBand,
  sampleDraws,
  simulateMeans,
} from './largeNumbersMath';
import MeansHistogram from './MeansHistogram';
import DrawAnimation from './DrawAnimation';

const BIN_COUNT = 22;
const K_VALUES = [1, 2, 3] as const;

/** Graine stable pour une exécution donnée (mêmes paramètres + runId ⇒ mêmes tirages). */
function seedFor(runId: number): number {
  return (0x9e3779b9 ^ Math.imul(runId + 1, 2654435761)) >>> 0;
}

const content = {
  fr: {
    theory: [
      'La loi des grands nombres dit que la moyenne Mₙ d’un échantillon de n tirages se rapproche de l’espérance μ quand n grandit. On le visualise en simulant N échantillons et en traçant l’histogramme de leurs moyennes : il se resserre autour de μ.',
      'L’inégalité de Bienaymé-Tchebychev quantifie cette concentration sans connaître la loi : pour la bande de demi-largeur k·σ/√n autour de μ, P(|Mₙ − μ| < k·σ/√n) ≥ 1 − 1/k². Soit ≥ 0 % pour k = 1 (borne triviale), ≥ 75 % pour k = 2, ≥ 88,9 % pour k = 3.',
      'La proportion RÉELLE observée dans la bande estime cette probabilité : en pratique elle dépasse largement la borne GARANTIE, volontairement pessimiste (valable pour n’importe quelle loi de variance finie). Sur un nombre fini d’échantillons elle fluctue et peut, rarement, passer sous la borne ; mais l’écart reste en général grand, quelle que soit la loi.',
    ],
    observe: [
      'Augmente n : l’histogramme des moyennes se resserre autour de μ (loi des grands nombres).',
      'La proportion réelle dans la bande dépasse en général largement la borne garantie 1 − 1/k² — change de loi (dé, pièce, uniforme) : la conclusion tient.',
      'k = 1 donne une borne de 0 % : vraie mais inutile (c’est normal et pédagogique). k = 2 et k = 3 deviennent informatives (75 % et 88,9 %).',
      'Relance plusieurs fois : la proportion réelle fluctue un peu mais reste bien au-dessus de la garantie.',
    ],
    curriculum:
      'Terminale spécialité mathématiques : loi des grands nombres, inégalité de Bienaymé-Tchebychev (inégalité de concentration), estimation d’une proportion par simulation. Le paramétrage en k·σ/√n pour k = 1, 2, 3 correspond à un exemple d’algorithme du programme.',
    laws: { dice: 'Dé', coin: 'Pièce', uniform: 'Uniforme [0,1]' } as Record<LawId, string>,
    labels: {
      law: 'Loi',
      p: 'Probabilité p (pièce)',
      n: 'Taille d’échantillon n',
      N: 'Nombre d’échantillons N',
      k: 'Écart k (bande k·σ/√n)',
    },
    relaunch: '↺ Relancer',
    compare: { real: 'Proportion réelle dans la bande', bound: 'Borne garantie (1 − 1/k²)', ge: '≥', lt: '<' },
    stats: { mu: 'Espérance μ', sigma: 'Écart-type σ', band: 'Demi-bande kσ/√n', effN: 'N effectif' },
    clampNote: (effN: number) => `N réduit à ${effN} (garde-fou ${MAX_TOTAL_DRAWS.toLocaleString('fr-FR')} tirages).`,
    histAria: 'Histogramme des moyennes des N échantillons, avec l’espérance μ et la bande de concentration.',
    histLabels: { axis: 'Moyenne Mₙ', mu: 'μ' },
    draw: {
      title: 'Tirages d’un échantillon',
      sampleMean: 'Moyenne Mₙ',
      more: (x: number) => `+ ${x} autres tirages`,
      heads: 'P',
      tails: 'F',
    },
  },
  en: {
    theory: [
      'The law of large numbers states that the mean Mₙ of a sample of n draws gets closer to the expectation μ as n grows. We visualise it by simulating N samples and plotting the histogram of their means: it tightens around μ.',
      'The Bienaymé-Chebyshev inequality quantifies this concentration without knowing the law: for the band of half-width k·σ/√n around μ, P(|Mₙ − μ| < k·σ/√n) ≥ 1 − 1/k². That is ≥ 0% for k = 1 (trivial bound), ≥ 75% for k = 2, ≥ 88.9% for k = 3.',
      'The REAL proportion observed in the band estimates this probability: in practice it far exceeds the GUARANTEED bound, which is deliberately pessimistic (valid for any finite-variance law). Over a finite number of samples it fluctuates and may, rarely, dip below the bound; but the gap usually stays large, whatever the law.',
    ],
    observe: [
      'Increase n: the histogram of means tightens around μ (law of large numbers).',
      'The real proportion in the band usually exceeds the guaranteed bound 1 − 1/k² by a lot — switch law (die, coin, uniform): the conclusion holds.',
      'k = 1 gives a 0% bound: true but useless (normal and instructive). k = 2 and k = 3 become informative (75% and 88.9%).',
      'Relaunch several times: the real proportion fluctuates a little but stays well above the guarantee.',
    ],
    curriculum:
      'Final-year specialty mathematics: law of large numbers, Bienaymé-Chebyshev inequality (concentration inequality), estimating a proportion by simulation. The k·σ/√n setting for k = 1, 2, 3 matches an example algorithm from the syllabus.',
    laws: { dice: 'Die', coin: 'Coin', uniform: 'Uniform [0,1]' } as Record<LawId, string>,
    labels: {
      law: 'Law',
      p: 'Probability p (coin)',
      n: 'Sample size n',
      N: 'Number of samples N',
      k: 'Spread k (band k·σ/√n)',
    },
    relaunch: '↺ Relaunch',
    compare: { real: 'Real proportion in the band', bound: 'Guaranteed bound (1 − 1/k²)', ge: '≥', lt: '<' },
    stats: { mu: 'Expectation μ', sigma: 'Std deviation σ', band: 'Half-band kσ/√n', effN: 'effective N' },
    clampNote: (effN: number) => `N reduced to ${effN} (safeguard ${MAX_TOTAL_DRAWS.toLocaleString('en-US')} draws).`,
    histAria: 'Histogram of the N sample means, with the expectation μ and the concentration band.',
    histLabels: { axis: 'Mean Mₙ', mu: 'μ' },
    draw: {
      title: 'Draws of one sample',
      sampleMean: 'Mean Mₙ',
      more: (x: number) => `+ ${x} more draws`,
      heads: 'H',
      tails: 'T',
    },
  },
} as const;

export default function LargeNumbersSimulation({ meta }: SimulationComponentProps) {
  const { lang } = useTranslation();
  const c = content[lang];
  const eyebrow = pick(getCategory(meta.category).label, lang);

  const [law, setLaw] = useState<LawId>('dice');
  const [p, setP] = useState(0.5);
  const [n, setN] = useState(30);
  const [N, setNN] = useState(500);
  const [k, setK] = useState<number>(2);
  const [runId, setRunId] = useState(0);
  const [revealCount, setRevealCount] = useState(0);

  const stats = lawStats(law, p);

  // N échantillons → N moyennes (seedé pour rester stable hors « Relancer »).
  const means = useMemo(
    () => simulateMeans(law, p, n, N, mulberry32(seedFor(runId))),
    [law, p, n, N, runId]
  );
  const effN = clampSampleN(n, N);

  // Échantillon représentatif (animé) — graine distincte.
  const representative = useMemo(
    () => sampleDraws(law, p, n, mulberry32(seedFor(runId) ^ 0x55555555)),
    [law, p, n, runId]
  );
  const repMean = average(representative);

  // Révèle progressivement les tirages (effet « dé qui roule »), plafonné à l'affichage.
  useEffect(() => {
    setRevealCount(0);
    const target = Math.min(representative.length, MAX_DISPLAYED_DRAWS);
    if (target <= 0) return;
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setRevealCount(i);
      if (i >= target) window.clearInterval(id);
    }, 70);
    return () => window.clearInterval(id);
  }, [representative]);

  const hw = bandHalfWidth(stats.std, n, k);
  const realProp = proportionInBand(means, stats.mean, hw);
  const bound = chebyshevBound(k);

  // Domaine de l'histogramme : englobe les moyennes ET la bande.
  let mLo = Infinity;
  let mHi = -Infinity;
  for (const v of means) {
    if (v < mLo) mLo = v;
    if (v > mHi) mHi = v;
  }
  const band = { low: stats.mean - hw, high: stats.mean + hw };
  const lo = Math.min(mLo, band.low);
  const hi = Math.max(mHi, band.high);
  const pad = (hi - lo) * 0.05 || 0.5;
  const domain: [number, number] = [lo - pad, hi + pad];
  const bins = histogramBins(means, BIN_COUNT, lo - pad, hi + pad);

  const displayed = representative.slice(0, revealCount);
  const hiddenCount = Math.max(0, n - Math.min(n, MAX_DISPLAYED_DRAWS));

  const segBtn = (label: string, active: boolean, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      className={
        'flex-1 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ' +
        (active
          ? 'border-accent bg-accent/10 text-accent'
          : 'border-slate-300 text-slate-700 hover:bg-slate-100')
      }
    >
      {label}
    </button>
  );

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
            P(|Mₙ − μ| &lt; k·σ/√n) ≥ 1 − 1/k²
          </p>
          <p>{c.theory[1]}</p>
          <p>{c.theory[2]}</p>
        </div>
      }
      controls={
        <div className="space-y-5">
          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700">{c.labels.law}</span>
            <div className="flex gap-2">
              {(['dice', 'coin', 'uniform'] as const).map((id) =>
                segBtn(c.laws[id], law === id, () => setLaw(id))
              )}
            </div>
          </div>

          {law === 'coin' ? (
            <Slider
              label={c.labels.p}
              value={p}
              min={0.05}
              max={0.95}
              step={0.05}
              onChange={setP}
              format={(v) => v.toFixed(2)}
            />
          ) : null}

          <Slider label={c.labels.n} value={n} min={1} max={500} step={1} onChange={setN} />
          <Slider label={c.labels.N} value={N} min={100} max={2000} step={100} onChange={setNN} />

          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700">{c.labels.k}</span>
            <div className="flex gap-2">
              {K_VALUES.map((kv) => segBtn(`k = ${kv}`, k === kv, () => setK(kv)))}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setRunId((r) => r + 1)}
            className="w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
          >
            {c.relaunch}
          </button>
        </div>
      }
      visualization={
        <div className="space-y-4">
          <MeansHistogram
            bins={bins}
            mu={stats.mean}
            band={band}
            domain={domain}
            labels={c.histLabels}
            ariaLabel={c.histAria}
          />

          {/* Comparaison centrale : proportion réelle vs borne garantie */}
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-lg border border-accent/30 bg-accent/5 p-4 text-center">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{c.compare.real}</p>
              <p className="mt-1 text-2xl font-bold text-accent tabular-nums">{(realProp * 100).toFixed(1)} %</p>
            </div>
            <span
              className={
                'text-lg font-semibold ' +
                (realProp >= bound ? 'text-slate-400' : 'text-amber-500')
              }
            >
              {realProp >= bound ? c.compare.ge : c.compare.lt}
            </span>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{c.compare.bound}</p>
              <p className="mt-1 text-2xl font-bold text-slate-700 tabular-nums">{(bound * 100).toFixed(1)} %</p>
            </div>
          </div>

          <DrawAnimation law={law} displayed={displayed} hiddenCount={hiddenCount} mean={repMean} labels={c.draw} />

          <StatList
            columns={4}
            items={[
              { label: c.stats.mu, value: stats.mean.toFixed(3) },
              { label: c.stats.sigma, value: stats.std.toFixed(3) },
              { label: c.stats.band, value: hw.toFixed(3) },
              { label: c.stats.effN, value: `${effN}` },
            ]}
          />

          {effN < N ? (
            <p className="rounded-lg border border-amber-300 bg-amber-50 p-2 text-xs text-amber-800">
              {c.clampNote(effN)}
            </p>
          ) : null}
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
