import { describe, it, expect } from 'vitest';
import {
  CONVEXITY_FUNCTIONS,
  INFLECTION_SNAP,
  convexitySign,
  osculatingCircle,
  snapToInflection,
  tangentValue,
  type ConvexityFunctionId,
} from './convexityMath';

const IDS: ConvexityFunctionId[] = ['cubic', 'quartic', 'sine', 'exp'];

describe('convexityMath — points d’inflexion déclarés', () => {
  it('chaque inflexion annule f″ en changeant de signe, et appartient au domaine', () => {
    for (const id of IDS) {
      const fn = CONVEXITY_FUNCTIONS[id];
      for (const r of fn.inflections) {
        expect(Math.abs(fn.d2(r))).toBeLessThan(1e-9);
        expect(r).toBeGreaterThanOrEqual(fn.domainA);
        expect(r).toBeLessThanOrEqual(fn.domainB);
        // changement de signe de f″ de part et d'autre
        expect(fn.d2(r - 0.05) * fn.d2(r + 0.05)).toBeLessThan(0);
      }
    }
  });

  it('eˣ : convexe partout (f″ > 0), AUCUN point d’inflexion', () => {
    const fn = CONVEXITY_FUNCTIONS.exp;
    expect(fn.inflections).toEqual([]);
    for (const x of [-2, -1, 0, 1, 2]) {
      expect(convexitySign(fn, x)).toBe(1);
    }
  });
});

describe('convexitySign', () => {
  it('cubique : concave avant 0, convexe après, inflexion en 0', () => {
    const fn = CONVEXITY_FUNCTIONS.cubic;
    expect(convexitySign(fn, -0.5)).toBe(-1);
    expect(convexitySign(fn, 0)).toBe(0);
    expect(convexitySign(fn, 0.5)).toBe(1);
  });

  it('quartique : convexe à l’extérieur de [−1, 1], concave à l’intérieur', () => {
    const fn = CONVEXITY_FUNCTIONS.quartic;
    expect(convexitySign(fn, -2)).toBe(1);
    expect(convexitySign(fn, 0)).toBe(-1);
    expect(convexitySign(fn, 2)).toBe(1);
    expect(convexitySign(fn, -1)).toBe(0);
    expect(convexitySign(fn, 1)).toBe(0);
  });
});

describe('snapToInflection — effet aimant', () => {
  it('accroche à l’inflexion exacte (kπ) le point de grille le plus proche', () => {
    const fn = CONVEXITY_FUNCTIONS.sine;
    expect(snapToInflection(fn, 3.1)).toBe(Math.PI); // |3,1 − π| ≈ 0,042 < seuil
    expect(snapToInflection(fn, 0.04)).toBe(0);
  });

  it('ne s’accroche pas au-delà du seuil', () => {
    const fn = CONVEXITY_FUNCTIONS.sine;
    expect(snapToInflection(fn, 3.0)).toBe(3.0); // |3,0 − π| ≈ 0,142 > seuil
  });

  it('renvoie l’inflexion la plus proche quand deux sont candidates', () => {
    const fn = CONVEXITY_FUNCTIONS.quartic; // inflexions en ±1
    expect(snapToInflection(fn, 0.96)).toBe(1);
    expect(snapToInflection(fn, -1.05)).toBe(-1);
  });

  it('sans inflexion (eˣ), ne modifie jamais x', () => {
    const fn = CONVEXITY_FUNCTIONS.exp;
    expect(snapToInflection(fn, 0.0)).toBe(0.0);
    expect(snapToInflection(fn, 1.23)).toBe(1.23);
  });

  it('seuil ≤ 0 ⇒ aucun magnétisme', () => {
    const fn = CONVEXITY_FUNCTIONS.cubic;
    expect(snapToInflection(fn, 0.03, 0)).toBe(0.03);
    expect(INFLECTION_SNAP).toBeGreaterThan(0);
  });
});

describe('osculatingCircle — cercle de courbure', () => {
  it('valeurs de référence (cubique en x₀ = 1 : f′ = 0, f″ = 6)', () => {
    const fn = CONVEXITY_FUNCTIONS.cubic;
    const c = osculatingCircle(fn, 1);
    expect(c).not.toBeNull();
    expect(c!.cx).toBeCloseTo(1, 12);
    expect(c!.cy).toBeCloseTo(-2 + 1 / 6, 12); // f(1) + (1+0)/6
    expect(c!.r).toBeCloseTo(1 / 6, 12);
  });

  it('centre au-dessus de la courbe si convexe, en dessous si concave', () => {
    const cubic = CONVEXITY_FUNCTIONS.cubic; // f″(1) = 6 > 0
    const cc = osculatingCircle(cubic, 1)!;
    expect(cc.cy).toBeGreaterThan(cubic.f(1));

    const quartic = CONVEXITY_FUNCTIONS.quartic; // f″(0) = −12 < 0
    const cq = osculatingCircle(quartic, 0)!;
    expect(cq.cy).toBeLessThan(quartic.f(0));
  });

  it('null au voisinage immédiat d’une inflexion (|f″| < seuil)', () => {
    const fn = CONVEXITY_FUNCTIONS.cubic;
    expect(osculatingCircle(fn, 0)).toBeNull(); // f″(0) = 0
  });

  it('le rayon croît quand x₀ s’approche d’une inflexion', () => {
    const fn = CONVEXITY_FUNCTIONS.cubic; // inflexion en 0
    const far = osculatingCircle(fn, 0.5)!;
    const near = osculatingCircle(fn, 0.1)!;
    expect(near.r).toBeGreaterThan(far.r);
  });

  it('eˣ : cercle toujours défini, centre toujours au-dessus (convexe)', () => {
    const fn = CONVEXITY_FUNCTIONS.exp;
    for (const x of [-1.5, 0, 1.2]) {
      const c = osculatingCircle(fn, x);
      expect(c).not.toBeNull();
      expect(c!.cy).toBeGreaterThan(fn.f(x));
    }
  });
});

describe('tangentValue', () => {
  it('la tangente touche la courbe en x₀ (égalité) et a la bonne pente', () => {
    for (const id of IDS) {
      const fn = CONVEXITY_FUNCTIONS[id];
      const x0 = fn.defaultX0;
      expect(tangentValue(fn, x0, x0)).toBeCloseTo(fn.f(x0), 12);
      // pente locale ≈ f′(x₀)
      const h = 1e-4;
      const slope = (tangentValue(fn, x0, x0 + h) - tangentValue(fn, x0, x0 - h)) / (2 * h);
      expect(slope).toBeCloseTo(fn.d1(x0), 6);
    }
  });

  it('fonction convexe (eˣ) : la courbe est au-dessus de chaque tangente', () => {
    const fn = CONVEXITY_FUNCTIONS.exp;
    const x0 = 0.3;
    for (let x = -2; x <= 2; x += 0.25) {
      expect(fn.f(x)).toBeGreaterThanOrEqual(tangentValue(fn, x0, x) - 1e-12);
    }
  });

  it('fonction concave (sin sur ]0, π[) : la courbe est en dessous de chaque tangente', () => {
    const fn = CONVEXITY_FUNCTIONS.sine;
    const x0 = Math.PI / 2; // concave ici (f″ = −sin < 0)
    for (let x = 0.2; x <= 3; x += 0.2) {
      expect(fn.f(x)).toBeLessThanOrEqual(tangentValue(fn, x0, x) + 1e-12);
    }
  });
});
