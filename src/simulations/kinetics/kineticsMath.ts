/**
 * Cinétique chimique d'une réaction d'ordre 1 : v = k·[A], dont la solution est
 *   [A](t) = [A]₀·e^(−k·t)   et   v(t) = k·[A](t) = k·[A]₀·e^(−k·t).
 * Deux notions DISTINCTES mais liées : la concentration [A] et la vitesse v de
 * disparition (le programme les sépare explicitement).
 *
 * Contraste essentiel avec la décroissance radioactive (loi formellement identique) :
 * ici k peut être MODIFIÉ (catalyseur, température), alors que la constante radioactive λ
 * est une propriété immuable du noyau.
 */

/**
 * Gain de vitesse apporté par CHAQUE dose de catalyseur.
 * Valeur ILLUSTRATIVE (mise en scène), PAS une donnée mesurée : un vrai catalyseur peut
 * accélérer de plusieurs ordres de grandeur, et l'effet sature. On choisit ici un gain
 * linéaire simple (chaque dose ajoute +100 % de vitesse) pour rester lisible.
 */
export const CATALYST_GAIN_PER_DOSE = 1;

/** Nombre maximal de doses proposé par le curseur. */
export const MAX_CATALYST_DOSES = 5;

/** Facteur multiplicatif de k pour un nombre de doses : 1 + doses·gain (0 dose ⇒ ×1). */
export function catalystFactor(doses: number): number {
  const d = Math.max(0, Math.floor(doses)); // garde : entier ≥ 0
  return 1 + d * CATALYST_GAIN_PER_DOSE;
}

/** Constante de vitesse effective compte tenu du catalyseur. */
export function effectiveK(k: number, doses: number): number {
  return k * catalystFactor(doses);
}

/** Concentration [A](t) = [A]₀·e^(−k·t). Entrées dégénérées → retour fini (0). */
export function concentration(t: number, a0: number, k: number): number {
  const a = a0 * Math.exp(-k * t);
  return Number.isFinite(a) ? a : 0;
}

/** Vitesse de disparition v(t) = k·[A](t). */
export function rate(t: number, a0: number, k: number): number {
  const v = k * concentration(t, a0, k);
  return Number.isFinite(v) ? v : 0;
}

/**
 * Temps de demi-réaction t½ = ln2 / k.
 * k ≤ 0 → +∞ documenté (réaction infiniment lente : aucune disparition). L'appelant
 * teste Number.isFinite pour afficher un message adapté plutôt qu'« ∞ ».
 */
export function halfTime(k: number): number {
  return k > 0 ? Math.LN2 / k : Infinity;
}

export interface KineticsPoint {
  t: number;
  a: number; // concentration [A](t)
  v: number; // vitesse v(t)
}

/** Échantillonnage couplé de [A](t) et v(t) sur [0, tMax]. */
export function kineticsSeries(
  a0: number,
  k: number,
  tMax: number,
  samples = 160
): KineticsPoint[] {
  const n = Math.max(1, Math.floor(samples)); // garde : pas de division par 0
  const pts: KineticsPoint[] = [];
  for (let i = 0; i <= n; i++) {
    const t = (tMax * i) / n;
    pts.push({ t, a: concentration(t, a0, k), v: rate(t, a0, k) });
  }
  return pts;
}
