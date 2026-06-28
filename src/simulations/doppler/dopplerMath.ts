/** Célérité du son dans l'air (~15 °C), en m/s. Constante du modèle acoustique. */
export const SOUND_SPEED = 340;

/**
 * Vitesse maximale de la source, en fraction de c. Au-delà (source supersonique
 * vers l'observateur), la formule diverge (c − v → 0) : c'est le régime du mur du
 * son, hors de ce modèle. On borne donc |v| ≤ 0,9·c.
 */
export const DOPPLER_MAX_SPEED_RATIO = 0.9;

/** Borne la vitesse à ±DOPPLER_MAX_SPEED_RATIO·c. Entrée non finie → 0 (jamais d'exception). */
export function clampSpeed(v: number, c: number = SOUND_SPEED): number {
  if (!Number.isFinite(v)) return 0;
  const max = DOPPLER_MAX_SPEED_RATIO * c;
  return Math.max(-max, Math.min(max, v));
}

/**
 * Fréquence perçue : f' = f0·c / (c − vRadial), où `vRadial` est la composante de
 * la vitesse de la source DIRIGÉE vers l'observateur (> 0 si elle s'approche).
 * Source qui s'approche ⇒ f' > f0 ; qui s'éloigne (vRadial < 0) ⇒ f' < f0 ;
 * vitesse radiale nulle (au plus près) ⇒ f' = f0.
 * Sentinelles documentées : NaN si une entrée n'est pas finie ; Infinity si
 * c − vRadial ≤ 0 (source supersonique vers l'observateur, hors modèle).
 */
export function perceivedFrequency(f0: number, vRadial: number, c: number = SOUND_SPEED): number {
  if (!Number.isFinite(f0) || !Number.isFinite(vRadial) || !Number.isFinite(c)) return NaN;
  const denom = c - vRadial;
  if (denom <= 0) return Infinity;
  return (f0 * c) / denom;
}

/**
 * Composante de la vitesse de la source vers l'observateur. La source se déplace
 * horizontalement (vitesse = (speed, 0)) ; on projette sur le vecteur unitaire
 * source → observateur. Renvoie 0 (jamais d'exception) si la distance est nulle
 * ou si une entrée n'est pas finie.
 */
export function radialVelocity(
  speed: number,
  srcX: number,
  srcY: number,
  obsX: number,
  obsY: number
): number {
  if (![speed, srcX, srcY, obsX, obsY].every(Number.isFinite)) return 0;
  const dx = obsX - srcX;
  const dy = obsY - srcY;
  const dist = Math.hypot(dx, dy);
  if (dist === 0) return 0;
  return speed * (dx / dist);
}
