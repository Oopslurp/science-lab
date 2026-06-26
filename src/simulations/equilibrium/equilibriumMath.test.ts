import { describe, it, expect } from 'vitest';
import {
  kaFromPka,
  equilibriumAdvancement,
  reactionQuotient,
  plotBound,
  equilibriumCurve,
  dissociationRate,
} from './equilibriumMath';

describe('equilibriumMath', () => {
  it('kaFromPka(4.8) ≈ 1.585e-5', () => {
    expect(kaFromPka(4.8)).toBeCloseTo(1.585e-5, 8);
  });

  it('avancement : 0 < x < C₀ (cas acide éthanoïque)', () => {
    const c0 = 0.1;
    const ka = kaFromPka(4.8);
    const x = equilibriumAdvancement(c0, ka);
    expect(x).toBeGreaterThan(0);
    expect(x).toBeLessThan(c0);
    expect(x).toBeCloseTo(1.251e-3, 5); // racine exacte (≠ approx √(KA·C₀))
  });

  it('Qr(x) = KA à l’équilibre (invariant clé)', () => {
    for (const [c0, ka] of [
      [0.1, 1e-5],
      [0.5, 1e-3],
      [0.01, 1e-2],
    ] as const) {
      const x = equilibriumAdvancement(c0, ka);
      expect(reactionQuotient(c0, x)).toBeCloseTo(ka, 12);
    }
  });

  it('KA → 0 : x → 0 (acide très faible)', () => {
    const c0 = 0.1;
    const x = equilibriumAdvancement(c0, 1e-12);
    expect(x).toBeGreaterThan(0);
    expect(x).toBeLessThan(c0 * 1e-3);
  });

  it('KA très grand : x → C₀ (dissociation quasi totale)', () => {
    const c0 = 0.1;
    const x = equilibriumAdvancement(c0, 1e6);
    expect(x).toBeGreaterThan(0.999 * c0);
    expect(x).toBeLessThanOrEqual(c0);
  });

  it('entrées invalides → 0 (fini, pas de throw)', () => {
    expect(equilibriumAdvancement(0, 1e-5)).toBe(0);
    expect(equilibriumAdvancement(0.1, 0)).toBe(0);
    expect(equilibriumAdvancement(-1, 1e-5)).toBe(0);
  });

  it('plotBound strictement < C₀ et courbe sans Infinity/NaN', () => {
    const c0 = 0.1;
    const x = equilibriumAdvancement(c0, 1e-5);
    const bound = plotBound(c0, x);
    expect(bound).toBeLessThan(c0);
    for (const p of equilibriumCurve(c0, bound)) {
      expect(Number.isFinite(p.qr)).toBe(true);
    }
  });

  it('dissociationRate = x / C₀', () => {
    expect(dissociationRate(0.1, 0.02)).toBeCloseTo(0.2);
  });
});
