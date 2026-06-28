export type ConvexityFunctionId = 'cubic' | 'quartic' | 'sine' | 'exp';

export interface ConvexityFunction {
  id: ConvexityFunctionId;
  /** Expression neutre (indépendante de la langue). */
  expr: string;
  f: (x: number) => number;
  /** Dérivée première (exacte). */
  d1: (x: number) => number;
  /** Dérivée seconde (exacte) — son signe donne la convexité. */
  d2: (x: number) => number;
  /** Fenêtre de tracé (fixe). */
  domainA: number;
  domainB: number;
  /** Point x₀ initial de la tangente. */
  defaultX0: number;
  /**
   * Abscisses EXACTES des points d'inflexion dans le domaine (f″ s'y annule EN
   * CHANGEANT de signe). Vide quand il n'y en a aucun : c'est le cas de eˣ
   * (f″ = eˣ > 0 partout) — contre-exemple pédagogique.
   */
  inflections: number[];
}

/**
 * Liste FERMÉE de fonctions à dérivées connues (pas de saisie libre ni de
 * dérivation numérique : les dérivées sont données analytiquement).
 */
export const CONVEXITY_FUNCTIONS: Record<ConvexityFunctionId, ConvexityFunction> = {
  cubic: {
    id: 'cubic',
    expr: 'x³ − 3x',
    f: (x) => x ** 3 - 3 * x,
    d1: (x) => 3 * x * x - 3,
    d2: (x) => 6 * x,
    domainA: -2.5,
    domainB: 2.5,
    defaultX0: 1,
    inflections: [0], // f″ = 6x s'annule en 0 en changeant de signe
  },
  quartic: {
    id: 'quartic',
    expr: 'x⁴ − 6x²',
    f: (x) => x ** 4 - 6 * x * x,
    d1: (x) => 4 * x ** 3 - 12 * x,
    d2: (x) => 12 * x * x - 12,
    domainA: -2.5,
    domainB: 2.5,
    defaultX0: 0,
    inflections: [-1, 1], // f″ = 12(x² − 1) s'annule en ±1
  },
  sine: {
    id: 'sine',
    expr: 'sin x',
    f: (x) => Math.sin(x),
    d1: (x) => Math.cos(x),
    d2: (x) => -Math.sin(x),
    domainA: -3.3,
    domainB: 6.5,
    defaultX0: 1.5,
    inflections: [-Math.PI, 0, Math.PI, 2 * Math.PI], // f″ = −sin x s'annule en kπ
  },
  exp: {
    id: 'exp',
    expr: 'eˣ',
    f: (x) => Math.exp(x),
    d1: (x) => Math.exp(x),
    d2: (x) => Math.exp(x),
    domainA: -2,
    domainB: 2,
    defaultX0: 0,
    inflections: [], // f″ = eˣ > 0 partout : convexe sur ℝ, AUCUNE inflexion
  },
};

/** Ordonnée de la tangente à f en x₀, évaluée en x : y = f(x₀) + f′(x₀)·(x − x₀). */
export function tangentValue(fn: ConvexityFunction, x0: number, x: number): number {
  return fn.f(x0) + fn.d1(x0) * (x - x0);
}

/**
 * Rayon d'accroche de l'effet « aimant » vers les points d'inflexion. Choisi un
 * peu au-dessus du demi-pas du curseur (0,05) pour que le point de grille le plus
 * proche d'une inflexion non alignée (ex. kπ) s'y accroche.
 */
export const INFLECTION_SNAP = 0.07;

/**
 * Effet « aimant » : si `x` est à moins de `threshold` d'un point d'inflexion,
 * renvoie l'abscisse EXACTE de l'inflexion la plus proche ; sinon renvoie `x`
 * inchangé. Permet d'atteindre les inflexions non alignées sur le pas du curseur
 * (ex. kπ pour le sinus). `threshold ≤ 0` ⇒ aucun magnétisme.
 */
export function snapToInflection(
  fn: ConvexityFunction,
  x: number,
  threshold = INFLECTION_SNAP
): number {
  let best = x;
  let bestDist = threshold;
  for (const r of fn.inflections) {
    const d = Math.abs(x - r);
    if (d < bestDist) {
      bestDist = d;
      best = r;
    }
  }
  return best;
}

export interface OsculatingCircle {
  /** Centre du cercle osculateur. */
  cx: number;
  cy: number;
  /** Rayon de courbure R = (1 + f′²)^{3/2} / |f″|. */
  r: number;
}

/**
 * Seuil de |f″| sous lequel le cercle osculateur est dégénéré (rayon → ∞ près
 * d'une inflexion) : on ne le calcule pas pour éviter une division explosive.
 */
export const CURVATURE_EPS = 1e-9;

/**
 * Cercle osculateur (cercle de courbure) à f en x₀ : le cercle qui épouse le
 * mieux la courbe (même tangente ET même courbure). Formules :
 *   cx = x₀ − f′·(1 + f′²)/f″,  cy = f(x₀) + (1 + f′²)/f″,
 *   r  = (1 + f′²)^{3/2} / |f″|.
 * Le signe de f″ place le centre du côté où la courbe se creuse (au-dessus si
 * f″ > 0, en dessous si f″ < 0). Sentinelle documentée : renvoie `null`
 * (jamais d'exception) si |f″(x₀)| < CURVATURE_EPS ou si une valeur n'est pas
 * finie — c'est-à-dire au voisinage immédiat d'un point d'inflexion.
 */
export function osculatingCircle(fn: ConvexityFunction, x0: number): OsculatingCircle | null {
  const d1 = fn.d1(x0);
  const d2 = fn.d2(x0);
  const y0 = fn.f(x0);
  if (!Number.isFinite(d1) || !Number.isFinite(d2) || !Number.isFinite(y0)) return null;
  if (Math.abs(d2) < CURVATURE_EPS) return null;

  const oneP = 1 + d1 * d1; // 1 + f′²
  const cx = x0 - (d1 * oneP) / d2;
  const cy = y0 + oneP / d2;
  const r = Math.pow(oneP, 1.5) / Math.abs(d2);
  if (!Number.isFinite(cx) || !Number.isFinite(cy) || !Number.isFinite(r)) return null;
  return { cx, cy, r };
}

export type ConvexityState = -1 | 0 | 1;

/**
 * Convexité au point x d'après le signe de f″ : +1 convexe (f″ > 0), −1 concave
 * (f″ < 0), 0 si f″ ≈ 0 (inflexion). Renvoie 0 (jamais d'exception) si f″ n'est
 * pas finie. `eps` borne le « voisinage de zéro » traité comme inflexion.
 */
export function convexitySign(fn: ConvexityFunction, x: number, eps = 1e-9): ConvexityState {
  const v = fn.d2(x);
  if (!Number.isFinite(v) || Math.abs(v) <= eps) return 0;
  return v > 0 ? 1 : -1;
}
