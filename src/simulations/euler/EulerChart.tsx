import { exact, type Point } from './eulerMath';

interface EulerChartProps {
  eulerPts: Point[];
  exactPts: Point[];
  y0: number;
  k: number;
}

// Couleurs partagées avec la légende (cf. EulerSimulation).
export const COLORS = {
  exact: '#059669', // emerald-600
  euler: '#4f46e5', // indigo-600 (accent)
  error: '#e11d48', // rose-600
};

const W = 640;
const H = 400;
const M = { top: 20, right: 20, bottom: 40, left: 56 };
const innerW = W - M.left - M.right;
const innerH = H - M.top - M.bottom;

function ticks(min: number, max: number, count: number): number[] {
  const out: number[] = [];
  for (let i = 0; i <= count; i++) out.push(min + ((max - min) * i) / count);
  return out;
}

function fmt(v: number): string {
  const a = Math.abs(v);
  if (a !== 0 && (a >= 10000 || a < 0.01)) return v.toExponential(1);
  if (a >= 100) return v.toFixed(0);
  if (a >= 10) return v.toFixed(1);
  return v.toFixed(2);
}

/**
 * Tracé SVG personnalisé : la ligne brisée d'Euler par-dessus la courbe exacte,
 * avec un segment vertical à chaque pas matérialisant l'erreur d'approximation.
 */
export default function EulerChart({ eulerPts, exactPts, y0, k }: EulerChartProps) {
  const xMax = eulerPts[eulerPts.length - 1].x || 1;

  const ys = [...eulerPts, ...exactPts].map((p) => p.y);
  const rawMin = Math.min(0, ...ys);
  const rawMax = Math.max(0, ...ys);
  let yMin = rawMin;
  let yMax = rawMax;
  if (yMin === yMax) yMax = yMin + 1;
  const pad = (yMax - yMin) * 0.08;
  yMin -= pad;
  yMax += pad;

  const sx = (x: number) => M.left + (x / xMax) * innerW;
  const sy = (y: number) => M.top + (1 - (y - yMin) / (yMax - yMin)) * innerH;

  const toPath = (pts: Point[]) =>
    pts
      .map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`)
      .join(' ');

  const xTicks = ticks(0, xMax, 5);
  const yTicks = ticks(rawMin, rawMax, 5);
  const zeroY = sy(0);
  const showZero = 0 >= yMin && 0 <= yMax;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
    >
      {/* Grille horizontale + graduations Y */}
      {yTicks.map((ty, i) => (
        <g key={`y${i}`}>
          <line
            x1={M.left}
            x2={W - M.right}
            y1={sy(ty)}
            y2={sy(ty)}
            stroke="#e2e8f0"
            strokeWidth={1}
          />
          <text
            x={M.left - 8}
            y={sy(ty)}
            textAnchor="end"
            dominantBaseline="middle"
            fontSize={11}
            fill="#64748b"
          >
            {fmt(ty)}
          </text>
        </g>
      ))}

      {/* Graduations X */}
      {xTicks.map((tx, i) => (
        <g key={`x${i}`}>
          <text
            x={sx(tx)}
            y={H - M.bottom + 18}
            textAnchor="middle"
            fontSize={11}
            fill="#64748b"
          >
            {fmt(tx)}
          </text>
        </g>
      ))}

      {/* Axe zéro mis en valeur */}
      {showZero ? (
        <line
          x1={M.left}
          x2={W - M.right}
          y1={zeroY}
          y2={zeroY}
          stroke="#94a3b8"
          strokeWidth={1.25}
        />
      ) : null}

      {/* Segments d'erreur (écart vertical Euler ↔ exact à chaque pas) */}
      {eulerPts.map((p, i) =>
        i === 0 ? null : (
          <line
            key={`e${i}`}
            x1={sx(p.x)}
            x2={sx(p.x)}
            y1={sy(p.y)}
            y2={sy(exact(y0, k, p.x))}
            stroke={COLORS.error}
            strokeWidth={1}
            strokeDasharray="3 2"
            opacity={0.7}
          />
        )
      )}

      {/* Courbe exacte */}
      <path d={toPath(exactPts)} fill="none" stroke={COLORS.exact} strokeWidth={2.5} />

      {/* Ligne brisée d'Euler */}
      <path
        d={toPath(eulerPts)}
        fill="none"
        stroke={COLORS.euler}
        strokeWidth={2}
        strokeLinejoin="round"
      />

      {/* Points d'Euler */}
      {eulerPts.map((p, i) => (
        <circle key={`p${i}`} cx={sx(p.x)} cy={sy(p.y)} r={3} fill={COLORS.euler} />
      ))}

      {/* Cadre des axes */}
      <line x1={M.left} x2={M.left} y1={M.top} y2={H - M.bottom} stroke="#cbd5e1" />
      <line
        x1={M.left}
        x2={W - M.right}
        y1={H - M.bottom}
        y2={H - M.bottom}
        stroke="#cbd5e1"
      />

      {/* Étiquettes d'axes */}
      <text x={W - M.right} y={H - M.bottom + 32} textAnchor="end" fontSize={12} fill="#475569">
        x
      </text>
      <text x={M.left - 44} y={M.top + 4} fontSize={12} fill="#475569">
        y
      </text>
    </svg>
  );
}
