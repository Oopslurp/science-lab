import { describe, it, expect } from 'vitest';
import {
  RIEMANN_FUNCTIONS,
  isDomainValid,
  riemannSum,
  exactIntegral,
  integralError,
} from './riemannMath';

const square = RIEMANN_FUNCTIONS.square;
const inverse = RIEMANN_FUNCTIONS.inverse;

describe('riemannMath', () => {
  it('exactIntegral : ∫₀² x² = 8/3', () => {
    expect(exactIntegral(square, 0, 2)).toBeCloseTo(8 / 3, 10);
  });

  it('riemannSum n=1 sur x² (toutes méthodes)', () => {
    expect(riemannSum(square, 0, 2, 1, 'left')).toBeCloseTo(0); // f(0)·2
    expect(riemannSum(square, 0, 2, 1, 'right')).toBeCloseTo(8); // f(2)·2
    expect(riemannSum(square, 0, 2, 1, 'midpoint')).toBeCloseTo(2); // f(1)·2
    expect(riemannSum(square, 0, 2, 1, 'trapezoid')).toBeCloseTo(4); // (0+4)/2·2
  });

  it('fonction CROISSANTE : droite sur-estime, gauche sous-estime', () => {
    const exact = exactIntegral(square, 0, 2);
    expect(riemannSum(square, 0, 2, 10, 'right')).toBeGreaterThan(exact);
    expect(riemannSum(square, 0, 2, 10, 'left')).toBeLessThan(exact);
  });

  it('fonction DÉCROISSANTE (1/x) : gauche sur-estime, droite sous-estime', () => {
    const exact = exactIntegral(inverse, 1, 2); // ln 2
    expect(riemannSum(inverse, 1, 2, 10, 'left')).toBeGreaterThan(exact);
    expect(riemannSum(inverse, 1, 2, 10, 'right')).toBeLessThan(exact);
  });

  it('convergence : n grand → somme proche de l’exact', () => {
    const exact = exactIntegral(square, 0, 2);
    expect(riemannSum(square, 0, 2, 5000, 'left')).toBeCloseTo(exact, 2);
  });

  it('milieu plus précis que gauche (même n)', () => {
    expect(integralError(square, 0, 2, 8, 'midpoint')).toBeLessThan(
      integralError(square, 0, 2, 8, 'left')
    );
  });

  it('domaine invalide 1/x (intervalle contenant 0) : géré, pas de plantage', () => {
    expect(isDomainValid(inverse, -1, 2)).toBe(false);
    expect(() => riemannSum(inverse, -1, 2, 10, 'left')).not.toThrow();
    expect(Number.isNaN(riemannSum(inverse, -1, 2, 10, 'left'))).toBe(true);
  });

  it('garde a < b et n ≥ 1', () => {
    expect(Number.isNaN(riemannSum(square, 2, 2, 4, 'left'))).toBe(true);
    expect(Number.isNaN(riemannSum(square, 0, 2, 0, 'left'))).toBe(true);
  });
});
