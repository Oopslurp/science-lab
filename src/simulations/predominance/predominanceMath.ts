export interface AcidBaseCouple {
  id: string;
  /** Forme acide (formule neutre FR/EN). */
  acid: string;
  /** Forme basique conjuguée. */
  base: string;
  /** pKA du couple à 25 °C. */
  pKA: number;
}

/** Liste FERMÉE de couples acide/base usuels (pKA à 25 °C). */
export const COUPLES: AcidBaseCouple[] = [
  { id: 'hydrofluoric', acid: 'HF', base: 'F⁻', pKA: 3.17 },
  { id: 'ethanoic', acid: 'CH₃COOH', base: 'CH₃COO⁻', pKA: 4.75 },
  { id: 'carbonic', acid: 'CO₂,H₂O', base: 'HCO₃⁻', pKA: 6.35 }, // 1ʳᵉ acidité
  { id: 'ammonium', acid: 'NH₄⁺', base: 'NH₃', pKA: 9.25 },
];

export interface Indicator {
  id: string;
  /** Bornes de la zone de virage (l'indicateur change de teinte entre les deux). */
  pHLow: number;
  pHHigh: number;
  /** Couleur de la forme acide / basique de l'indicateur (mise en scène). */
  colorAcid: string;
  colorBase: string;
}

/**
 * Indicateurs colorés courants. Un indicateur est lui-même un couple acide/base
 * (HIn/In⁻) : il vire sur sa zone de virage, d'environ pKi ± 1. `colorAcid`
 * « incolore » de la phénolphtaléine est rendu par un gris très clair.
 */
export const INDICATORS: Indicator[] = [
  { id: 'methylOrange', pHLow: 3.1, pHHigh: 4.4, colorAcid: '#dc2626', colorBase: '#f59e0b' }, // rouge → jaune
  { id: 'bromothymol', pHLow: 6.0, pHHigh: 7.6, colorAcid: '#eab308', colorBase: '#2563eb' }, // jaune → bleu
  { id: 'phenolphthalein', pHLow: 8.2, pHHigh: 10.0, colorAcid: '#f1f5f9', colorBase: '#db2777' }, // incolore → rose
];

/**
 * Fraction de la forme acide : f(HA) = 1 / (1 + 10^(pH − pKA)) ∈ [0, 1].
 * Vaut 1/2 quand pH = pKA. Sentinelle documentée : NaN si une entrée n'est pas
 * finie (l'appelant ne trace jamais ce NaN). Pas d'exception, pas de débordement
 * (10^x ≥ 0 ⇒ 1/(1+10^x) ∈ ]0, 1]).
 */
export function acidFraction(pH: number, pKA: number): number {
  if (!Number.isFinite(pH) || !Number.isFinite(pKA)) return NaN;
  return 1 / (1 + Math.pow(10, pH - pKA));
}

/** Fraction de la forme basique : f(A⁻) = 1 / (1 + 10^(pKA − pH)) = 1 − f(HA). */
export function baseFraction(pH: number, pKA: number): number {
  if (!Number.isFinite(pH) || !Number.isFinite(pKA)) return NaN;
  return 1 / (1 + Math.pow(10, pKA - pH));
}

export type Form = 'acid' | 'base' | 'equal';

/** |pH − pKA| sous lequel les deux formes sont considérées équivalentes (≈ 50/50). */
export const EQUAL_PH_TOLERANCE = 0.05;

/**
 * Forme qui prédomine : 'acid' si pH < pKA, 'base' si pH > pKA, 'equal' au
 * voisinage de pH = pKA. Renvoie 'equal' (jamais d'exception) sur entrée non finie.
 */
export function predominantForm(pH: number, pKA: number, tol = EQUAL_PH_TOLERANCE): Form {
  if (!Number.isFinite(pH) || !Number.isFinite(pKA)) return 'equal';
  const d = pH - pKA;
  if (Math.abs(d) <= tol) return 'equal';
  return d < 0 ? 'acid' : 'base';
}

export interface DistributionPoint {
  pH: number;
  acid: number;
  base: number;
}

/** Nombre d'échantillons par défaut du diagramme de distribution. */
export const DEFAULT_SAMPLES = 140;

/** Échantillonnage des fractions sur pH ∈ [0, 14] (pour le diagramme de distribution). */
export function distributionCurve(pKA: number, samples = DEFAULT_SAMPLES): DistributionPoint[] {
  // Garde : NaN/Infinity → repli (sinon boucle vide ou non bornée), minimum 1.
  const n = Number.isFinite(samples) ? Math.max(1, Math.floor(samples)) : DEFAULT_SAMPLES;
  const pts: DistributionPoint[] = [];
  for (let i = 0; i <= n; i++) {
    const pH = (14 * i) / n;
    pts.push({ pH, acid: acidFraction(pH, pKA), base: baseFraction(pH, pKA) });
  }
  return pts;
}
