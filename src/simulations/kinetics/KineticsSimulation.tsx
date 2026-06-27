import { useMemo, useState } from 'react';
import SimulationSection from '../../components/SimulationSection';
import Slider from '../../components/ui/Slider';
import StatList from '../../components/ui/StatList';
import Legend from '../../components/ui/Legend';
import { useTranslation } from '../../i18n/useTranslation';
import { getCategory } from '../categories';
import { pick, type SimulationComponentProps } from '../types';
import {
  MAX_CATALYST_DOSES,
  catalystFactor,
  concentration,
  effectiveK,
  halfTime,
  kineticsSeries,
} from './kineticsMath';
import KineticsCharts, { KINETICS_COLORS } from './KineticsCharts';

// Fenêtre de temps adaptée à la courbe la PLUS LENTE affichée (la base, sans catalyseur) :
// ~5 demi-réactions, bornée pour rester lisible quand k est très petit (ou nul).
const WINDOW_HALF_LIVES = 5;
const MIN_WINDOW_S = 5;
const MAX_WINDOW_S = 60;

const content = {
  fr: {
    theory: [
      'Pour une réaction d’ordre 1, la vitesse de disparition du réactif est proportionnelle à sa concentration : v = k·[A]. En intégrant, on obtient deux grandeurs liées mais bien distinctes :',
      'Le temps de demi-réaction t½ = ln2 / k est le temps au bout duquel la moitié du réactif a disparu. Plus k est grand, plus la réaction est rapide (k augmente avec la température ou en présence d’un catalyseur).',
      'À ne pas confondre avec la décroissance radioactive, de loi identique [A] = [A]₀·e^(−kt) : là, la constante λ est une propriété IMMUABLE du noyau. Ici k peut être modifié — c’est tout l’intérêt industriel d’un catalyseur. Et un catalyseur change la VITESSE, pas l’état final : avec ou sans, les deux courbes partent du même point et tendent vers la même limite (0), simplement à des rythmes différents.',
    ],
    observe: [
      'Augmente k : [A] chute plus vite et t½ diminue.',
      'Ajoute des doses de catalyseur : la courbe pleine plonge d’autant plus vite que la courbe estompée (sans catalyseur) — mais toutes deux finissent à 0. Seule la vitesse change, pas l’état final.',
      'La vitesse v(t) est maximale au départ (v₀ = k·[A]₀) puis décroît : la réaction ralentit à mesure que le réactif s’épuise.',
      'Mets k = 0 : aucune réaction, [A] reste plat, v = 0 et t½ devient infini.',
    ],
    curriculum:
      'Terminale spécialité physique-chimie : vitesse volumique de disparition d’un réactif, loi de vitesse d’ordre 1, temps de demi-réaction t½ = ln2/k, et rôle d’un catalyseur (modifie la vitesse, pas l’état final de la réaction).',
    labels: { a0: 'Concentration initiale [A]₀', k: 'Constante de vitesse k', catalyst: 'Doses de catalyseur' },
    catalystNone: 'aucun',
    stats: { keff: 'k effectif', half: 'Demi-réaction t½', final: 'État final [A]∞' },
    halfInfinite: '∞ (infiniment lente)',
    charts: { time: 't (s)', conc: '[A] (mol/L)', rate: 'v (mol·L⁻¹·s⁻¹)' },
    ariaConc: 'Courbe de la concentration du réactif au cours du temps.',
    ariaRate: 'Courbe de la vitesse de disparition au cours du temps.',
    legend: { withCat: 'Avec catalyseur', withoutCat: 'Sans catalyseur (estompé)' },
  },
  en: {
    theory: [
      'For a first-order reaction, the disappearance rate of the reactant is proportional to its concentration: v = k·[A]. Integrating gives two linked but quite distinct quantities:',
      'The half-reaction time t½ = ln2 / k is when half of the reactant has disappeared. The larger k, the faster the reaction (k rises with temperature or with a catalyst).',
      'Not to be confused with radioactive decay, whose law is identical [A] = [A]₀·e^(−kt): there, the constant λ is an IMMUTABLE property of the nucleus. Here k can be changed — that is the whole industrial point of a catalyst. And a catalyst changes the SPEED, not the final state: with or without, both curves start at the same point and tend to the same limit (0), just at different paces.',
    ],
    observe: [
      'Increase k: [A] drops faster and t½ shrinks.',
      'Add catalyst doses: the solid curve plunges all the faster compared with the faded one (no catalyst) — yet both end at 0. Only the speed changes, not the final state.',
      'The rate v(t) is highest at the start (v₀ = k·[A]₀) then decreases: the reaction slows as the reactant runs out.',
      'Set k = 0: no reaction, [A] stays flat, v = 0 and t½ becomes infinite.',
    ],
    curriculum:
      'Final-year specialty physics-chemistry: volumic disappearance rate of a reactant, first-order rate law, half-reaction time t½ = ln2/k, and the role of a catalyst (changes the speed, not the final state of the reaction).',
    labels: { a0: 'Initial concentration [A]₀', k: 'Rate constant k', catalyst: 'Catalyst doses' },
    catalystNone: 'none',
    stats: { keff: 'effective k', half: 'Half-reaction t½', final: 'Final state [A]∞' },
    halfInfinite: '∞ (infinitely slow)',
    charts: { time: 't (s)', conc: '[A] (mol/L)', rate: 'v (mol·L⁻¹·s⁻¹)' },
    ariaConc: 'Reactant concentration curve over time.',
    ariaRate: 'Disappearance rate curve over time.',
    legend: { withCat: 'With catalyst', withoutCat: 'Without catalyst (faded)' },
  },
} as const;

export default function KineticsSimulation({ meta }: SimulationComponentProps) {
  const { lang } = useTranslation();
  const c = content[lang];
  const eyebrow = pick(getCategory(meta.category).label, lang);

  const [a0, setA0] = useState(1.0);
  const [k, setK] = useState(0.3);
  const [doses, setDoses] = useState(0);

  const kEff = effectiveK(k, doses);

  // Fenêtre pilotée par la base (courbe la plus lente). k = 0 → t½ infini → fenêtre max.
  const baseHalf = halfTime(k);
  const tMax = Number.isFinite(baseHalf)
    ? Math.min(MAX_WINDOW_S, Math.max(MIN_WINDOW_S, WINDOW_HALF_LIVES * baseHalf))
    : MAX_WINDOW_S;

  const data = useMemo(() => {
    const main = kineticsSeries(a0, kEff, tMax);
    const base = kineticsSeries(a0, k, tMax);
    return main.map((p, i) => ({
      t: p.t,
      aMain: p.a,
      vMain: p.v,
      aBase: base[i].a,
      vBase: base[i].v,
    }));
  }, [a0, kEff, k, tMax]);

  const showBase = doses > 0 && k > 0; // superposition utile seulement si elle diffère
  const vMax = kEff * a0 > 0 ? kEff * a0 * 1.05 : 1;
  const halfEff = halfTime(kEff);
  const halfText = Number.isFinite(halfEff) ? `${halfEff.toFixed(2)} s` : c.halfInfinite;

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
            [A](t) = [A]₀·e^(−k·t)&nbsp;&nbsp;,&nbsp;&nbsp;v(t) = k·[A](t)
          </p>
          <p>{c.theory[1]}</p>
          <p>{c.theory[2]}</p>
        </div>
      }
      controls={
        <div className="space-y-5">
          <Slider
            label={c.labels.a0}
            value={a0}
            min={0.1}
            max={2}
            step={0.1}
            onChange={setA0}
            format={(v) => v.toFixed(1)}
            unit="mol/L"
          />
          <Slider
            label={c.labels.k}
            value={k}
            min={0}
            max={1}
            step={0.01}
            onChange={setK}
            format={(v) => v.toFixed(2)}
            unit="s⁻¹"
          />
          <Slider
            label={c.labels.catalyst}
            value={doses}
            min={0}
            max={MAX_CATALYST_DOSES}
            step={1}
            onChange={setDoses}
            format={(v) => (v === 0 ? `0 (${c.catalystNone})` : `${v} → ×${catalystFactor(v)}`)}
          />
        </div>
      }
      visualization={
        <div className="space-y-4">
          <KineticsCharts
            data={data}
            showBase={showBase}
            a0={a0}
            vMax={vMax}
            tMax={tMax}
            labels={c.charts}
            ariaConc={c.ariaConc}
            ariaRate={c.ariaRate}
          />

          {showBase ? (
            <Legend
              items={[
                { color: KINETICS_COLORS.conc, label: c.legend.withCat, variant: 'line' },
                { color: KINETICS_COLORS.base, label: c.legend.withoutCat, variant: 'line', dashed: true },
              ]}
            />
          ) : null}

          <StatList
            columns={4}
            items={[
              { label: c.stats.keff, value: `${kEff.toFixed(2)} s⁻¹` },
              { label: c.stats.half, value: halfText, emphasize: true },
              { label: c.stats.final, value: `≈ ${concentration(tMax, a0, kEff).toFixed(2)} mol/L` },
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
