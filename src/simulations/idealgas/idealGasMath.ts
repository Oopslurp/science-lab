/**
 * Gaz parfait : équation d'état P = n·R·T / V.
 * Unités : T en kelvin (K), V réglé en litres dans l'UI mais converti en m³ pour le calcul
 * (V_m³ = V_L / 1000), n en mol, P calculé en pascals (Pa) puis aussi exprimé en bar.
 */

/** Constante des gaz parfaits R = 8,314 J·mol⁻¹·K⁻¹. */
export const R = 8.314;

/** 1 bar = 100 000 Pa. */
export const PA_PER_BAR = 100_000;

/**
 * Particules DESSINÉES par mole (mise en scène, ILLUSTRATIF).
 * Le nombre affiché est PROPORTIONNEL à n, mais énormément réduit : chaque point
 * représente en réalité un nombre gigantesque d'entités (une mole ≈ 6·10²³, impossible
 * à dessiner). Sert à visualiser « plus de matière = plus de particules = plus de chocs ».
 */
export const PARTICLES_PER_MOL = 20;
export const MIN_PARTICLES = 2; // au moins quelques points, même à très petit n
export const MAX_PARTICLES = 120; // plafond de lisibilité / performance

/** Nombre de particules à dessiner pour une quantité n (mol) : ∝ n, borné. */
export function particleCount(n: number): number {
  const count = Math.round(Math.max(0, n) * PARTICLES_PER_MOL);
  return Math.min(MAX_PARTICLES, Math.max(MIN_PARTICLES, count));
}

/** Litres → m³. */
export function litersToM3(vLitres: number): number {
  return vLitres / 1000;
}

/**
 * Pression P = n·R·T / V (en Pa), V donné en litres.
 * V ≤ 0 est hors domaine (exclu par le curseur, borne min > 0) : retour 0 fini et documenté
 * plutôt qu'une division par zéro (Infinity) qui polluerait l'affichage.
 */
export function pressure(n: number, T: number, vLitres: number): number {
  const vM3 = litersToM3(vLitres);
  if (!(vM3 > 0)) return 0;
  const p = (n * R * T) / vM3;
  return Number.isFinite(p) ? p : 0;
}

/** Pa → bar. */
export function toBar(pa: number): number {
  return pa / PA_PER_BAR;
}

/**
 * Norme de vitesse RELATIVE d'agitation, ∝ √T (mise en scène, pas un calcul cinétique
 * exact) : référence 1 à T_REF. Sert seulement à animer plus ou moins vite les particules.
 */
export const SPEED_T_REF = 300; // K
export function relativeSpeed(T: number): number {
  return Math.sqrt(Math.max(0, T) / SPEED_T_REF);
}
