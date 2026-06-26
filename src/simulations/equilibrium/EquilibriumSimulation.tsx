import { useState } from 'react';
import SimulationSection from '../../components/SimulationSection';
import Slider from '../../components/ui/Slider';
import StatList from '../../components/ui/StatList';
import { useTranslation } from '../../i18n/useTranslation';
import { getCategory } from '../categories';
import { pick, type SimulationComponentProps } from '../types';
import {
  PKA_DEFAULT,
  dissociationRate,
  equilibriumAdvancement,
  equilibriumCurve,
  kaFromPka,
  plotBound,
} from './equilibriumMath';
import EquilibriumChart, { EQUILIBRIUM_COLORS } from './EquilibriumChart';
import ProportionBars from './ProportionBars';

const C0_DEFAULT = 0.1; // mol/L

const content = {
  fr: {
    theory: [
      'On considère une solution d’acide faible HA de concentration apportée C₀ : HA + H₂O ⇌ A⁻ + H₃O⁺. Cet équilibre est caractérisé par la constante d’acidité KA.',
      'À l’équilibre, l’avancement x (en mol/L) vérifie KA = x²/(C₀ − x), soit l’équation du second degré x² + KA·x − KA·C₀ = 0. Seule la racine positive a un sens : x = (−KA + √(KA² + 4·KA·C₀)) / 2.',
      'Le graphe trace le quotient de réaction Qr(ξ) = ξ²/(C₀ − ξ) en fonction de l’avancement ξ ; le système est à l’équilibre là où Qr = KA (point vert). ⚠️ ξ est un avancement, pas le temps : ce n’est pas une évolution chronologique (la cinétique est une autre notion).',
    ],
    observe: [
      'Acide faible (KA petit, pKA grand) : x reste petit devant C₀, l’acide est majoritairement sous forme HA (peu dissocié).',
      'Acide quasi fort (KA grand, pKA petit) : x s’approche de C₀, la dissociation est quasi totale.',
      'L’intersection Qr = KA se déplace quand tu changes C₀ ou pKA : c’est le nouvel état d’équilibre.',
      'Les barres montrent que [A⁻] = [H₃O⁺] = x et [HA] = C₀ − x.',
    ],
    curriculum:
      'Spécialité physique-chimie : quotient de réaction Qr, constante d’équilibre K(T), critère d’évolution spontanée et constante d’acidité KA — avec la résolution d’une équation du second degré comme capacité mathématique attendue du chapitre.',
    labels: { c0: 'Concentration apportée C₀', pka: 'pKA' },
    stats: { ka: 'Constante KA', x: 'Avancement x', alpha: 'Taux de dissociation', ha: '[HA] restant' },
    species: { ha: 'HA', a: 'A⁻', h3o: 'H₃O⁺' },
    chart: { xi: 'Avancement ξ (mol/L)', qr: 'Qr', k: 'K = KA' },
    aria: 'Graphe du quotient de réaction Qr en fonction de l’avancement, croisant la constante K.',
  },
  en: {
    theory: [
      'Consider a weak-acid solution HA of analytical concentration C₀: HA + H₂O ⇌ A⁻ + H₃O⁺. This equilibrium is characterised by the acidity constant KA.',
      'At equilibrium, the advancement x (in mol/L) satisfies KA = x²/(C₀ − x), i.e. the quadratic x² + KA·x − KA·C₀ = 0. Only the positive root is physical: x = (−KA + √(KA² + 4·KA·C₀)) / 2.',
      'The chart plots the reaction quotient Qr(ξ) = ξ²/(C₀ − ξ) versus the advancement ξ; the system is at equilibrium where Qr = KA (green point). ⚠️ ξ is an advancement, not time: this is not a chronological evolution (kinetics is a separate topic).',
    ],
    observe: [
      'Weak acid (small KA, large pKA): x stays small compared with C₀, the acid is mostly HA (little dissociation).',
      'Nearly strong acid (large KA, small pKA): x approaches C₀, dissociation is almost total.',
      'The intersection Qr = KA shifts when you change C₀ or pKA: it is the new equilibrium state.',
      'The bars show that [A⁻] = [H₃O⁺] = x and [HA] = C₀ − x.',
    ],
    curriculum:
      'Specialty physics-chemistry: reaction quotient Qr, equilibrium constant K(T), spontaneous-evolution criterion and acidity constant KA — with solving a quadratic equation as the expected mathematical skill of the chapter.',
    labels: { c0: 'Analytical concentration C₀', pka: 'pKA' },
    stats: { ka: 'Constant KA', x: 'Advancement x', alpha: 'Dissociation rate', ha: '[HA] left' },
    species: { ha: 'HA', a: 'A⁻', h3o: 'H₃O⁺' },
    chart: { xi: 'Advancement ξ (mol/L)', qr: 'Qr', k: 'K = KA' },
    aria: 'Reaction-quotient Qr versus advancement, crossing the constant K.',
  },
} as const;

function molar(v: number): string {
  if (!Number.isFinite(v)) return '—';
  return Math.abs(v) < 0.01 && v !== 0 ? v.toExponential(2) : v.toFixed(4);
}

export default function EquilibriumSimulation({ meta }: SimulationComponentProps) {
  const { lang } = useTranslation();
  const c = content[lang];
  const eyebrow = pick(getCategory(meta.category).label, lang);

  const [c0, setC0] = useState(C0_DEFAULT);
  const [pka, setPka] = useState(PKA_DEFAULT);

  const ka = kaFromPka(pka);
  const x = equilibriumAdvancement(c0, ka);
  const bound = plotBound(c0, x);
  const curve = equilibriumCurve(c0, bound);
  const alpha = dissociationRate(c0, x);

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
            label={c.labels.c0}
            value={c0}
            min={0.001}
            max={1}
            step={0.001}
            onChange={setC0}
            format={(v) => v.toFixed(3)}
            unit="mol/L"
          />
          <Slider
            label={c.labels.pka}
            value={pka}
            min={0}
            max={14}
            step={0.1}
            onChange={setPka}
            format={(v) => v.toFixed(1)}
          />
        </div>
      }
      visualization={
        <div className="space-y-4">
          <EquilibriumChart
            data={curve}
            ka={ka}
            x={x}
            bound={bound}
            labels={c.chart}
            ariaLabel={c.aria}
          />

          <ProportionBars
            max={c0}
            format={molar}
            items={[
              { label: c.species.ha, value: c0 - x, color: EQUILIBRIUM_COLORS.curve },
              { label: c.species.a, value: x, color: EQUILIBRIUM_COLORS.point },
              { label: c.species.h3o, value: x, color: EQUILIBRIUM_COLORS.k },
            ]}
          />

          <StatList
            items={[
              { label: c.stats.ka, value: ka.toExponential(2) },
              { label: c.stats.x, value: molar(x), emphasize: true },
              { label: c.stats.alpha, value: `${(alpha * 100).toFixed(1)} %` },
              { label: c.stats.ha, value: molar(c0 - x) },
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
