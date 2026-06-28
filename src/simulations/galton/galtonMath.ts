/** Nombre maximal de billes animées simultanément (garde performance). */
export const MAX_ANIMATED_BALLS = 50;

/**
 * Coefficient binomial C(n, k), par la formule MULTIPLICATIVE (pas de factorielle,
 * donc pas de débordement pour les n usuels) en exploitant la symétrie
 * C(n, k) = C(n, n−k). Renvoie 0 (jamais d'exception) si n, k ne sont pas des
 * entiers ≥ 0 ou si k > n.
 */
export function binomialCoefficient(n: number, k: number): number {
  if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0 || k < 0 || k > n) return 0;
  const kk = Math.min(k, n - k); // symétrie : moins d'itérations
  let result = 1;
  for (let i = 1; i <= kk; i++) {
    result = (result * (n - kk + i)) / i;
  }
  return Math.round(result); // gomme l'erreur d'arrondi flottant (résultat entier)
}

/**
 * Probabilité binomiale P(X = k) = C(n, k)·pᵏ·(1−p)^(n−k) pour n épreuves de
 * Bernoulli de paramètre p. Renvoie NaN si p n'est pas fini, 0 si k est hors [0, n].
 */
export function binomialProbability(n: number, k: number, p: number): number {
  if (!Number.isFinite(p)) return NaN;
  const c = binomialCoefficient(n, k);
  if (c === 0) return 0;
  return c * Math.pow(p, k) * Math.pow(1 - p, n - k); // 0^0 = 1 ⇒ cas p∈{0,1} corrects
}

/** Loi binomiale complète : [P(X=0), …, P(X=n)]. `[]` si n n'est pas un entier ≥ 0. */
export function binomialDistribution(n: number, p: number): number[] {
  if (!Number.isInteger(n) || n < 0) return [];
  const out: number[] = [];
  for (let k = 0; k <= n; k++) out.push(binomialProbability(n, k, p));
  return out;
}

/** Espérance d'une loi binomiale : μ = n·p. NaN sur entrée non finie. */
export function binomialMean(n: number, p: number): number {
  if (!Number.isFinite(n) || !Number.isFinite(p)) return NaN;
  return n * p;
}

/** Écart-type d'une loi binomiale : σ = √(n·p·(1−p)). NaN sur entrée non finie. */
export function binomialStdDev(n: number, p: number): number {
  if (!Number.isFinite(n) || !Number.isFinite(p)) return NaN;
  return Math.sqrt(Math.max(0, n * p * (1 - p)));
}

/**
 * Densité de la loi normale N(μ, σ) en x — pour superposer l'approximation
 * gaussienne (théorème central limite) à la loi binomiale. Renvoie 0 si σ ≤ 0
 * ou sur entrée non finie (jamais d'exception).
 */
export function normalPdf(x: number, mu: number, sigma: number): number {
  if (!Number.isFinite(x) || !Number.isFinite(mu) || !Number.isFinite(sigma) || sigma <= 0) return 0;
  const z = (x - mu) / sigma;
  return Math.exp(-0.5 * z * z) / (sigma * Math.sqrt(2 * Math.PI));
}
