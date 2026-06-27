import { describe, it, expect } from 'vitest';
import {
  MAX_PARTICLES,
  MIN_PARTICLES,
  PA_PER_BAR,
  PARTICLES_PER_MOL,
  R,
  litersToM3,
  particleCount,
  pressure,
  relativeSpeed,
  toBar,
} from './idealGasMath';

describe('idealGasMath', () => {
  it('pression P = nRT/V avec conversion L → m³', () => {
    // n=2 mol, T=300 K, V=10 L = 0,01 m³ ⇒ P = 2·8,314·300 / 0,01 = 498 840 Pa.
    expect(pressure(2, 300, 10)).toBeCloseTo((2 * R * 300) / 0.01, 6);
    expect(pressure(2, 300, 10)).toBeCloseTo(498_840, 0);
  });

  it('conditions proches des CNTP : 1 mol à 273,15 K dans 22,414 L ≈ 1 atm', () => {
    const p = pressure(1, 273.15, 22.414);
    expect(toBar(p)).toBeCloseTo(1.013, 2); // ~1,013 bar (1 atm)
  });

  it('conversions : litersToM3 et toBar', () => {
    expect(litersToM3(1000)).toBeCloseTo(1, 12);
    expect(litersToM3(10)).toBeCloseTo(0.01, 12);
    expect(toBar(PA_PER_BAR)).toBeCloseTo(1, 12);
    expect(toBar(498_840)).toBeCloseTo(4.9884, 4);
  });

  it('proportionnalités : P ∝ T (à n,V fixes) et P ∝ 1/V (à n,T fixes)', () => {
    expect(pressure(1, 600, 10)).toBeCloseTo(2 * pressure(1, 300, 10), 6); // T doublé
    expect(pressure(1, 300, 5)).toBeCloseTo(2 * pressure(1, 300, 10), 6); // V divisé par 2
  });

  it('garde-fou V ≤ 0 : retour fini (0), pas d’Infinity/NaN', () => {
    expect(pressure(1, 300, 0)).toBe(0);
    expect(pressure(1, 300, -5)).toBe(0);
    expect(Number.isFinite(pressure(1, 300, 0))).toBe(true);
  });

  it('particleCount : ∝ n, borné [MIN, MAX]', () => {
    expect(particleCount(1)).toBe(PARTICLES_PER_MOL); // 1 mol ⇒ PARTICLES_PER_MOL
    expect(particleCount(2)).toBe(2 * PARTICLES_PER_MOL);
    expect(particleCount(0.1)).toBe(MIN_PARTICLES); // arrondi 2, plancher
    expect(particleCount(1000)).toBe(MAX_PARTICLES); // plafonné
    expect(particleCount(-5)).toBe(MIN_PARTICLES); // garde : n négatif ⇒ MIN
  });

  it('vitesse relative ∝ √T (mise en scène)', () => {
    expect(relativeSpeed(300)).toBeCloseTo(1, 12); // référence
    expect(relativeSpeed(1200)).toBeCloseTo(2, 12); // ×4 en T ⇒ ×2 en vitesse
    expect(relativeSpeed(0)).toBe(0);
    expect(relativeSpeed(-100)).toBe(0); // garde : T négatif ⇒ 0
  });
});
