export const PKA_DEFAULT = 4.8; // acide éthanoïque (CH₃COOH) ~ pKA 4,8

// Bornes du tracé de Qr(ξ) : on s'arrête AVANT l'asymptote en ξ = C₀
// (Qr → +∞ quand ξ → C₀). On trace un peu au-delà de l'équilibre x, sans
// jamais dépasser 95 % de C₀, pour garder un graphe lisible.
export const PLOT_BOUND_C0_FRACTION = 0.95;
export const PLOT_BOUND_X_FACTOR = 2;

export interface EquilibriumParams {
  c0: number; // concentration apportée (mol/L)
  ka: number; // constante d'acidité
}

/** KA = 10^(−pKA). */
export function kaFromPka(pKa: number): number {
  return 10 ** -pKa;
}

/**
 * Avancement à l'équilibre x (mol/L), racine POSITIVE de
 * x² + KA·x − KA·C₀ = 0 (l'autre racine est négative, donc rejetée) :
 *   x = (−KA + √(KA² + 4·KA·C₀)) / 2.
 * Entrées hors domaine (exclues par les curseurs : C₀ > 0, KA > 0) → 0 (fini, documenté).
 */
export function equilibriumAdvancement(c0: number, ka: number): number {
  if (!(c0 > 0) || !(ka > 0)) return 0;
  const x = (-ka + Math.sqrt(ka * ka + 4 * ka * c0)) / 2;
  // Garde-fou : x ∈ [0, C₀] (toujours vrai mathématiquement avec cette racine).
  return Math.min(Math.max(x, 0), c0);
}

/** Quotient de réaction Qr(ξ) = ξ² / (C₀ − ξ). */
export function reactionQuotient(c0: number, xi: number): number {
  const denom = c0 - xi;
  if (denom <= 0) return NaN; // hors tracé (asymptote) : sentinelle, jamais atteinte
  return (xi * xi) / denom;
}

/** Borne supérieure du tracé en ξ : min(0,95·C₀, 2·x). */
export function plotBound(c0: number, x: number): number {
  return Math.min(PLOT_BOUND_C0_FRACTION * c0, PLOT_BOUND_X_FACTOR * x);
}

export interface QrPoint {
  xi: number;
  qr: number;
}

export function equilibriumCurve(c0: number, bound: number, samples = 160): QrPoint[] {
  const n = Math.max(1, Math.floor(samples)); // garde : pas de division par 0
  const pts: QrPoint[] = [];
  for (let i = 0; i <= n; i++) {
    const xi = (bound * i) / n;
    pts.push({ xi, qr: reactionQuotient(c0, xi) });
  }
  return pts;
}

/** Taux de dissociation α = x / C₀ ∈ [0, 1]. */
export function dissociationRate(c0: number, x: number): number {
  return c0 > 0 ? x / c0 : 0;
}
