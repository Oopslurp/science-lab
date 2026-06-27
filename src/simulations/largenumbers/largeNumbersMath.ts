/**
 * Loi des grands nombres & inégalité de Bienaymé-Tchebychev.
 *
 * On tire N échantillons de taille n d'une loi choisie, on calcule la moyenne Mₙ de
 * chacun, puis on compare :
 *  - la PROPORTION RÉELLE des Mₙ tombant dans la bande [μ − kσ/√n, μ + kσ/√n] ;
 *  - la BORNE GARANTIE par Tchebychev : P(|Mₙ − μ| < kσ/√n) ≥ 1 − 1/k².
 * Le cœur pédagogique : la réalité dépasse (largement) la borne, qui est volontairement
 * pessimiste — et ce, quelle que soit la loi.
 */

export type LawId = 'dice' | 'coin' | 'uniform';

/** Garde-fou de performance : borne le nombre total de tirages n × N. */
export const MAX_TOTAL_DRAWS = 300_000;

/** Plafond d'AFFICHAGE des tirages individuels (le calcul, lui, utilise tous les n). */
export const MAX_DISPLAYED_DRAWS = 25;

/** Variance d'un dé équilibré à 6 faces : (6² − 1) / 12 = 35/12. */
export const DICE_VARIANCE = 35 / 12;
/** Variance d'une loi uniforme continue sur [0, 1] : 1/12. */
export const UNIFORM_VARIANCE = 1 / 12;

/** PRNG mulberry32 : déterministe à graine fixée (reproductible dans les tests). */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp01(x: number): number {
  return Math.min(1, Math.max(0, x));
}

export interface LawStats {
  mean: number; // μ
  variance: number; // σ²
  std: number; // σ
}

/** Espérance et variance théoriques de la loi (p n'est utilisé que pour la pièce). */
export function lawStats(law: LawId, p: number): LawStats {
  let mean: number;
  let variance: number;
  if (law === 'dice') {
    mean = 3.5;
    variance = DICE_VARIANCE;
  } else if (law === 'coin') {
    const q = clamp01(p);
    mean = q;
    variance = q * (1 - q);
  } else {
    mean = 0.5;
    variance = UNIFORM_VARIANCE;
  }
  return { mean, variance, std: Math.sqrt(Math.max(0, variance)) };
}

/** Un tirage de la loi choisie via le générateur rng (∈ [0, 1)). */
export function drawOne(law: LawId, p: number, rng: () => number): number {
  if (law === 'dice') return Math.floor(rng() * 6) + 1; // 1..6
  if (law === 'coin') return rng() < clamp01(p) ? 1 : 0; // Bernoulli(p)
  return rng(); // uniforme continu [0, 1)
}

/** n tirages bruts d'un échantillon (sert à l'animation d'un échantillon représentatif). */
export function sampleDraws(law: LawId, p: number, n: number, rng: () => number): number[] {
  const m = Math.max(1, Math.floor(n));
  const out = new Array<number>(m);
  for (let i = 0; i < m; i++) out[i] = drawOne(law, p, rng);
  return out;
}

/** Moyenne arithmétique (retour 0 documenté si liste vide). */
export function average(values: number[]): number {
  if (values.length === 0) return 0;
  let s = 0;
  for (const v of values) s += v;
  return s / values.length;
}

/** Moyenne Mₙ d'un échantillon de n tirages (utilise TOUS les n tirages). */
export function sampleMean(law: LawId, p: number, n: number, rng: () => number): number {
  const m = Math.max(1, Math.floor(n));
  let s = 0;
  for (let i = 0; i < m; i++) s += drawOne(law, p, rng);
  return s / m;
}

/** Garde perf : limite N pour que n × N ≤ MAX_TOTAL_DRAWS. */
export function clampSampleN(n: number, N: number): number {
  const m = Math.max(1, Math.floor(n));
  const maxN = Math.max(1, Math.floor(MAX_TOTAL_DRAWS / m));
  return Math.min(Math.max(1, Math.floor(N)), maxN);
}

/** N moyennes Mₙ (N borné par clampSampleN). rng par défaut = Math.random (exécution). */
export function simulateMeans(
  law: LawId,
  p: number,
  n: number,
  N: number,
  rng: () => number = Math.random
): number[] {
  const count = clampSampleN(n, N);
  const out = new Array<number>(count);
  for (let i = 0; i < count; i++) out[i] = sampleMean(law, p, n, rng);
  return out;
}

/** Borne de Tchebychev : 1 − 1/k² (≥ 0). k ≤ 0 → 0 (documenté). */
export function chebyshevBound(k: number): number {
  if (!(k > 0)) return 0;
  return Math.max(0, 1 - 1 / (k * k));
}

/** Demi-largeur de la bande de concentration : k·σ/√n. */
export function bandHalfWidth(std: number, n: number, k: number): number {
  const m = Math.max(1, Math.floor(n));
  return (k * std) / Math.sqrt(m);
}

/** Proportion des moyennes dans la bande |Mₙ − μ| < demi-largeur (inégalité stricte). */
export function proportionInBand(means: number[], mu: number, halfWidth: number): number {
  if (means.length === 0) return 0;
  let c = 0;
  for (const x of means) if (Math.abs(x - mu) < halfWidth) c++;
  return c / means.length;
}

export interface HistogramBin {
  x0: number; // borne basse
  x1: number; // borne haute
  mid: number; // centre (abscisse de la barre)
  count: number;
}

/** Répartit `values` en `binCount` classes régulières sur [lo, hi]. */
export function histogramBins(
  values: number[],
  binCount: number,
  lo: number,
  hi: number
): HistogramBin[] {
  const b = Math.max(1, Math.floor(binCount));
  let a = lo;
  let z = hi;
  if (!(z > a)) {
    // dégénéré (toutes les valeurs identiques) : fenêtre minimale autour de la valeur
    a = lo - 0.5;
    z = hi + 0.5;
  }
  const width = (z - a) / b;
  const bins: HistogramBin[] = Array.from({ length: b }, (_, i) => ({
    x0: a + i * width,
    x1: a + (i + 1) * width,
    mid: a + (i + 0.5) * width,
    count: 0,
  }));
  for (const v of values) {
    let idx = Math.floor((v - a) / width);
    if (idx < 0) idx = 0;
    else if (idx >= b) idx = b - 1;
    bins[idx].count++;
  }
  return bins;
}
