// Demi-largeur de l'écran observé, de part et d'autre du centre (en mètres).
// Fixe (indépendante des paramètres) : quand l'interfrange change, le NOMBRE de
// franges visibles dans cette fenêtre change — ce qui rend l'effet observable.
export const SCREEN_HALF_WIDTH_M = 0.012; // 12 mm

/**
 * Interfrange i = λ·D / a (distance entre deux franges brillantes consécutives), en mètres.
 * λ en nm, a en mm, D en m.
 * Hors domaine (a ≤ 0 ou D ≤ 0, exclus par les curseurs) → 0 (fini, documenté) :
 * on ne propage jamais Infinity/NaN dans le graphe.
 */
export function interfringe(lambdaNm: number, dMeters: number, aMm: number): number {
  const lambda = lambdaNm * 1e-9; // m
  const a = aMm * 1e-3; // m
  if (!(a > 0) || !(dMeters > 0)) return 0;
  return (lambda * dMeters) / a;
}

/** Intensité relative I(y)/I₀ = cos²(π·a·y / (λ·D)). y en mètres. */
export function intensity(lambdaNm: number, dMeters: number, aMm: number, yMeters: number): number {
  const lambda = lambdaNm * 1e-9;
  const a = aMm * 1e-3;
  const denom = lambda * dMeters;
  if (!(denom > 0)) return 1; // garde : au centre, intensité maximale
  const c = Math.cos((Math.PI * a * yMeters) / denom);
  return c * c;
}

export interface IntensityPoint {
  yMm: number; // position sur l'écran (mm)
  i: number; // intensité relative ∈ [0, 1]
}

export function intensityProfile(
  lambdaNm: number,
  dMeters: number,
  aMm: number,
  samples = 240
): IntensityPoint[] {
  const pts: IntensityPoint[] = [];
  for (let k = 0; k <= samples; k++) {
    const yM = -SCREEN_HALF_WIDTH_M + (2 * SCREEN_HALF_WIDTH_M * k) / samples;
    pts.push({ yMm: yM * 1000, i: intensity(lambdaNm, dMeters, aMm, yM) });
  }
  return pts;
}

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

/**
 * Approximation longueur d'onde (nm) → RGB (algorithme usuel de type Bruton).
 * Objectif : correspondance qualitative correcte, pas une exactitude colorimétrique.
 */
export function wavelengthToRgb(nm: number): Rgb {
  let r = 0;
  let g = 0;
  let b = 0;
  if (nm >= 380 && nm < 440) {
    r = -(nm - 440) / (440 - 380);
    b = 1;
  } else if (nm < 490) {
    g = (nm - 440) / (490 - 440);
    b = 1;
  } else if (nm < 510) {
    g = 1;
    b = -(nm - 510) / (510 - 490);
  } else if (nm < 580) {
    r = (nm - 510) / (580 - 510);
    g = 1;
  } else if (nm < 645) {
    r = 1;
    g = -(nm - 645) / (645 - 580);
  } else if (nm <= 700) {
    r = 1;
  }

  // Atténuation aux extrémités du spectre visible.
  let factor = 1;
  if (nm >= 380 && nm < 420) factor = 0.3 + (0.7 * (nm - 380)) / (420 - 380);
  else if (nm > 700) factor = 0;
  else if (nm > 645) factor = 0.3 + (0.7 * (700 - nm)) / (700 - 645);

  const channel = (c: number) => Math.round(255 * (c * factor) ** 0.8);
  return { r: channel(r), g: channel(g), b: channel(b) };
}
