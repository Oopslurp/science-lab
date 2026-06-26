import { describe, it, expect } from 'vitest';
import {
  GM,
  R_MIN,
  circularSpeed,
  escapeSpeed,
  gravityStep,
  initialState,
  isCollision,
  measureOrbitalPeriod,
  orbitalPeriod,
  semiMajorAxis,
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

  it('semiMajorAxis : a = r₀ au circulaire, fini pour une ellipse', () => {
    expect(semiMajorAxis(1, circularSpeed(1))).toBeCloseTo(1, 12); // v₀ = v_circ ⇒ a = r₀
    expect(semiMajorAxis(2, circularSpeed(2))).toBeCloseTo(2, 12);
    expect(Number.isFinite(semiMajorAxis(1, 0.8 * circularSpeed(1)))).toBe(true);
    expect(semiMajorAxis(1, escapeSpeed(1))).toBe(Infinity); // évasion : non liée
  });

  it('période mesurée ≈ période vis-viva 2π√(a³/GM) — cercle + ellipses', () => {
    // Au moins un cas circulaire et plusieurs ellipses d'excentricités différentes.
    const cases: Array<{ r0: number; v0Pct: number }> = [
      { r0: 1, v0Pct: 100 }, // cercle (e = 0)
      { r0: 1, v0Pct: 80 }, // ellipse (départ apoapside)
      { r0: 1, v0Pct: 120 }, // ellipse (départ périapside)
      { r0: 1.5, v0Pct: 70 }, // ellipse plus excentrique
    ];

    for (const { r0, v0Pct } of cases) {
      const v0 = (v0Pct / 100) * circularSpeed(r0);
      const tTheo = orbitalPeriod(semiMajorAxis(r0, v0));
      const tMeasured = measureOrbitalPeriod(r0, v0Pct);
      expect(tMeasured).not.toBeNull();
      const relErr = Math.abs((tMeasured as number) - tTheo) / tTheo;
      // Écart résiduel mesuré ≤ 0,06 % (vient du pas dt, pas d'un bug) ; marge ×8.
      expect(relErr).toBeLessThan(0.005);
    }
  });

  it('measureOrbitalPeriod : gardes → null (dt ≤ 0, évasion, collision)', () => {
    expect(measureOrbitalPeriod(1, 100, 0)).toBeNull(); // dt nul : pas de boucle infinie
    expect(measureOrbitalPeriod(1, 100, -0.004)).toBeNull(); // dt négatif
    expect(measureOrbitalPeriod(1, 150)).toBeNull(); // évasion (> √2·100 %) : aucun tour bouclé
    expect(measureOrbitalPeriod(0.5, 40)).toBeNull(); // trop lent : plonge → collision
  });
});
