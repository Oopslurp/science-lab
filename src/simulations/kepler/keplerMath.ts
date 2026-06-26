// Constante gravitationnelle en UNITÉS NORMALISÉES (GM = 1).
// Ce ne sont PAS des valeurs astronomiques réelles : on choisit GM = 1 pour obtenir
// des nombres lisibles plutôt que des ordres de grandeur énormes ou minuscules.
export const GM = 1;

// Distance de collision avec le corps central (unités normalisées) : en deçà,
// 1/r² devient numériquement instable → on arrête proprement (pas de NaN/Infinity).
export const R_MIN = 0.05;

export interface Vec2 {
  x: number;
  y: number;
}

export interface OrbitState {
  pos: Vec2;
  vel: Vec2;
}

export function distance(pos: Vec2): number {
  return Math.hypot(pos.x, pos.y);
}

export function isCollision(pos: Vec2): boolean {
  return distance(pos) < R_MIN;
}

/** Vitesse circulaire à la distance r : v_circ = √(GM/r). */
export function circularSpeed(r: number, gm = GM): number {
  return r > 0 ? Math.sqrt(gm / r) : 0;
}

/** Vitesse de libération à la distance r : v_lib = √(2GM/r) = √2·v_circ. */
export function escapeSpeed(r: number, gm = GM): number {
  return Math.SQRT2 * circularSpeed(r, gm);
}

/** Accélération gravitationnelle a = −GM·r / |r|³ (r : vecteur position). */
export function acceleration(pos: Vec2, gm = GM): Vec2 {
  const r2 = pos.x * pos.x + pos.y * pos.y;
  const r = Math.sqrt(r2);
  if (!(r > 0)) return { x: 0, y: 0 }; // garde (la collision stoppe avant)
  const k = -gm / (r2 * r); // −GM / r³
  return { x: k * pos.x, y: k * pos.y };
}

/**
 * UN pas d'Euler SEMI-IMPLICITE (symplectique) :
 *   1) a = −GM·r / r³
 *   2) v_{n+1} = v_n + a·dt        (vitesse mise à jour D'ABORD)
 *   3) r_{n+1} = r_n + v_{n+1}·dt  (position avec la vitesse DÉJÀ mise à jour)
 * C'est cette variante (et non l'Euler explicite) qui conserve bien l'énergie
 * et évite que l'orbite parte en spirale.
 */
export function gravityStep(pos: Vec2, vel: Vec2, dt: number, gm = GM): OrbitState {
  const a = acceleration(pos, gm);
  const nextVel: Vec2 = { x: vel.x + a.x * dt, y: vel.y + a.y * dt };
  const nextPos: Vec2 = { x: pos.x + nextVel.x * dt, y: pos.y + nextVel.y * dt };
  return { pos: nextPos, vel: nextVel };
}

/** Période orbitale THÉORIQUE (cas circulaire uniquement) : T = 2π·√(r₀³/GM). */
export function theoreticalPeriod(r0: number, gm = GM): number {
  return 2 * Math.PI * Math.sqrt(r0 ** 3 / gm);
}

/**
 * État initial : distance r₀ sur l'axe +x, vitesse PERPENDICULAIRE au rayon (vers +y),
 * de norme v0Pct % de la vitesse circulaire à r₀ (orbite « simple », sans angle libre).
 */
export function initialState(r0: number, v0Pct: number): OrbitState {
  const speed = (v0Pct / 100) * circularSpeed(r0);
  return { pos: { x: r0, y: 0 }, vel: { x: 0, y: speed } };
}
