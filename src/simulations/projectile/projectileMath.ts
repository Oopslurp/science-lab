/**
 * Mouvement dans un champ uniforme (tir parabolique), lancé depuis le sol y(0) = 0 :
 *   x(t) = v₀·cos θ·t
 *   y(t) = v₀·sin θ·t − ½·g·t²
 * Les mêmes équations décrivent une particule chargée dans un champ électrique uniforme,
 * g étant alors remplacé par a = qE/m. C'est strictement la même variable numérique :
 * l'app ne fait que changer le vocabulaire affiché, jamais le calcul.
 */

/** Masse de référence (kg). Sert UNIQUEMENT à chiffrer les énergies pour l'affichage ;
 *  elle n'influence PAS la forme de la trajectoire (qui ne dépend pas de la masse). */
export const M_REF = 1;

/** Intensités de pesanteur des préréglages (m·s⁻²) — valeurs physiques réelles. */
export const EARTH_G = 9.81;
export const MOON_G = 1.62;
export const MARS_G = 3.71;

/** Borne minimale strictement positive du g « personnalisé » : évite la division par 0
 *  dans t_vol, R et H (g → 0 enverrait ces grandeurs à l'infini). */
export const G_MIN = 0.5;

/** θ est exprimé en DEGRÉS dans toute l'API publique (cohérent avec le curseur). */
function thetaRad(thetaDeg: number): number {
  return (thetaDeg * Math.PI) / 180;
}

export interface Point {
  x: number;
  y: number;
}

/** Temps de vol t_vol = 2·v₀·sin θ / g. g ≤ 0 → 0 (retour fini documenté). */
export function flightTime(v0: number, thetaDeg: number, g: number): number {
  if (!(g > 0)) return 0;
  return (2 * v0 * Math.sin(thetaRad(thetaDeg))) / g;
}

/** Portée R = v₀²·sin(2θ) / g. g ≤ 0 → 0. */
export function range(v0: number, thetaDeg: number, g: number): number {
  if (!(g > 0)) return 0;
  return (v0 * v0 * Math.sin(2 * thetaRad(thetaDeg))) / g;
}

/** Hauteur maximale H = (v₀·sin θ)² / (2g). g ≤ 0 → 0. */
export function maxHeight(v0: number, thetaDeg: number, g: number): number {
  if (!(g > 0)) return 0;
  const vy0 = v0 * Math.sin(thetaRad(thetaDeg));
  return (vy0 * vy0) / (2 * g);
}

/** Position (x, y) à l'instant t. */
export function position(t: number, v0: number, thetaDeg: number, g: number): Point {
  const th = thetaRad(thetaDeg);
  return {
    x: v0 * Math.cos(th) * t,
    y: v0 * Math.sin(th) * t - 0.5 * g * t * t,
  };
}

/** Norme de la vitesse instantanée : vx = v₀cos θ (constante), vy = v₀sin θ − g·t. */
export function speed(t: number, v0: number, thetaDeg: number, g: number): number {
  const th = thetaRad(thetaDeg);
  const vx = v0 * Math.cos(th);
  const vy = v0 * Math.sin(th) - g * t;
  return Math.hypot(vx, vy);
}

/** Énergie cinétique Ec(t) = ½·M_REF·v(t)². */
export function kineticEnergy(t: number, v0: number, thetaDeg: number, g: number): number {
  const v = speed(t, v0, thetaDeg, g);
  return 0.5 * M_REF * v * v;
}

/** Énergie potentielle Ep(t) = M_REF·g·y(t) (pesanteur, ou électrique avec g = a = qE/m). */
export function potentialEnergy(t: number, v0: number, thetaDeg: number, g: number): number {
  return M_REF * g * position(t, v0, thetaDeg, g).y;
}

/** Énergie mécanique Em(t) = Ec + Ep. Théoriquement CONSTANTE (= ½·M_REF·v₀²). */
export function mechanicalEnergy(t: number, v0: number, thetaDeg: number, g: number): number {
  return kineticEnergy(t, v0, thetaDeg, g) + potentialEnergy(t, v0, thetaDeg, g);
}

/** Points (x, y) de la trajectoire, de t = 0 à t_vol. Échantillonnage normalisé. */
export function trajectory(v0: number, thetaDeg: number, g: number, samples = 120): Point[] {
  const n = Math.max(1, Math.floor(samples));
  const tEnd = flightTime(v0, thetaDeg, g);
  if (!(tEnd > 0)) return [position(0, v0, thetaDeg, g)]; // dégénéré : un seul point
  const pts: Point[] = [];
  for (let i = 0; i <= n; i++) {
    pts.push(position((tEnd * i) / n, v0, thetaDeg, g));
  }
  return pts;
}

export interface EnergyPoint {
  t: number;
  ec: number;
  ep: number;
  em: number;
}

/** Séries d'énergies Ec/Ep/Em sur t ∈ [0, t_vol]. Échantillonnage normalisé. */
export function energySeries(v0: number, thetaDeg: number, g: number, samples = 120): EnergyPoint[] {
  const n = Math.max(1, Math.floor(samples));
  const tEnd = flightTime(v0, thetaDeg, g);
  if (!(tEnd > 0)) {
    const ec = kineticEnergy(0, v0, thetaDeg, g);
    return [{ t: 0, ec, ep: 0, em: ec }];
  }
  const pts: EnergyPoint[] = [];
  for (let i = 0; i <= n; i++) {
    const t = (tEnd * i) / n;
    pts.push({
      t,
      ec: kineticEnergy(t, v0, thetaDeg, g),
      ep: potentialEnergy(t, v0, thetaDeg, g),
      em: mechanicalEnergy(t, v0, thetaDeg, g),
    });
  }
  return pts;
}
