export interface TitrationPoint {
  v: number; // volume de titrant (base) ajouté, en mL
  pH: number;
}

export type Region = 'before' | 'at' | 'after';

export interface TitrationParams {
  ca: number; // concentration de l'acide (mol/L)
  cb: number; // concentration de la base (mol/L)
  va: number; // volume initial d'acide (mL)
}

/** Volume équivalent : Ca·Va = Cb·Ve ⇒ Ve = Ca·Va / Cb. */
export function equivalenceVolume({ ca, cb, va }: TitrationParams): number {
  // cb ≤ 0 n'a pas de sens chimique (et est exclu par les sliders) : retour fini.
  return cb > 0 ? (ca * va) / cb : 0;
}

/**
 * En deçà de cette concentration d'excès (mol/L), l'eau domine : on est au point neutre.
 * Garde aussi l'argument du log loin de 0 (approximation d'affichage, pas une résolution
 * complète de l'équilibre de l'eau). Exportée pour être documentée/testable.
 */
export const NEUTRAL_CONC = 1e-7;

function clampPH(ph: number): number {
  return Math.min(14, Math.max(0, ph));
}

/**
 * pH au volume de titrant Vb, via les 3 formules selon la zone
 * (solution aqueuse à 25 °C, Kw = 10⁻¹⁴) :
 *  - avant l'équivalence (excès d'acide) : [H⁺] = (Ca·Va − Cb·Vb)/(Va+Vb), pH = −log[H⁺]
 *  - à l'équivalence (Ca·Va = Cb·Vb)      : pH = 7
 *  - après l'équivalence (excès de base)  : [OH⁻] = (Cb·Vb − Ca·Va)/(Va+Vb), pH = 14 + log[OH⁻]
 */
export function pHAt(p: TitrationParams, vb: number): number {
  const acid = p.ca * p.va; // mmol
  const base = p.cb * vb; // mmol
  const diff = acid - base; // >0 avant, <0 après, 0 à l'équivalence
  const vtot = p.va + vb;
  const conc = vtot > 0 ? Math.abs(diff) / vtot : 0; // mol/L (garde la division)

  let ph: number;
  if (conc < NEUTRAL_CONC) ph = 7; // équivalence + voisinage neutre
  else if (diff > 0) ph = -Math.log10(conc); // excès d'acide
  else ph = 14 + Math.log10(conc); // excès de base

  // Entrées dégénérées (NaN/Infinity) → retour neutre fini plutôt que de polluer le graphe.
  return Number.isFinite(ph) ? clampPH(ph) : 7;
}

export function regionAt(p: TitrationParams, vb: number): Region {
  const diff = p.ca * p.va - p.cb * vb;
  const vtot = p.va + vb;
  const conc = vtot > 0 ? Math.abs(diff) / vtot : 0; // même garde que pHAt
  if (conc < NEUTRAL_CONC) return 'at';
  return diff > 0 ? 'before' : 'after';
}

export function titrationCurve(
  p: TitrationParams,
  vMax: number,
  samples = 240
): TitrationPoint[] {
  const n = Number.isFinite(samples) ? Math.max(1, Math.floor(samples)) : 240; // garde NaN/∞ : pas de boucle non bornée
  const pts: TitrationPoint[] = [];
  for (let i = 0; i <= n; i++) {
    const v = (vMax * i) / n;
    pts.push({ v, pH: pHAt(p, v) });
  }
  return pts;
}

/** Couleur de la solution facon « indicateur universel » selon le pH. */
export function pHColor(pH: number): string {
  if (pH < 1.5) return '#dc2626'; // rouge
  if (pH < 3) return '#ea580c'; // orange foncé
  if (pH < 4.5) return '#f97316'; // orange
  if (pH < 6) return '#eab308'; // jaune
  if (pH < 7.5) return '#22c55e'; // vert (neutre)
  if (pH < 9) return '#14b8a6'; // turquoise
  if (pH < 11) return '#3b82f6'; // bleu
  if (pH < 12.5) return '#6366f1'; // indigo
  return '#7c3aed'; // violet
}
