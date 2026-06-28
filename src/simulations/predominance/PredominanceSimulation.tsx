import { useMemo, useState } from 'react';
import SimulationSection from '../../components/SimulationSection';
import Slider from '../../components/ui/Slider';
import Legend from '../../components/ui/Legend';
import StatList from '../../components/ui/StatList';
import { useTranslation } from '../../i18n/useTranslation';
import { getCategory } from '../categories';
import { pick, type SimulationComponentProps } from '../types';
import {
  COUPLES,
  INDICATORS,
  acidFraction,
  baseFraction,
  distributionCurve,
  predominantForm,
} from './predominanceMath';
import DistributionChart, { PREDOMINANCE_COLORS } from './DistributionChart';
import PredominanceDiagram from './PredominanceDiagram';

type IndicatorId = 'none' | 'methylOrange' | 'bromothymol' | 'phenolphthalein';
const INDICATOR_IDS: IndicatorId[] = ['none', 'methylOrange', 'bromothymol', 'phenolphthalein'];

const content = {
  fr: {
    theory: [
      'Le diagramme de prédominance d’un couple acide/base AH/A⁻ indique, selon le pH, quelle espèce est majoritaire. La relation pH = pKA + log([A⁻]/[AH]) donne directement le rapport [A⁻]/[AH] = 10^(pH − pKA).',
      'Donc AH prédomine si pH < pKA, A⁻ si pH > pKA, et les deux espèces sont à égalité (50 / 50) quand pH = pKA. Les proportions exactes valent f(AH) = 1 / (1 + 10^(pH − pKA)) et f(A⁻) = 1 − f(AH).',
      'Un indicateur coloré est lui-même un couple acide/base dont les deux formes ont des teintes différentes : il vire sur sa zone de virage (≈ pKi ± 1). On choisit pour un titrage un indicateur dont la zone de virage encadre le pH d’équivalence — par exemple la phénolphtaléine (8,2–10,0) pour un acide faible titré par une base forte.',
    ],
    observe: [
      'Déplace le pH : à gauche du pKA la forme acide domine, à droite la forme basique ; à pH = pKA les deux courbes se croisent à 50 %.',
      'À une unité de pH du pKA, une forme est ~10× l’autre ; à deux unités, ~100×. La frontière de prédominance est donc « nette ».',
      'Change de couple : la frontière se place exactement au pKA (HF à 3,17 ; NH₄⁺ à 9,25).',
      'Active la phénolphtaléine : sa zone de virage (8,2–10,0) montre où l’indicateur change de couleur, ce qui aide à choisir l’indicateur d’un titrage.',
    ],
    curriculum:
      'Terminale spécialité physique-chimie : diagramme de prédominance d’un couple acide/base, relation entre pH et pKA, proportions des espèces, et indicateurs colorés de fin de titrage.',
    labels: { couple: 'Couple acide / base', ph: 'pH', indicator: 'Indicateur coloré' },
    indicators: {
      none: 'Aucun',
      methylOrange: 'Hélianthine',
      bromothymol: 'Bleu de bromothymol',
      phenolphthalein: 'Phénolphtaléine',
    } as Record<IndicatorId, string>,
    chart: { ph: 'pH', fraction: 'Proportion', acid: 'Forme acide', base: 'Forme basique', pka: 'pH = pKA' },
    diagram: { predominates: 'prédomine', pka: 'pKA' },
    legend: { acid: 'Forme acide', base: 'Forme basique', pka: 'pH = pKA', now: 'pH actuel' },
    stats: { pka: 'pKA', ph: 'pH', fAcid: 'Forme acide', fBase: 'Forme basique', form: 'Prédomine' },
    forms: { acid: 'forme acide', base: 'forme basique', equal: '50 / 50' },
    chartAria: 'Courbes des proportions des formes acide et basique en fonction du pH.',
    diagramAria: 'Diagramme de prédominance : axe du pH coupé au pKA.',
  },
  en: {
    theory: [
      'The predominance diagram of an acid/base couple AH/A⁻ shows, depending on pH, which species is the majority one. The relation pH = pKA + log([A⁻]/[AH]) gives the ratio directly: [A⁻]/[AH] = 10^(pH − pKA).',
      'So AH predominates if pH < pKA, A⁻ if pH > pKA, and the two species are equal (50 / 50) when pH = pKA. The exact proportions are f(AH) = 1 / (1 + 10^(pH − pKA)) and f(A⁻) = 1 − f(AH).',
      'A colour indicator is itself an acid/base couple whose two forms have different hues: it turns over its transition range (≈ pKi ± 1). For a titration one picks an indicator whose transition range brackets the equivalence pH — for example phenolphthalein (8.2–10.0) for a weak acid titrated by a strong base.',
    ],
    observe: [
      'Move the pH: left of pKA the acid form dominates, right of it the base form; at pH = pKA the two curves cross at 50 %.',
      'One pH unit from pKA, one form is ~10× the other; two units, ~100×. The predominance boundary is therefore “sharp”.',
      'Switch couple: the boundary sits exactly at the pKA (HF at 3.17; NH₄⁺ at 9.25).',
      'Enable phenolphthalein: its transition range (8.2–10.0) shows where the indicator changes colour, which helps choose a titration indicator.',
    ],
    curriculum:
      'Final-year specialty physics-chemistry: predominance diagram of an acid/base couple, relation between pH and pKA, species proportions, and end-of-titration colour indicators.',
    labels: { couple: 'Acid / base couple', ph: 'pH', indicator: 'Colour indicator' },
    indicators: {
      none: 'None',
      methylOrange: 'Methyl orange',
      bromothymol: 'Bromothymol blue',
      phenolphthalein: 'Phenolphthalein',
    } as Record<IndicatorId, string>,
    chart: { ph: 'pH', fraction: 'Proportion', acid: 'Acid form', base: 'Base form', pka: 'pH = pKA' },
    diagram: { predominates: 'predominates', pka: 'pKA' },
    legend: { acid: 'Acid form', base: 'Base form', pka: 'pH = pKA', now: 'Current pH' },
    stats: { pka: 'pKA', ph: 'pH', fAcid: 'Acid form', fBase: 'Base form', form: 'Predominates' },
    forms: { acid: 'acid form', base: 'base form', equal: '50 / 50' },
    chartAria: 'Curves of the acid and base form proportions versus pH.',
    diagramAria: 'Predominance diagram: pH axis split at the pKA.',
  },
} as const;

export default function PredominanceSimulation({ meta }: SimulationComponentProps) {
  const { lang } = useTranslation();
  const c = content[lang];
  const eyebrow = pick(getCategory(meta.category).label, lang);

  const [coupleId, setCoupleId] = useState(COUPLES[1].id); // acide éthanoïque par défaut
  const [pH, setPH] = useState(4.75);
  const [indicatorId, setIndicatorId] = useState<IndicatorId>('none');

  const couple = COUPLES.find((cp) => cp.id === coupleId) ?? COUPLES[1];
  const pKA = couple.pKA;
  const indicator = indicatorId === 'none' ? null : INDICATORS.find((i) => i.id === indicatorId) ?? null;

  const data = useMemo(() => distributionCurve(pKA), [pKA]);
  const fAcid = acidFraction(pH, pKA);
  const fBase = baseFraction(pH, pKA);
  const form = predominantForm(pH, pKA);
  const formLabel = c.forms[form];

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
          {/* Couple acide/base */}
          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700">{c.labels.couple}</span>
            <div className="flex flex-wrap gap-2">
              {COUPLES.map((cp) => (
                <SegButton
                  key={cp.id}
                  active={cp.id === coupleId}
                  onClick={() => setCoupleId(cp.id)}
                >
                  {cp.acid} / {cp.base}
                </SegButton>
              ))}
            </div>
          </div>

          <Slider
            label={c.labels.ph}
            value={pH}
            min={0}
            max={14}
            step={0.1}
            onChange={setPH}
            format={(v) => v.toFixed(1)}
          />

          {/* Indicateur coloré */}
          <div>
            <span className="mb-2 block text-sm font-medium text-slate-700">{c.labels.indicator}</span>
            <div className="flex flex-wrap gap-2">
              {INDICATOR_IDS.map((id) => (
                <SegButton key={id} active={id === indicatorId} onClick={() => setIndicatorId(id)}>
                  {c.indicators[id]}
                </SegButton>
              ))}
            </div>
          </div>
        </div>
      }
      visualization={
        <div className="space-y-4">
          <DistributionChart
            data={data}
            pKA={pKA}
            pH={pH}
            indicator={indicator}
            labels={c.chart}
            ariaLabel={c.chartAria}
          />

          <Legend
            items={[
              { color: PREDOMINANCE_COLORS.acid, label: c.legend.acid, variant: 'line' },
              { color: PREDOMINANCE_COLORS.base, label: c.legend.base, variant: 'line' },
              { color: PREDOMINANCE_COLORS.pka, label: c.legend.pka, variant: 'line', dashed: true },
              { color: PREDOMINANCE_COLORS.now, label: c.legend.now, variant: 'line' },
            ]}
          />

          <PredominanceDiagram
            pKA={pKA}
            pH={pH}
            acidLabel={couple.acid}
            baseLabel={couple.base}
            indicator={indicator}
            indicatorName={indicator ? c.indicators[indicatorId] : null}
            texts={c.diagram}
            ariaLabel={c.diagramAria}
          />

          <StatList
            items={[
              { label: c.stats.pka, value: pKA.toFixed(2) },
              { label: c.stats.ph, value: pH.toFixed(1) },
              { label: c.stats.fAcid, value: `${(fAcid * 100).toFixed(1)} %` },
              { label: c.stats.fBase, value: `${(fBase * 100).toFixed(1)} %` },
              { label: c.stats.form, value: formLabel, emphasize: true },
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
