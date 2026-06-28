/** Constante de Faraday : charge d'une mole d'électrons, en C/mol. */
export const FARADAY_CONSTANT = 96485;

export interface Cell {
  id: string;
  /** Couple d'oxydation (pôle −, anode). Formule neutre FR/EN. */
  anode: string;
  /** Couple de réduction (pôle +, cathode). */
  cathode: string;
  /** Nombre d'électrons échangés par la réaction (z = 2 pour ces piles). */
  z: number;
  /** Force électromotrice (tension à vide), en V. */
  emf: number;
}

/** Liste FERMÉE de piles usuelles, toutes à z = 2 électrons échangés. */
export const CELLS: Cell[] = [
  { id: 'daniell', anode: 'Zn', cathode: 'Cu²⁺', z: 2, emf: 1.1 }, // pile Daniell
  { id: 'silver', anode: 'Zn', cathode: 'Ag₂O', z: 2, emf: 1.55 }, // pile bouton
  { id: 'lead', anode: 'Pb', cathode: 'PbO₂', z: 2, emf: 2.0 }, // accumulateur au plomb
];

/**
 * Charge maximale délivrable : Q_max = n₀·z·F (C), où n₀ est la quantité de
 * réactif limitant (mol). Renvoie 0 (jamais d'exception) sur entrée non finie,
 * n₀ < 0 ou z ≤ 0.
 */
export function maxCharge(n0: number, z: number, F: number = FARADAY_CONSTANT): number {
  if (![n0, z, F].every(Number.isFinite) || n0 < 0 || z <= 0) return 0;
  return n0 * z * F;
}

/**
 * Durée de vie à courant constant : t = Q_max / I (s). Sentinelles documentées :
 * Infinity si I ≤ 0 (aucun courant ⇒ pile jamais usée) ; NaN sur entrée non finie.
 */
export function lifetime(qMax: number, current: number): number {
  if (!Number.isFinite(qMax) || !Number.isFinite(current)) return NaN;
  if (current <= 0) return Infinity;
  return qMax / current;
}

/** Raideur de la chute de tension en toute fin de décharge (sans dimension). */
export const DROP_TAU = 0.04;

/**
 * Tension en décharge (modèle illustratif « plateau puis chute ») :
 * U = emf·(1 − e^(−SoC/τ)). Reste ≈ emf sur l'essentiel de la décharge, puis
 * chute brutalement quand l'état de charge SoC → 0. SoC est borné à [0, 1].
 * NaN (jamais d'exception) sur entrée non finie.
 */
export function dischargeVoltage(emf: number, soc: number): number {
  if (!Number.isFinite(emf) || !Number.isFinite(soc)) return NaN;
  const s = Math.max(0, Math.min(1, soc));
  return emf * (1 - Math.exp(-s / DROP_TAU));
}

/** État de charge SoC = 1 − Q/Q_max ∈ [0, 1]. Q_max ≤ 0 ⇒ 0. */
export function stateOfCharge(qDelivered: number, qMax: number): number {
  if (!Number.isFinite(qDelivered) || !Number.isFinite(qMax) || qMax <= 0) return 0;
  return Math.max(0, Math.min(1, 1 - qDelivered / qMax));
}

export interface DischargePoint {
  q: number;
  U: number;
}

/** Nombre d'échantillons par défaut de la courbe de décharge. */
export const DEFAULT_SAMPLES = 160;

/** Échantillonnage de la tension U en fonction de la charge délivrée Q ∈ [0, Q_max]. */
export function dischargeCurve(emf: number, qMax: number, samples = DEFAULT_SAMPLES): DischargePoint[] {
  // Garde : NaN/Infinity → repli (sinon boucle vide ou non bornée), minimum 1.
  const n = Number.isFinite(samples) ? Math.max(1, Math.floor(samples)) : DEFAULT_SAMPLES;
  const pts: DischargePoint[] = [];
  for (let i = 0; i <= n; i++) {
    const q = (qMax * i) / n;
    pts.push({ q, U: dischargeVoltage(emf, stateOfCharge(q, qMax)) });
  }
  return pts;
}
