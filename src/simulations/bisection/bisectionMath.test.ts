import { describe, it, expect } from 'vitest';
import {
  BISECTION_FUNCTIONS,
  MAX_ITER,
  bisectionSteps,
  hasSignChange,
  type BisectionFunctionId,
} from './bisectionMath';

const IDS: BisectionFunctionId[] = ['sqrt2', 'plastic', 'dottie', 'ln3'];

describe('bisectionMath — banque de fonctions', () => {
  it('chaque fonction change de signe sur son encadrement par défaut', () => {
    for (const id of IDS) {
      const fn = BISECTION_FUNCTIONS[id];
      expect(hasSignChange(fn.f, fn.defaultA, fn.defaultB)).toBe(true);
    }
  });

  it('la racine de référence annule (presque) f et appartient à [a₀, b₀]', () => {
    for (const id of IDS) {
      const fn = BISECTION_FUNCTIONS[id];
      expect(Math.abs(fn.f(fn.root))).toBeLessThan(1e-12);
      expect(fn.root).toBeGreaterThan(fn.defaultA);
      expect(fn.root).toBeLessThan(fn.defaultB);
    }
  });
});

describe('hasSignChange — garde', () => {
  it('false si même signe aux deux bornes', () => {
    const f = (x: number) => x * x - 2;
    expect(hasSignChange(f, 2, 3)).toBe(false); // f(2)=2, f(3)=7 : tous positifs
  });

  it('false si bornes mal ordonnées (a ≥ b)', () => {
    const f = (x: number) => x * x - 2;
    expect(hasSignChange(f, 2, 1)).toBe(false);
    expect(hasSignChange(f, 1, 1)).toBe(false);
  });

  it('false sur valeur non finie', () => {
    const f = (x: number) => 1 / x; // f(0) = Infinity
    expect(hasSignChange(f, 0, 1)).toBe(false);
  });
});

describe('bisectionSteps — convergence', () => {
  it('converge vers les 4 racines de référence après MAX_ITER itérations', () => {
    for (const id of IDS) {
      const fn = BISECTION_FUNCTIONS[id];
      const steps = bisectionSteps(fn.f, fn.defaultA, fn.defaultB, MAX_ITER);
      const last = steps[steps.length - 1];
      expect(Math.abs(last.m - fn.root)).toBeLessThan(1e-7);
    }
  });

  it('la largeur de l’encadrement est divisée par 2 à chaque étape', () => {
    const fn = BISECTION_FUNCTIONS.sqrt2;
    const steps = bisectionSteps(fn.f, 1, 2, 10);
    for (let i = 1; i < steps.length; i++) {
      expect(steps[i].width).toBeCloseTo(steps[i - 1].width / 2, 12);
    }
    // Borne d'erreur : |mₙ − r| ≤ largeur / 2.
    for (const s of steps) {
      expect(Math.abs(s.m - fn.root)).toBeLessThanOrEqual(s.width / 2 + 1e-12);
    }
  });

  it('indice n = encadrement après n bissections (indice 0 = intervalle initial)', () => {
    const fn = BISECTION_FUNCTIONS.sqrt2;
    const steps = bisectionSteps(fn.f, 1, 2, MAX_ITER);
    expect(steps).toHaveLength(MAX_ITER + 1);
    expect(steps[0]).toMatchObject({ a: 1, b: 2, m: 1.5, width: 1 });
  });

  it('[] documenté si aucun changement de signe (pas d’exception)', () => {
    const fn = BISECTION_FUNCTIONS.sqrt2;
    expect(bisectionSteps(fn.f, 2, 3)).toEqual([]);
  });

  it('arrêt anticipé si un milieu annule exactement f', () => {
    const f = (x: number) => x - 0.5; // racine dyadique atteinte au 1er milieu
    const steps = bisectionSteps(f, 0, 1, MAX_ITER);
    const last = steps[steps.length - 1];
    expect(last.fm).toBe(0);
    expect(last.m).toBe(0.5);
    expect(steps.length).toBeLessThan(MAX_ITER + 1);
  });

  it('borne le nombre d’itérations sur maxIter non fini (anti-boucle infinie)', () => {
    const fn = BISECTION_FUNCTIONS.sqrt2;
    expect(bisectionSteps(fn.f, 1, 2, Infinity)).toHaveLength(MAX_ITER + 1);
    expect(bisectionSteps(fn.f, 1, 2, NaN)).toHaveLength(MAX_ITER + 1);
  });
});
