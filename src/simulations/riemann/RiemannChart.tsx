import type { RiemannFunction, RiemannMethod } from './riemannMath';

interface RiemannChartProps {
  fn: RiemannFunction;
  a: number;
  b: number;
  n: number;
  method: RiemannMethod;
  ariaLabel: string;
}

export const RIEMANN_COLORS = {
  curve: '#059669', // emerald — courbe de f
  rect: '#4f46e5', // indigo (accent) — rectangles/trapèzes
};

const W = 640;
const H = 400;
const M = { top: 20, right: 20, bottom: 36, left: 52 };
const innerW = W - M.left - M.right;
const innerH = H - M.top - M.bottom;
const CURVE_SAMPLES = 200;

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

/** Courbe de f sur [a,b] + rectangles (ou trapèzes) d'approximation de l'aire. */
export default function RiemannChart({ fn, a, b, n, method, ariaLabel }: RiemannChartProps) {
  const h = (b - a) / n;

  // Échantillonnage de la courbe.
  const curve: { x: number; y: number }[] = [];
  for (let i = 0; i <= CURVE_SAMPLES; i++) {
    const x = a + ((b - a) * i) / CURVE_SAMPLES;
    curve.push({ x, y: fn.f(x) });
  }

  // Sommets utilisés par les formes (pour l'échelle Y).
  const shapeYs: number[] = [];
  for (let i = 0; i < n; i++) {
    const x0 = a + i * h;
    if (method === 'trapezoid') {
      shapeYs.push(fn.f(x0), fn.f(x0 + h));
    } else {
      const s = method === 'left' ? x0 : method === 'right' ? x0 + h : x0 + h / 2;
      shapeYs.push(fn.f(s));
    }
  }

  const ys = [...curve.map((p) => p.y), ...shapeYs].filter(Number.isFinite);
  const rawMin = Math.min(0, ...ys);
  const rawMax = Math.max(0, ...ys);
  let yMin = rawMin;
  let yMax = rawMax;
  if (yMin === yMax) yMax = yMin + 1;
  const pad = (yMax - yMin) * 0.08;
  yMin -= pad;
  yMax += pad;

  const sx = (x: number) => M.left + ((x - a) / (b - a)) * innerW;
  const sy = (y: number) => M.top + (1 - (y - yMin) / (yMax - yMin)) * innerH;

  const curvePath = curve
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`)
    .join(' ');

  const zeroY = sy(0);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={ariaLabel}
    >
      <title>{ariaLabel}</title>

      {/* Grille + graduations Y */}
      {ticks(rawMin, rawMax, 5).map((ty, i) => (
        <g key={`y${i}`}>
          <line x1={M.left} x2={W - M.right} y1={sy(ty)} y2={sy(ty)} stroke="#e2e8f0" />
          <text x={M.left - 8} y={sy(ty)} textAnchor="end" dominantBaseline="middle" fontSize={11} fill="#64748b">
            {fmt(ty)}
          </text>
        </g>
      ))}

      {/* Graduations X */}
      {ticks(a, b, 5).map((tx, i) => (
        <text key={`x${i}`} x={sx(tx)} y={H - M.bottom + 18} textAnchor="middle" fontSize={11} fill="#64748b">
          {fmt(tx)}
        </text>
      ))}

      {/* Axe zéro */}
      <line x1={M.left} x2={W - M.right} y1={zeroY} y2={zeroY} stroke="#94a3b8" strokeWidth={1.25} />

      {/* Rectangles / trapèzes */}
      {Array.from({ length: n }, (_, i) => {
        const x0 = a + i * h;
        const x1 = x0 + h;
        if (method === 'trapezoid') {
          const pts = `${sx(x0)},${zeroY} ${sx(x0)},${sy(fn.f(x0))} ${sx(x1)},${sy(fn.f(x1))} ${sx(x1)},${zeroY}`;
          return (
            <polygon
              key={i}
              points={pts}
              fill={RIEMANN_COLORS.rect}
              fillOpacity={0.16}
              stroke={RIEMANN_COLORS.rect}
              strokeWidth={0.75}
            />
          );
        }
        const sample = method === 'left' ? x0 : method === 'right' ? x1 : x0 + h / 2;
        const yh = fn.f(sample);
        const top = Math.min(zeroY, sy(yh));
        const height = Math.abs(zeroY - sy(yh));
        return (
          <rect
            key={i}
            x={sx(x0)}
            y={top}
            width={sx(x1) - sx(x0)}
            height={height}
            fill={RIEMANN_COLORS.rect}
            fillOpacity={0.16}
            stroke={RIEMANN_COLORS.rect}
            strokeWidth={0.75}
          />
        );
      })}

      {/* Courbe de f */}
      <path d={curvePath} fill="none" stroke={RIEMANN_COLORS.curve} strokeWidth={2.5} />

      {/* Cadre */}
      <line x1={M.left} x2={M.left} y1={M.top} y2={H - M.bottom} stroke="#cbd5e1" />
      <line x1={M.left} x2={W - M.right} y1={H - M.bottom} y2={H - M.bottom} stroke="#cbd5e1" />
    </svg>
  );
}
