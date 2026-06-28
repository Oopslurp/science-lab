import { describe, it, expect } from 'vitest';
import {
  binomialCoefficient,
  binomialDistribution,
  binomialMean,
  binomialProbability,
  binomialStdDev,
  normalPdf,
} from './galtonMath';

describe('binomialCoefficient', () => {
  it('valeurs connues', () => {
    expect(binomialCoefficient(5, 2)).toBe(10);
    expect(binomialCoefficient(16, 8)).toBe(12870);
    expect(binomialCoefficient(10, 0)).toBe(1);
    expect(binomialCoefficient(10, 10)).toBe(1);
  });

  it('symétrie C(n, k) = C(n, n−k)', () => {
    expect(binomialCoefficient(10, 3)).toBe(binomialCoefficient(10, 7));
    expect(binomialCoefficient(20, 6)).toBe(binomialCoefficient(20, 14));
  });

  it('résultat entier exact (pas d’erreur flottante)', () => {
    for (let n = 0; n <= 20; n++) {
      for (let k = 0; k <= n; k++) {
        expect(Number.isInteger(binomialCoefficient(n, k))).toBe(true);
      }
    }
  });

  it('0 (sans exception) hors domaine', () => {
    expect(binomialCoefficient(5, 6)).toBe(0);
    expect(binomialCoefficient(-1, 0)).toBe(0);
    expect(binomialCoefficient(5, -1)).toBe(0);
    expect(binomialCoefficient(5.5, 2)).toBe(0);
  });
});

describe('binomialProbability / binomialDistribution', () => {
  it('valeur de référence : P(X=2), n=4, p=0,5 = 6/16', () => {
    expect(binomialProbability(4, 2, 0.5)).toBeCloseTo(0.375, 12);
  });

  it('la loi somme à 1', () => {
    for (const [n, p] of [[10, 0.5], [12, 0.3], [8, 0.75]] as const) {
      const sum = binomialDistribution(n, p).reduce((a, b) => a + b, 0);
      expect(sum).toBeCloseTo(1, 12);
    }
  });

  it('symétrique pour p = 0,5', () => {
    const dist = binomialDistribution(10, 0.5);
    for (let k = 0; k <= 5; k++) expect(dist[k]).toBeCloseTo(dist[10 - k], 12);
  });

  it('cas extrêmes p = 0 et p = 1 (toute la masse à une extrémité)', () => {
    expect(binomialProbability(6, 0, 0)).toBeCloseTo(1, 12);
    expect(binomialProbability(6, 6, 1)).toBeCloseTo(1, 12);
    expect(binomialProbability(6, 3, 0)).toBe(0);
  });

  it('longueur n+1 ; [] si n invalide', () => {
    expect(binomialDistribution(7, 0.5)).toHaveLength(8);
    expect(binomialDistribution(-1, 0.5)).toEqual([]);
    expect(binomialDistribution(3.5, 0.5)).toEqual([]);
  });
});

describe('moyenne et écart-type', () => {
  it('μ = n·p, σ = √(n·p·(1−p))', () => {
    expect(binomialMean(10, 0.5)).toBe(5);
    expect(binomialStdDev(10, 0.5)).toBeCloseTo(Math.sqrt(2.5), 12);
  });

  it('NaN sur entrée non finie', () => {
    expect(binomialMean(NaN, 0.5)).toBeNaN();
    expect(binomialStdDev(10, Infinity)).toBeNaN();
  });
});

describe('normalPdf', () => {
  it('maximum en x = μ, valeur 1/(σ√2π)', () => {
    expect(normalPdf(3, 3, 2)).toBeCloseTo(1 / (2 * Math.sqrt(2 * Math.PI)), 12);
  });

  it('symétrique autour de μ', () => {
    expect(normalPdf(2, 5, 1.5)).toBeCloseTo(normalPdf(8, 5, 1.5), 12);
  });

  it('0 (sans exception) si σ ≤ 0 ou entrée non finie', () => {
    expect(normalPdf(1, 0, 0)).toBe(0);
    expect(normalPdf(NaN, 0, 1)).toBe(0);
  });
});
