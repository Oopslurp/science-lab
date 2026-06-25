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
  const pts: DecayPoint[] = [];
  for (let i = 0; i <= samples; i++) {
    const t = (tMax * i) / samples;
    pts.push({ t, n: remaining(n0, halfLife, t) });
  }
  return pts;
}

/** Points repères aux demi-vies successives : (k·t½, N₀/2^k) tant que ≤ tMax. */
export function halfLifeMarkers(n0: number, halfLife: number, tMax: number): DecayPoint[] {
  const pts: DecayPoint[] = [];
  for (let k = 1; k * halfLife <= tMax + 1e-9; k++) {
    pts.push({ t: k * halfLife, n: n0 / 2 ** k });
  }
  return pts;
}
