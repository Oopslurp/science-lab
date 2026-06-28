import { describe, it, expect } from 'vitest';
import {
  COUPLES,
  INDICATORS,
  acidFraction,
  baseFraction,
  distributionCurve,
  predominantForm,
} from './predominanceMath';

describe('predominanceMath — fractions', () => {
  it('à pH = pKA, les deux formes valent 1/2', () => {
    expect(acidFraction(4.75, 4.75)).toBeCloseTo(0.5, 12);
    expect(baseFraction(4.75, 4.75)).toBeCloseTo(0.5, 12);
  });

  it('à une unité de pH du pKA, rapport 10 entre les formes (≈ 0,909 / 0,0909)', () => {
    const pKA = 5;
    expect(acidFraction(pKA - 1, pKA)).toBeCloseTo(10 / 11, 6); // forme acide majoritaire
    expect(baseFraction(pKA - 1, pKA)).toBeCloseTo(1 / 11, 6);
    expect(acidFraction(pKA + 1, pKA)).toBeCloseTo(1 / 11, 6);
    expect(baseFraction(pKA + 1, pKA)).toBeCloseTo(10 / 11, 6);
  });

  it('les deux fractions sont complémentaires (somme = 1) sur tout le domaine', () => {
    for (let pH = 0; pH <= 14; pH += 0.5) {
      expect(acidFraction(pH, 6.35) + baseFraction(pH, 6.35)).toBeCloseTo(1, 12);
    }
  });

  it('acide décroissante, basique croissante avec le pH', () => {
    expect(acidFraction(2, 7)).toBeGreaterThan(acidFraction(12, 7));
    expect(baseFraction(12, 7)).toBeGreaterThan(baseFraction(2, 7));
  });

  it('sentinelle NaN sur entrée non finie', () => {
    expect(acidFraction(NaN, 5)).toBeNaN();
    expect(baseFraction(5, Infinity)).toBeNaN();
  });
});

describe('predominantForm', () => {
  it('acide si pH < pKA, basique si pH > pKA, égal au voisinage de pKA', () => {
    expect(predominantForm(3, 4.75)).toBe('acid');
    expect(predominantForm(6, 4.75)).toBe('base');
    expect(predominantForm(4.75, 4.75)).toBe('equal');
    expect(predominantForm(4.76, 4.75)).toBe('equal'); // dans la tolérance
  });

  it('renvoie equal (sans exception) sur entrée non finie', () => {
    expect(predominantForm(NaN, 5)).toBe('equal');
  });
});

describe('distributionCurve', () => {
  it('échantillonne pH ∈ [0, 14] et croise à 1/2 en pH = pKA', () => {
    const pKA = 7;
    const pts = distributionCurve(pKA, 140);
    expect(pts[0].pH).toBe(0);
    expect(pts[pts.length - 1].pH).toBe(14);
    const mid = pts.find((p) => Math.abs(p.pH - pKA) < 1e-9)!;
    expect(mid.acid).toBeCloseTo(0.5, 12);
    expect(mid.base).toBeCloseTo(0.5, 12);
  });

  it('garde un nombre d’échantillons valide même sur entrée dégénérée', () => {
    expect(distributionCurve(5, 0).length).toBeGreaterThanOrEqual(2);
    expect(distributionCurve(5, NaN).length).toBeGreaterThanOrEqual(2);
  });
});

describe('données', () => {
  it('4 couples, pKA croissants et finis', () => {
    expect(COUPLES).toHaveLength(4);
    for (let i = 1; i < COUPLES.length; i++) {
      expect(COUPLES[i].pKA).toBeGreaterThan(COUPLES[i - 1].pKA);
    }
  });

  it('phénolphtaléine : zone de virage 8,2–10,0', () => {
    const pheno = INDICATORS.find((ind) => ind.id === 'phenolphthalein')!;
    expect(pheno.pHLow).toBe(8.2);
    expect(pheno.pHHigh).toBe(10.0);
  });
});
