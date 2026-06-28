import { normalPdf } from './galtonMath';

export interface BallView {
  id: number;
  /** Suite des choix gauche(0)/droite(1), longueur n. */
  path: number[];
  /** Profondeur courante ∈ [0, n] (continue, pour l'animation). */
  d: number;
}

interface GaltonBoardProps {
  n: number;
  bins: number[]; // comptages observés, longueur n+1
  total: number;
  distribution: number[]; // probabilités binomiales, longueur n+1
  mu: number;
  sigma: number;
  balls: BallView[];
  ariaLabel: string;
}

export const GALTON_COLORS = {
  peg: '#cbd5e1', // ardoise clair — clous
  ball: '#e11d48', // rose — billes
  bar: '#4f46e5', // indigo (accent) — histogramme observé
  binomial: '#059669', // émeraude — loi binomiale exacte
  normal: '#d97706', // ambre — approximation normale
};

const W = 640;
const H = 470;
const CENTER = W / 2;
const ENTRY_Y = 12; // hauteur d'apparition des billes (au-dessus du 1ᵉʳ clou)
const PEG_TOP = 44; // ordonnée de la première rangée de clous
const ROW_V = 18; // espacement vertical des rangées de clous
const HALF_S = 20; // demi-espacement horizontal (cap : bins serrés pour grand n)
const BASE_Y = H - 24;

/** Profondeur (négative) de la phase d'entrée : chute centrée jusqu'au 1ᵉʳ clou. */
export const GALTON_ENTRY_DEPTH = 1.5;

/** Décalage horizontal (px) d'une bille à la profondeur continue d. */
function ballOffset(path: number[], d: number): number {
  if (d <= 0) return 0; // phase d'entrée : bille centrée
  const i = Math.min(Math.floor(d), path.length);
  let rights = 0;
  for (let s = 0; s < i; s++) rights += path[s];
  const offI = (2 * rights - i) * HALF_S;
  if (i >= path.length) return offI;
  const delta = path[i] ? HALF_S : -HALF_S; // pas suivant : droite +, gauche −
  return offI + (d - i) * delta;
}

/** Planche de Galton : clous, billes qui tombent, histogramme et lois théoriques. */
export default function GaltonBoard({
  n,
  bins,
  total,
  distribution,
  mu,
  sigma,
  balls,
  ariaLabel,
}: GaltonBoardProps) {
  const binsTop = PEG_TOP + n * ROW_V + 12;
  const histH = BASE_Y - binsTop;
  const maxProb = Math.max(1e-9, ...distribution);
  const yScale = histH / maxProb;

  const binX = (k: number) => CENTER + (2 * k - n) * HALF_S;
  const ballY = (d: number) =>
    d < 0
      ? ENTRY_Y + ((d + GALTON_ENTRY_DEPTH) / GALTON_ENTRY_DEPTH) * (PEG_TOP - ENTRY_Y) // chute d'entrée
      : PEG_TOP + (d / Math.max(1, n)) * (binsTop - PEG_TOP);

  // Clous (arrangement triangulaire).
  const pegs: { x: number; y: number }[] = [];
  for (let r = 0; r < n; r++) {
    for (let j = 0; j <= r; j++) pegs.push({ x: CENTER + (2 * j - r) * HALF_S, y: PEG_TOP + r * ROW_V });
  }

  // Courbe normale (approximation gaussienne) échantillonnée finement.
  const normalPts: string[] = [];
  for (let i = 0; i <= 100; i++) {
    const k = (n * i) / 100;
    const y = BASE_Y - Math.min(histH, normalPdf(k, mu, sigma) * yScale);
    normalPts.push(`${binX(k).toFixed(1)},${y.toFixed(1)}`);
  }

  const barW = HALF_S * 1.5;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={ariaLabel}>
      <title>{ariaLabel}</title>

      {/* Ligne de base de l'histogramme */}
      <line x1={binX(0) - barW / 2} x2={binX(n) + barW / 2} y1={BASE_Y} y2={BASE_Y} stroke="#cbd5e1" />

      {/* Histogramme observé (proportions) */}
      {bins.map((count, k) => {
        const frac = total > 0 ? count / total : 0;
        const h = Math.min(histH, frac * yScale);
        return (
          <rect
            key={k}
            x={binX(k) - barW / 2}
            y={BASE_Y - h}
            width={barW}
            height={h}
            fill={GALTON_COLORS.bar}
            fillOpacity={0.85}
          />
        );
      })}

      {/* Loi binomiale exacte (points + ligne) */}
      <polyline
        points={distribution.map((pk, k) => `${binX(k).toFixed(1)},${(BASE_Y - pk * yScale).toFixed(1)}`).join(' ')}
        fill="none"
        stroke={GALTON_COLORS.binomial}
        strokeWidth={2}
      />
      {distribution.map((pk, k) => (
        <circle key={k} cx={binX(k)} cy={BASE_Y - pk * yScale} r={2.5} fill={GALTON_COLORS.binomial} />
      ))}

      {/* Approximation normale */}
      <polyline points={normalPts.join(' ')} fill="none" stroke={GALTON_COLORS.normal} strokeWidth={1.75} strokeDasharray="5 4" />

      {/* Entonnoir d'entrée (au-dessus du premier clou) */}
      <path
        d={`M${CENTER - 14},${ENTRY_Y - 4} L${CENTER - 3},${PEG_TOP - 8} M${CENTER + 14},${ENTRY_Y - 4} L${CENTER + 3},${PEG_TOP - 8}`}
        stroke={GALTON_COLORS.peg}
        strokeWidth={1.5}
        fill="none"
      />

      {/* Clous */}
      {pegs.map((pg, i) => (
        <circle key={i} cx={pg.x} cy={pg.y} r={2} fill={GALTON_COLORS.peg} />
      ))}

      {/* Billes en chute */}
      {balls.map((b) => (
        <circle key={b.id} cx={CENTER + ballOffset(b.path, b.d)} cy={ballY(b.d)} r={4} fill={GALTON_COLORS.ball} />
      ))}
    </svg>
  );
}
