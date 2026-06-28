export type BisectionFunctionId = 'sqrt2' | 'plastic' | 'dottie' | 'ln3';

export interface BisectionFunction {
  id: BisectionFunctionId;
  /** Expression neutre (indépendante de la langue). */
  expr: string;
  f: (x: number) => number;
  /** Encadrement initial [a, b] proposé (f y change de signe). */
  defaultA: number;
  defaultB: number;
  /** Racine exacte (référence connue) — sert à afficher l'erreur, pas au calcul. */
  root: number;
}

/**
 * Nombre plastique : unique racine réelle de x³ − x − 1 = 0
 * (analogue cubique du nombre d'or). Valeur figée en double précision.
 */
export const PLASTIC_NUMBER = 1.3247179572447458;

/**
 * Nombre de Dottie : unique solution réelle de cos x = x
 * (point fixe du cosinus). Valeur figée en double précision.
 */
export const DOTTIE_NUMBER = 0.7390851332151607;

/**
 * Nombre maximal d'itérations. Au-delà, la largeur de l'encadrement
 * (divisée par 2 à chaque pas) passe sous le seuil de précision des doubles :
 * itérer davantage ne change plus rien (le milieu n'évolue plus).
 */
export const MAX_ITER = 30;

/**
 * Liste FERMÉE de fonctions (pas de saisie libre). Chacune n'a qu'UNE racine
 * sur [0, +∞[, ce qui garantit que tout encadrement valide (a ≥ 0) cible
 * bien cette racine — l'erreur affichée est donc toujours correcte.
 */
export const BISECTION_FUNCTIONS: Record<BisectionFunctionId, BisectionFunction> = {
  sqrt2: { id: 'sqrt2', expr: 'x² − 2', f: (x) => x * x - 2, defaultA: 1, defaultB: 2, root: Math.SQRT2 },
  plastic: {
    id: 'plastic',
    expr: 'x³ − x − 1',
    f: (x) => x ** 3 - x - 1,
    defaultA: 1,
    defaultB: 2,
    root: PLASTIC_NUMBER,
  },
  dottie: {
    id: 'dottie',
    expr: 'cos x − x',
    f: (x) => Math.cos(x) - x,
    defaultA: 0,
    defaultB: 1,
    root: DOTTIE_NUMBER,
  },
  ln3: { id: 'ln3', expr: 'eˣ − 3', f: (x) => Math.exp(x) - 3, defaultA: 0, defaultB: 2, root: Math.log(3) },
};

/**
 * true si f change de signe sur [a, b] (condition du théorème des valeurs
 * intermédiaires). Exige a < b et deux valeurs finies de signes opposés ;
 * renvoie false (jamais d'exception) sur entrée dégénérée ou NaN/Infinity.
 */
export function hasSignChange(f: (x: number) => number, a: number, b: number): boolean {
  if (!(a < b)) return false;
  const fa = f(a);
  const fb = f(b);
  if (!Number.isFinite(fa) || !Number.isFinite(fb)) return false;
  return fa * fb < 0;
}

export interface BisectionStep {
  /** Encadrement courant. */
  a: number;
  b: number;
  /** Milieu m = (a + b) / 2 — approximation courante de la racine. */
  m: number;
  /** f(m), dont le signe décide quelle moitié on conserve. */
  fm: number;
  /** Largeur b − a de l'encadrement courant (≈ 2 × l'incertitude sur la racine). */
  width: number;
}

/**
 * Suite des états de la dichotomie sur [a₀, b₀]. L'élément d'indice n décrit
 * l'encadrement après n bissections (indice 0 = encadrement initial).
 *
 * Sentinelle documentée : renvoie `[]` si f ne change pas de signe sur [a₀, b₀]
 * (l'appelant teste/affiche ce cas), jamais d'exception. Arrêt anticipé si un
 * milieu annule exactement f (racine atteinte). Le nombre d'itérations est borné
 * (NaN/Infinity → MAX_ITER) : aucune boucle non maîtrisée.
 */
export function bisectionSteps(
  f: (x: number) => number,
  a0: number,
  b0: number,
  maxIter: number = MAX_ITER
): BisectionStep[] {
  if (!hasSignChange(f, a0, b0)) return [];
  const n = Number.isFinite(maxIter)
    ? Math.max(0, Math.min(MAX_ITER, Math.floor(maxIter)))
    : MAX_ITER;

  let a = a0;
  let b = b0;
  let fa = f(a);
  const steps: BisectionStep[] = [];
  for (let i = 0; i <= n; i++) {
    const m = (a + b) / 2;
    const fm = f(m);
    steps.push({ a, b, m, fm, width: b - a });
    if (fm === 0) break; // racine exacte atteinte
    // On conserve la moitié où le signe change encore.
    if (fa * fm < 0) {
      b = m;
    } else {
      a = m;
      fa = fm;
    }
  }
  return steps;
}
