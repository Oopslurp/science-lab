import type { Point } from './projectileMath';

interface TrajectoryPlotProps {
  points: Point[]; // trajectoire complète (t = 0 → t_vol)
  progress: number; // fraction tracée ∈ [0, 1]
  range: number; // portée R (échelle x)
  maxHeight: number; // hauteur max H (échelle y)
  axisLabels: { x: string; y: string };
  ariaLabel: string;
}

const W = 440;
const H = 260;
const M = { left: 38, right: 16, top: 16, bottom: 30 };

export const TRAJ_COLORS = {
  path: '#4f46e5', // trajectoire (indigo accent)
  future: '#cbd5e1', // partie non encore parcourue
  apex: '#0891b2', // sommet (hauteur max)
  landing: '#e11d48', // point d'atterrissage
  body: '#4f46e5', // projectile
  ground: '#94a3b8',
};

export default function TrajectoryPlot({
  points,
  progress,
  range,
  maxHeight,
  axisLabels,
  ariaLabel,
}: TrajectoryPlotProps) {
  // Échelle unique (aspect réel préservé) : la parabole garde sa vraie forme,
  // ce qui rend l'optimum à 45° lisible visuellement.
  const spanX = Math.max(range, 1e-6);
  const spanY = Math.max(maxHeight, 1e-6);
  const scale = Math.min(
    (W - M.left - M.right) / spanX,
    (H - M.top - M.bottom) / spanY
  );
  const originX = M.left;
  const groundY = H - M.bottom;
  const px = (x: number) => originX + x * scale;
  const py = (y: number) => groundY - y * scale;

  const toPath = (pts: Point[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${px(p.x).toFixed(1)},${py(p.y).toFixed(1)}`).join(' ');

  const k = Math.max(1, Math.round(progress * (points.length - 1)));
  const drawn = points.slice(0, k + 1);
  const current = drawn[drawn.length - 1] ?? points[0];

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full rounded-lg bg-slate-50"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={ariaLabel}
    >
      <title>{ariaLabel}</title>

      {/* Sol */}
      <line x1={originX} y1={groundY} x2={W - M.right} y2={groundY} stroke={TRAJ_COLORS.ground} strokeWidth={1.5} />
      {/* Axe vertical */}
      <line x1={originX} y1={M.top} x2={originX} y2={groundY} stroke={TRAJ_COLORS.ground} strokeWidth={1} opacity={0.5} />

      {/* Trajectoire complète estompée puis partie parcourue */}
      <path d={toPath(points)} fill="none" stroke={TRAJ_COLORS.future} strokeWidth={2} strokeDasharray="3 4" />
      <path d={toPath(drawn)} fill="none" stroke={TRAJ_COLORS.path} strokeWidth={2.5} strokeLinejoin="round" />

      {/* Repères : sommet (hauteur max) et atterrissage */}
      <circle cx={px(range / 2)} cy={py(maxHeight)} r={4} fill={TRAJ_COLORS.apex} stroke="#fff" strokeWidth={1.2} />
      <circle cx={px(range)} cy={groundY} r={4} fill={TRAJ_COLORS.landing} stroke="#fff" strokeWidth={1.2} />

      {/* Projectile à l'instant courant */}
      <circle cx={px(current.x)} cy={py(current.y)} r={5.5} fill={TRAJ_COLORS.body} stroke="#fff" strokeWidth={1.5} />

      {/* Légendes d'axes */}
      <text x={W - M.right} y={groundY + 20} textAnchor="end" fontSize={11} fill="#64748b">
        {axisLabels.x}
      </text>
      <text x={originX - 4} y={M.top + 2} textAnchor="end" fontSize={11} fill="#64748b">
        {axisLabels.y}
      </text>
    </svg>
  );
}
