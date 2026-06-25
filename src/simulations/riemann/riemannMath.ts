export type RiemannMethod = 'left' | 'right' | 'midpoint' | 'trapezoid';

export type RiemannFunctionId = 'square' | 'inverse' | 'exp' | 'sin';

export interface RiemannFunction {
  id: RiemannFunctionId;
  expr: string; // notation neutre (indépendante de la langue)
  f: (x: number) => number;
  F: (x: number) => number; // primitive exacte (pour la valeur exacte de l'intégrale)
  /** true si f n'est définie que pour x > 0 (cas 1/x) : interdit un intervalle contenant 0. */
  positiveDomain: boolean;
}

/** Liste FERMÉE de fonctions (pas de saisie libre d'expression). */
export const RIEMANN_FUNCTIONS: Record<RiemannFunctionId, RiemannFunction> = {
  square: { id: 'square', expr: 'x²', f: (x) => x * x, F: (x) => x ** 3 / 3, positiveDomain: false },
  inverse: { id: 'inverse', expr: '1/x', f: (x) => 1 / x, F: (x) => Math.log(x), positiveDomain: true },
  exp: { id: 'exp', expr: 'eˣ', f: (x) => Math.exp(x), F: (x) => Math.exp(x), positiveDomain: false },
  sin: { id: 'sin', expr: 'sin(x)', f: (x) => Math.sin(x), F: (x) => -Math.cos(x), positiveDomain: false },
};

/** Domaine valide : a < b, et a > 0 si la fonction n'est définie que pour x > 0. */
export function isDomainValid(fn: RiemannFunction, a: number, b: number): boolean {
  if (!(a < b)) return false;
  if (fn.positiveDomain && a <= 0) return false;
  return true;
}

/**
 * Somme de Riemann (aire approchée) sur [a, b] en n sous-intervalles.
 * Sentinelle documentée : renvoie NaN si le domaine est invalide ou n < 1
 * (l'appelant vérifie isDomainValid et n'affiche jamais ce NaN dans le graphe).
 */
export function riemannSum(
  fn: RiemannFunction,
  a: number,
  b: number,
  n: number,
  method: RiemannMethod
): number {
  if (!isDomainValid(fn, a, b) || !Number.isInteger(n) || n < 1) return NaN;
  const h = (b - a) / n;

  if (method === 'trapezoid') {
    let sum = (fn.f(a) + fn.f(b)) / 2;
    for (let i = 1; i < n; i++) sum += fn.f(a + i * h);
    return sum * h;
  }

  let sum = 0;
  for (let i = 0; i < n; i++) {
    const x0 = a + i * h;
    const sample = method === 'left' ? x0 : method === 'right' ? x0 + h : x0 + h / 2;
    sum += fn.f(sample);
  }
  return sum * h;
}

/** Valeur exacte de l'intégrale via la primitive : ∫ₐᵇ f = F(b) − F(a). */
export function exactIntegral(fn: RiemannFunction, a: number, b: number): number {
  return fn.F(b) - fn.F(a);
}

/** Erreur absolue entre la somme approchée et la valeur exacte. */
export function integralError(
  fn: RiemannFunction,
  a: number,
  b: number,
  n: number,
  method: RiemannMethod
): number {
  return Math.abs(exactIntegral(fn, a, b) - riemannSum(fn, a, b, n, method));
}
