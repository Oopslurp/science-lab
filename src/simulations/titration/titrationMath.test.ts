import { describe, it, expect } from 'vitest';
import {
  equivalenceVolume,
  pHAt,
  regionAt,
  titrationCurve,
  NEUTRAL_CONC,
} from './titrationMath';

const P = { ca: 0.1, cb: 0.1, va: 20 };

describe('titrationMath', () => {
  it('equivalenceVolume = Ca·Va / Cb', () => {
    expect(equivalenceVolume(P)).toBeCloseTo(20);
  });

  it('equivalenceVolume : garde Cb ≤ 0 → 0', () => {
    expect(equivalenceVolume({ ca: 0.1, cb: 0, va: 20 })).toBe(0);
  });

  it('pH à Vb=0 vaut −log10(Ca)', () => {
    expect(pHAt(P, 0)).toBeCloseTo(1, 6); // Ca = 0.1
  });

  it('pH = 7 exactement à l’équivalence', () => {
    expect(pHAt(P, 20)).toBe(7);
  });

  it('pH basique après l’équivalence', () => {
    expect(pHAt(P, 40)).toBeGreaterThan(7);
    expect(pHAt(P, 40)).toBeCloseTo(12.52, 1);
  });

  it('NEUTRAL_CONC = 1e-7', () => {
    expect(NEUTRAL_CONC).toBe(1e-7);
  });

  it('jamais de NaN/Infinity et pH ∈ [0,14] sur tout le balayage', () => {
    const ve = equivalenceVolume(P);
    for (let i = 0; i <= 400; i++) {
      const vb = (2 * ve * i) / 400;
      const ph = pHAt(P, vb);
      expect(Number.isFinite(ph)).toBe(true);
      expect(ph).toBeGreaterThanOrEqual(0);
      expect(ph).toBeLessThanOrEqual(14);
    }
  });

  it('entrées dégénérées → retour neutre fini', () => {
    expect(pHAt({ ca: NaN, cb: 0.1, va: 20 }, 5)).toBe(7);
    expect(pHAt({ ca: 0.1, cb: 0.1, va: 0 }, 0)).toBe(7); // Va+Vb = 0
  });

  it('regionAt : avant / à / après', () => {
    expect(regionAt(P, 10)).toBe('before');
    expect(regionAt(P, 20)).toBe('at');
    expect(regionAt(P, 30)).toBe('after');
  });

  it('titrationCurve : samples+1 points, garde NaN/∞', () => {
    expect(titrationCurve(P, 40, 240)).toHaveLength(241);
    expect(titrationCurve(P, 40, Infinity)).toHaveLength(241); // pas de boucle non bornée
    expect(titrationCurve(P, 40, NaN)).toHaveLength(241);
  });
});
