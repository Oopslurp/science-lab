import { describe, it, expect } from 'vitest';
import {
  GM,
  R_MIN,
  circularSpeed,
  escapeSpeed,
  gravityStep,
  initialState,
  isCollision,
  theoreticalPeriod,
} from './keplerMath';

describe('keplerMath', () => {
  it('vitesses circulaire et de libération', () => {
    expect(circularSpeed(1)).toBeCloseTo(1); // √(GM/1)
    expect(circularSpeed(4)).toBeCloseTo(0.5);
    expect(escapeSpeed(1)).toBeCloseTo(Math.SQRT2);
  });

  it('gravityStep : semi-implicite (la position utilise la vitesse MISE À JOUR)', () => {
    // pos=(1,0), vel=(0,1), dt=0.01 ⇒ a=(−1,0)
    const { pos, vel } = gravityStep({ x: 1, y: 0 }, { x: 0, y: 1 }, 0.01);
    expect(vel.x).toBeCloseTo(-0.01, 12);
    expect(vel.y).toBeCloseTo(1, 12);
    // position avec vel mise à jour : x = 1 + (−0.01)·0.01 = 0.9999
    expect(pos.x).toBeCloseTo(0.9999, 12);
    expect(pos.y).toBeCloseTo(0.01, 12);
  });

  it('stabilité : orbite circulaire reste à r₀ sur des centaines de pas (pas de spirale)', () => {
    let s = initialState(1, 100); // vitesse circulaire ⇒ cercle
    for (let i = 0; i < 3000; i++) s = gravityStep(s.pos, s.vel, 0.004);
    const r = Math.hypot(s.pos.x, s.pos.y);
    expect(r).toBeGreaterThan(0.95);
    expect(r).toBeLessThan(1.05);
  });

  it('3ᵉ loi de Kepler (cas circulaire) : T²/r₀³ constant = 4π²/GM', () => {
    const c1 = theoreticalPeriod(1) ** 2 / 1 ** 3;
    const c2 = theoreticalPeriod(1.5) ** 2 / 1.5 ** 3;
    expect(c1).toBeCloseTo(c2, 10);
    expect(c1).toBeCloseTo((4 * Math.PI ** 2) / GM, 10);
  });

  it('garde-fou collision r_min', () => {
    expect(isCollision({ x: R_MIN / 2, y: 0 })).toBe(true);
    expect(isCollision({ x: 1, y: 0 })).toBe(false);
  });

  it('initialState : r₀ sur +x, vitesse perpendiculaire (sur +y)', () => {
    const s = initialState(1, 100);
    expect(s.pos).toEqual({ x: 1, y: 0 });
    expect(s.vel.x).toBeCloseTo(0);
    expect(s.vel.y).toBeCloseTo(1);
  });
});
