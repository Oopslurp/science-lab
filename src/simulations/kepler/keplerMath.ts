// Constante gravitationnelle en UNITÉS NORMALISÉES (GM = 1).
// Ce ne sont PAS des valeurs astronomiques réelles : on choisit GM = 1 pour obtenir
// des nombres lisibles plutôt que des ordres de grandeur énormes ou minuscules.
export const GM = 1;

// Distance de collision avec le corps central (unités normalisées) : en deçà,
// 1/r² devient numériquement instable → on arrête proprement (pas de NaN/Infinity).
export const R_MIN = 0.05;

// Pas d'intégration physique fixe, partagé par la simulation et la mesure de période
// (la tolérance des tests dépend de ce choix : l'erreur résiduelle vient de ce dt).
export const DEFAULT_DT = 0.004;

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

/**
 * Demi-grand axe a depuis les conditions initiales (équation de vis-viva) :
 *   a = GM / (2·GM/r₀ − v₀²).
 * Formule générale : a = r₀ exactement pour une orbite circulaire, a > 0 pour une ellipse.
 * Renvoie +Infinity si v₀ ≥ vitesse de libération (orbite non liée : parabole/hyperbole).
 */
export function semiMajorAxis(r0: number, v0: number, gm = GM): number {
  const denom = (2 * gm) / r0 - v0 * v0;
  if (denom <= 0) return Infinity; // pas d'orbite liée
  return gm / denom;
}

/** Période orbitale depuis le demi-grand axe : T = 2π·√(a³/GM) (3ᵉ loi de Kepler). */
export function orbitalPeriod(a: number, gm = GM): number {
  if (!(a > 0) || !Number.isFinite(a)) return Infinity; // orbite non liée
  return 2 * Math.PI * Math.sqrt(a ** 3 / gm);
}

/**
 * Mesure NUMÉRIQUE de la période : intègre l'orbite (mêmes pas que la simulation)
 * et renvoie le temps simulé pour balayer un tour complet (2π), ou null si aucun tour
 * n'est bouclé (collision ou orbite non liée) avant `maxTime`.
 */
export function measureOrbitalPeriod(
  r0: number,
  v0Pct: number,
  dt = DEFAULT_DT,
  maxTime = 500
): number | null {
  let state = initialState(r0, v0Pct);
  let t = 0;
  let swept = 0;
  let lastAngle = Math.atan2(state.pos.y, state.pos.x);

  while (t < maxTime) {
    state = gravityStep(state.pos, state.vel, dt);
    t += dt;
    if (isCollision(state.pos)) return null;

    const ang = Math.atan2(state.pos.y, state.pos.x);
    let d = ang - lastAngle;
    if (d > Math.PI) d -= 2 * Math.PI;
    else if (d < -Math.PI) d += 2 * Math.PI;
    swept += d;
    lastAngle = ang;

    if (Math.abs(swept) >= 2 * Math.PI) return t;
  }
  return null;
}
