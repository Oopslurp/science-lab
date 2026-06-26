export interface DecayPoint {
  t: number;
  n: number;
}

/** Constante radioactive λ = ln2 / t½. */
export function lambda(halfLife: number): number {
  // t½ ≤ 0 n'a pas de sens (et est exclu par les sliders) : retour fini (pas de désintégration).
  return halfLife > 0 ? Math.LN2 / halfLife : 0;
}

/** Loi exacte : N(t) = N₀·e^(−λt). */
export function remaining(n0: number, halfLife: number, t: number): number {
  return n0 * Math.exp(-lambda(halfLife) * t);
}

/** Fraction de noyaux restants : N(t)/N₀ = e^(−λt) ∈ [0, 1]. */
export function fractionRemaining(halfLife: number, t: number): number {
  return Math.exp(-lambda(halfLife) * t);
}

/** Échantillonnage de la courbe de décroissance sur [0, tMax]. */
export function decayCurve(
  n0: number,
  halfLife: number,
  tMax: number,
  samples = 160
): DecayPoint[] {
  const n = Math.max(1, Math.floor(samples)); // garde : pas de division par 0
  const pts: DecayPoint[] = [];
  for (let i = 0; i <= n; i++) {
    const t = (tMax * i) / n;
    pts.push({ t, n: remaining(n0, halfLife, t) });
  }
  return pts;
}

/** Points repères aux demi-vies successives : (k·t½, N₀/2^k) tant que ≤ tMax. */
export function halfLifeMarkers(n0: number, halfLife: number, tMax: number): DecayPoint[] {
  // Garde : t½ ≤ 0 (ou tMax ≤ 0) ferait boucler indéfiniment → liste vide.
  if (!(halfLife > 0) || !(tMax > 0)) return [];
  const pts: DecayPoint[] = [];
  for (let k = 1; k * halfLife <= tMax + 1e-9; k++) {
    pts.push({ t: k * halfLife, n: n0 / 2 ** k });
  }
  return pts;
}
