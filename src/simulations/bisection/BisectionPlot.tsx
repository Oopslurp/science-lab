import { useId } from 'react';
import type { BisectionFunction, BisectionStep } from './bisectionMath';

interface BisectionPlotProps {
  fn: BisectionFunction;
  /** Encadrement extérieur (fenêtre de tracé, fixe pendant les itérations). */
  a: number;
  b: number;
  /** État courant de la dichotomie (encadrement resserré + milieu). */
  step: BisectionStep;
  ariaLabel: string;
}

export const BISECTION_COLORS = {
  curve: '#059669', // émeraude — courbe de f
  bracket: '#4f46e5', // indigo (accent) — encadrement + milieu
  root: '#94a3b8', // ardoise — racine cible (référence)
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

/** Courbe de f sur la fenêtre [a, b], encadrement courant et point milieu de la dichotomie. */
export default function BisectionPlot({ fn, a, b, step, ariaLabel }: BisectionPlotProps) {
  const clipId = useId();

  // Échantillonnage de la courbe sur la fenêtre extérieure.
  const curve: { x: number; y: number }[] = [];
  for (let i = 0; i <= CURVE_SAMPLES; i++) {
    const x = a + ((b - a) * i) / CURVE_SAMPLES;
    curve.push({ x, y: fn.f(x) });
  }

  const ys = curve.map((p) => p.y).filter(Number.isFinite);
  let yMin = Math.min(0, ...ys);
  let yMax = Math.max(0, ...ys);
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
  const mx = sx(step.m);
  const myCurve = Number.isFinite(step.fm) ? sy(step.fm) : zeroY;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-auto w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={ariaLabel}
    >
      <title>{ariaLabel}</title>

      <clipPath id={clipId}>
        <rect x={M.left} y={M.top} width={innerW} height={innerH} />
      </clipPath>

      {/* Grille + graduations Y */}
      {ticks(yMin, yMax, 5).map((ty, i) => (
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

      {/* Encadrement courant [a, b] (bande) */}
      <g clipPath={`url(#${clipId})`}>
        <rect
          x={sx(step.a)}
          y={M.top}
          width={Math.max(0, sx(step.b) - sx(step.a))}
          height={innerH}
          fill={BISECTION_COLORS.bracket}
          fillOpacity={0.1}
        />
        <line x1={sx(step.a)} x2={sx(step.a)} y1={M.top} y2={H - M.bottom} stroke={BISECTION_COLORS.bracket} strokeWidth={1.25} />
        <line x1={sx(step.b)} x2={sx(step.b)} y1={M.top} y2={H - M.bottom} stroke={BISECTION_COLORS.bracket} strokeWidth={1.25} />
      </g>

      {/* Axe zéro */}
      <line x1={M.left} x2={W - M.right} y1={zeroY} y2={zeroY} stroke="#94a3b8" strokeWidth={1.25} />

      {/* Racine cible (référence) */}
      <line
        x1={sx(fn.root)}
        x2={sx(fn.root)}
        y1={M.top}
        y2={H - M.bottom}
        stroke={BISECTION_COLORS.root}
        strokeWidth={1.25}
        strokeDasharray="3 3"
        opacity={0.7}
      />

      {/* Courbe de f */}
      <path d={curvePath} fill="none" stroke={BISECTION_COLORS.curve} strokeWidth={2.5} clipPath={`url(#${clipId})`} />

      {/* Milieu m : segment vertical + points sur la courbe et sur l'axe */}
      <line x1={mx} x2={mx} y1={zeroY} y2={myCurve} stroke={BISECTION_COLORS.bracket} strokeWidth={1.5} strokeDasharray="4 3" />
      <circle cx={mx} cy={myCurve} r={4} fill={BISECTION_COLORS.bracket} />
      <circle cx={mx} cy={zeroY} r={3.5} fill="#fff" stroke={BISECTION_COLORS.bracket} strokeWidth={1.75} />

      {/* Cadre */}
      <line x1={M.left} x2={M.left} y1={M.top} y2={H - M.bottom} stroke="#cbd5e1" />
      <line x1={M.left} x2={W - M.right} y1={H - M.bottom} y2={H - M.bottom} stroke="#cbd5e1" />
    </svg>
  );
}
