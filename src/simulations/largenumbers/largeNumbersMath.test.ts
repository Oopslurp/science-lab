import { describe, it, expect } from 'vitest';
import {
  DICE_VARIANCE,
  MAX_DISPLAYED_DRAWS,
  MAX_TOTAL_DRAWS,
  UNIFORM_VARIANCE,
  type LawId,
  average,
  bandHalfWidth,
  chebyshevBound,
  clampSampleN,
  drawOne,
  histogramBins,
  lawStats,
  mulberry32,
  proportionInBand,
  sampleDraws,
  sampleMean,
  simulateMeans,
} from './largeNumbersMath';

describe('largeNumbersMath', () => {
  it('chebyshevBound = 1 − 1/k² (k = 1, 2, 3) + garde', () => {
    expect(chebyshevBound(1)).toBeCloseTo(0, 12); // borne triviale
    expect(chebyshevBound(2)).toBeCloseTo(0.75, 12);
    expect(chebyshevBound(3)).toBeCloseTo(8 / 9, 12); // ≈ 0,8889
    expect(chebyshevBound(0)).toBe(0); // garde
    expect(chebyshevBound(-2)).toBe(0);
  });

  it('lawStats : μ et σ² des trois lois', () => {
    expect(lawStats('dice', 0)).toMatchObject({ mean: 3.5, variance: DICE_VARIANCE });
    expect(lawStats('uniform', 0)).toMatchObject({ mean: 0.5, variance: UNIFORM_VARIANCE });
    const coin = lawStats('coin', 0.3);
    expect(coin.mean).toBeCloseTo(0.3, 12);
    expect(coin.variance).toBeCloseTo(0.3 * 0.7, 12);
  });

  it('mulberry32 : déterministe à graine fixée', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 5; i++) expect(a()).toBe(b());
    // domaine [0, 1)
    const r = mulberry32(7);
    for (let i = 0; i < 100; i++) {
      const x = r();
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThan(1);
    }
  });

  it('drawOne : domaines corrects (dé 1..6, pièce {0,1}, uniforme [0,1))', () => {
    const rng = mulberry32(123);
    for (let i = 0; i < 200; i++) {
      const d = drawOne('dice', 0, rng);
      expect(Number.isInteger(d)).toBe(true);
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(6);
      const c = drawOne('coin', 0.5, rng);
      expect(c === 0 || c === 1).toBe(true);
      const u = drawOne('uniform', 0, rng);
      expect(u).toBeGreaterThanOrEqual(0);
      expect(u).toBeLessThan(1);
    }
  });

  it('convergence : moyenne empirique des Mₙ ≈ μ pour les 3 lois (graine fixée)', () => {
    const cases: Array<{ law: LawId; p: number; mu: number }> = [
      { law: 'dice', p: 0, mu: 3.5 },
      { law: 'coin', p: 0.3, mu: 0.3 },
      { law: 'uniform', p: 0, mu: 0.5 },
    ];
    for (const { law, p, mu } of cases) {
      const means = simulateMeans(law, p, 200, 400, mulberry32(2024));
      // tolérance statistique : largement au-dessus de l'erreur-type σ/√(n·N), < 0,03 ici
      expect(Math.abs(average(means) - mu)).toBeLessThan(0.03);
    }
  });

  it('borne de Tchebychev pessimiste : empiriquement (graine fixe) la proportion la dépasse', () => {
    // Tchebychev majore la PROBABILITÉ : P(|Mₙ − μ| ≥ k·σₙ) ≤ 1/k², soit
    // P(dans la bande) ≥ 1 − 1/k². Ce n'est PAS une garantie sur la proportion
    // d'un échantillon FINI (qui peut, rarement, passer sous la borne). Pour ces
    // lois (loin du pire cas) et une graine fixe, la proportion observée dépasse
    // nettement la borne : on illustre son caractère pessimiste, pas une loi.
    const k = 2;
    const cases: Array<{ law: LawId; p: number }> = [
      { law: 'dice', p: 0 },
      { law: 'coin', p: 0.5 },
      { law: 'uniform', p: 0 },
    ];
    for (const { law, p } of cases) {
      const { mean, std } = lawStats(law, p);
      const n = 50;
      const means = simulateMeans(law, p, n, 600, mulberry32(99));
      const prop = proportionInBand(means, mean, bandHalfWidth(std, n, k));
      expect(prop).toBeGreaterThan(chebyshevBound(k)); // pessimiste : ici largement dépassée
    }
  });

  it('bandHalfWidth = k·σ/√n', () => {
    expect(bandHalfWidth(2, 100, 3)).toBeCloseTo((3 * 2) / 10, 12);
  });

  it('proportionInBand : compte les |Mₙ − μ| < demi-largeur (strict)', () => {
    const means = [0, 0.5, 1, 1.5, 2];
    expect(proportionInBand(means, 1, 1)).toBeCloseTo(3 / 5, 12); // 0.5, 1, 1.5 dans ]0,2[
    expect(proportionInBand([], 1, 1)).toBe(0);
  });

  it('garde-fou MAX_TOTAL_DRAWS : n × N borné', () => {
    const n = 1000;
    const N = 10_000; // n×N = 10⁷ ≫ budget
    expect(clampSampleN(n, N)).toBe(Math.floor(MAX_TOTAL_DRAWS / n));
    const means = simulateMeans('dice', 0, n, N, mulberry32(1));
    // length effective × n ne dépasse pas le budget
    expect(means.length * n).toBeLessThanOrEqual(MAX_TOTAL_DRAWS);
  });

  it('robustesse : n NaN/Infinity ne plante pas (ni throw ni boucle infinie)', () => {
    expect(() => simulateMeans('dice', 0, Infinity, 10, mulberry32(1))).not.toThrow();
    expect(() => sampleDraws('coin', 0.5, Infinity, mulberry32(1))).not.toThrow();
    expect(sampleDraws('coin', 0.5, Infinity, mulberry32(1))).toHaveLength(1); // fallback 1
    expect(clampSampleN(Infinity, 10)).toBeGreaterThanOrEqual(1);
    expect(clampSampleN(10, NaN)).toBeGreaterThanOrEqual(1);
    expect(simulateMeans('dice', 0, NaN, 5, mulberry32(1)).length).toBeGreaterThanOrEqual(1);
  });

  it('la moyenne Mₙ utilise TOUS les n tirages (le plafond d’affichage ne tronque pas le calcul)', () => {
    const big = MAX_DISPLAYED_DRAWS * 4; // bien au-delà du plafond d'affichage
    // pièce p = 1 ⇒ chaque tirage vaut 1, donc Mₙ = 1 quel que soit n
    expect(sampleDraws('coin', 1, big, mulberry32(3))).toHaveLength(big);
    expect(sampleMean('coin', 1, big, mulberry32(3))).toBeCloseTo(1, 12);
  });

  it('histogramBins : comptage total conservé, classes régulières', () => {
    const values = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
    const bins = histogramBins(values, 5, 0, 10);
    expect(bins).toHaveLength(5);
    expect(bins.reduce((s, b) => s + b.count, 0)).toBe(values.length);
    expect(bins[0].x0).toBeCloseTo(0, 12);
    expect(bins[4].x1).toBeCloseTo(10, 12);
    // cas dégénéré (toutes égales) : ne plante pas, total conservé
    const deg = histogramBins([2, 2, 2], 4, 2, 2);
    expect(deg.reduce((s, b) => s + b.count, 0)).toBe(3);
  });
});
