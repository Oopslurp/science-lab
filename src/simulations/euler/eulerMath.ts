export interface EulerParams {
  y0: number; // valeur initiale
  k: number; // paramètre de l'équation y' = k·y
  h: number; // pas d'intégration
  steps: number; // nombre de pas
}

export interface Point {
  x: number;
  y: number;
}

/** Solution exacte de y' = k·y : y(x) = y₀·e^(k·x). */
export function exact(y0: number, k: number, x: number): number {
  return y0 * Math.exp(k * x);
}

/**
 * Points de la méthode d'Euler.
 * Récurrence : y_{i+1} = y_i + h·f(x_i, y_i) avec f(x, y) = k·y.
 */
export function eulerPoints({ y0, k, h, steps }: EulerParams): Point[] {
  const pts: Point[] = [{ x: 0, y: y0 }];
  let y = y0;
  for (let i = 1; i <= steps; i++) {
    y = y + h * (k * y);
    pts.push({ x: i * h, y });
  }
  return pts;
}

/** Échantillonnage fin de la solution exacte sur [0, xMax] (pour tracer une courbe lisse). */
export function exactPoints(y0: number, k: number, xMax: number, samples = 240): Point[] {
  const n = Number.isFinite(samples) ? Math.max(1, Math.floor(samples)) : 240; // garde NaN/∞ : pas de boucle non bornée
  const pts: Point[] = [];
  for (let i = 0; i <= n; i++) {
    const x = (xMax * i) / n;
    pts.push({ x, y: exact(y0, k, x) });
  }
  return pts;
}

export interface ErrorSummary {
  xMax: number;
  eulerValue: number;
  exactValue: number;
  absolute: number;
  relative: number; // 0..1
}

/** Compare la valeur finale d'Euler à la solution exacte au même point. */
export function errorSummary(p: EulerParams): ErrorSummary {
  const pts = eulerPoints(p);
  const eulerValue = pts[pts.length - 1].y;
  const xMax = p.steps * p.h;
  const exactValue = exact(p.y0, p.k, xMax);
  const absolute = Math.abs(exactValue - eulerValue);
  const relative = exactValue !== 0 ? absolute / Math.abs(exactValue) : 0;
  return { xMax, eulerValue, exactValue, absolute, relative };
}
