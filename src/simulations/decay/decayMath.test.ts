import { describe, it, expect } from 'vitest';
import {
  lambda,
  remaining,
  fractionRemaining,
  decayCurve,
  halfLifeMarkers,
} from './decayMath';

describe('decayMath', () => {
  it('lambda = ln2 / t½', () => {
    expect(lambda(5)).toBeCloseTo(Math.LN2 / 5);
  });

  it('lambda : garde t½ ≤ 0 → 0 (fini)', () => {
    expect(lambda(0)).toBe(0);
    expect(lambda(-3)).toBe(0);
  });

  it('remaining : N(0) = N0', () => {
    expect(remaining(200, 5, 0)).toBe(200);
  });

  it('remaining : moitié à chaque demi-vie', () => {
    expect(remaining(200, 5, 5)).toBeCloseTo(100);
    expect(remaining(200, 5, 10)).toBeCloseTo(50);
  });

  it('fractionRemaining : 1 à t=0, 1/2 à t½', () => {
    expect(fractionRemaining(5, 0)).toBeCloseTo(1);
    expect(fractionRemaining(5, 5)).toBeCloseTo(0.5);
  });

  it('decayCurve : samples+1 points, démarre à N0', () => {
    const c = decayCurve(200, 5, 30, 160);
    expect(c).toHaveLength(161);
    expect(c[0]).toEqual({ t: 0, n: 200 });
  });

  it('halfLifeMarkers : (k·t½, N0/2^k), tous ≤ tMax', () => {
    const m = halfLifeMarkers(200, 5, 30);
    expect(m[0]).toMatchObject({ t: 5 });
    expect(m[0].n).toBeCloseTo(100);
    expect(m[1].n).toBeCloseTo(50);
    expect(m.every((p) => p.t <= 30)).toBe(true);
  });
});
