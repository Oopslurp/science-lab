import { describe, it, expect } from 'vitest';
import {
  EARTH_G,
  M_REF,
  MOON_G,
  energySeries,
  flightTime,
  maxHeight,
  mechanicalEnergy,
  range,
} from './projectileMath';

// Référence numérique indépendante des formules fermées : on résout y(t) = 0 par
// dichotomie, puis on en déduit portée (x au temps de vol) et hauteur (max de y).
function numericFlightTime(v0: number, thetaDeg: number, g: number): number {
  const th = (thetaDeg * Math.PI) / 180;
  const y = (t: number) => v0 * Math.sin(th) * t - 0.5 * g * t * t;
  let lo = 1e-9; // y(lo) > 0
  let hi = (4 * v0) / g + 100; // bien au-delà de la racine 2v₀sinθ/g
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    if (y(mid) > 0) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

function numericRange(v0: number, thetaDeg: number, g: number): number {
  const th = (thetaDeg * Math.PI) / 180;
  return v0 * Math.cos(th) * numericFlightTime(v0, thetaDeg, g);
}

function numericMaxHeight(v0: number, thetaDeg: number, g: number): number {
  const th = (thetaDeg * Math.PI) / 180;
  const tEnd = numericFlightTime(v0, thetaDeg, g);
  let h = 0;
  const N = 20000;
  for (let i = 0; i <= N; i++) {
    const t = (tEnd * i) / N;
    h = Math.max(h, v0 * Math.sin(th) * t - 0.5 * g * t * t);
  }
  return h;
}

describe('projectileMath', () => {
  const cases: Array<{ v0: number; theta: number; g: number }> = [
    { v0: 20, theta: 45, g: EARTH_G },
    { v0: 15, theta: 30, g: EARTH_G },
    { v0: 25, theta: 70, g: MOON_G },
    { v0: 12, theta: 55, g: 3.71 },
  ];

  it('portée et hauteur ≈ référence numérique (résolution de y(t)=0)', () => {
    for (const { v0, theta, g } of cases) {
      expect(flightTime(v0, theta, g)).toBeCloseTo(numericFlightTime(v0, theta, g), 4);
      expect(range(v0, theta, g)).toBeCloseTo(numericRange(v0, theta, g), 3);
      expect(maxHeight(v0, theta, g)).toBeCloseTo(numericMaxHeight(v0, theta, g), 4);
    }
  });

  it('la portée est maximale à θ = 45° (balayage d’angles)', () => {
    const v0 = 22;
    const g = EARTH_G;
    let best = -Infinity;
    let bestAngle = 0;
    for (let a = 5; a <= 85; a += 5) {
      const r = range(v0, a, g);
      if (r > best) {
        best = r;
        bestAngle = a;
      }
    }
    expect(bestAngle).toBe(45);
    // 45° domine strictement deux angles symétriques quelconques.
    expect(range(v0, 45, g)).toBeGreaterThan(range(v0, 30, g));
    expect(range(v0, 45, g)).toBeGreaterThan(range(v0, 60, g));
  });

  it('Em(t) reste constante = ½·M_REF·v₀² tout au long du tir', () => {
    for (const { v0, theta, g } of cases) {
      const expected = 0.5 * M_REF * v0 * v0;
      const tEnd = flightTime(v0, theta, g);
      for (let i = 0; i <= 10; i++) {
        const t = (tEnd * i) / 10;
        expect(mechanicalEnergy(t, v0, theta, g)).toBeCloseTo(expected, 9);
      }
    }
  });

  it('Em est plate dans la série d’énergies (Ec + Ep = Em à chaque point)', () => {
    const s = energySeries(20, 40, EARTH_G, 50);
    const em0 = s[0].em;
    for (const p of s) {
      expect(p.ec + p.ep).toBeCloseTo(p.em, 9);
      expect(p.em).toBeCloseTo(em0, 9);
    }
  });

  it('garde-fou g ≤ 0 : retours finis (pas d’Infinity/NaN)', () => {
    expect(flightTime(20, 45, 0)).toBe(0);
    expect(range(20, 45, 0)).toBe(0);
    expect(maxHeight(20, 45, 0)).toBe(0);
    expect(range(20, 45, -5)).toBe(0);
    // entrées non finies (NaN/Infinity) → 0 fini, jamais NaN/Infinity
    expect(range(NaN, 45, EARTH_G)).toBe(0);
    expect(flightTime(20, NaN, EARTH_G)).toBe(0);
    expect(maxHeight(Infinity, 45, EARTH_G)).toBe(0);
  });
});
