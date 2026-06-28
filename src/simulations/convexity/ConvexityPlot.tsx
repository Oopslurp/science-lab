import { useId } from 'react';
import { osculatingCircle, tangentValue, type ConvexityFunction } from './convexityMath';

interface ConvexityPlotProps {
  fn: ConvexityFunction;
  x0: number;
  ariaLabel: string;
}

export const CONVEXITY_COLORS = {
  convex: '#4f46e5', // indigo (accent) — f″ > 0
  concave: '#d97706', // ambre — f″ < 0
  tangent: '#475569', // ardoise — tangente
  point: '#0f172a', // point x₀
  osculating: '#7c3aed', // violet — cercle osculateur
};

// Marges autour de la courbe (fraction du domaine / de l'amplitude) : aèrent le
// repère pour que le cercle osculateur ne paraisse pas démesuré ni collé aux bords.
const X_MARGIN = 0.25;
const Y_MARGIN = 0.15;

// Fondu du cercle osculateur, en multiples de la largeur du domaine (b − a) :
// opacité 1 tant que R ≤ FADE_START·(b−a), puis descend à 0 vers R = FADE_END·(b−a).
// Évite d'afficher un cercle démesuré qui déborde du cadre près d'une inflexion.
const CURVATURE_FADE_START = 0.7;
const CURVATURE_FADE_END = 1.4;

const W = 640;
const H = 400;
const M = { top: 20, right: 20, bottom: 36, left: 52 };
const innerW = W - M.left - M.right;
const innerH = H - M.top - M.bottom;
const CURVE_SAMPLES = 240;

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
 * Courbe de f colorée selon le signe de f″ (convexe / concave), sa tangente au
 * point x₀ et ses points d'inflexion. La courbe est découpée en tronçons de
 * convexité constante (un changement de couleur ⇔ un point d'inflexion).
 */
export default function ConvexityPlot({ fn, x0, ariaLabel }: ConvexityPlotProps) {
  const clipId = useId();
  const { domainA: a, domainB: b } = fn;

  const curve: { x: number; y: number }[] = [];
  for (let i = 0; i <= CURVE_SAMPLES; i++) {
    const x = a + ((b - a) * i) / CURVE_SAMPLES;
    curve.push({ x, y: fn.f(x) });
  }

  const ys = curve.map((p) => p.y).filter(Number.isFinite);
  let yMinRaw = Math.min(0, ...ys);
  let yMaxRaw = Math.max(0, ...ys);
  if (yMinRaw === yMaxRaw) yMaxRaw = yMinRaw + 1;

  // Fenêtre de tracé = domaine de la courbe élargi par des marges (repère aéré).
  const xPad = X_MARGIN * (b - a);
  const yPad = Y_MARGIN * (yMaxRaw - yMinRaw);
  const xLo = a - xPad;
  const xHi = b + xPad;
  const yLo = yMinRaw - yPad;
  const yHi = yMaxRaw + yPad;

  const sx = (x: number) => M.left + ((x - xLo) / (xHi - xLo)) * innerW;
  const sy = (y: number) => M.top + (1 - (y - yLo) / (yHi - yLo)) * innerH;

  // Découpage en tronçons de convexité constante (couleur selon le signe de f″).
  // Chaque nouveau tronçon reprend le dernier point du précédent (pas de trou).
  const runs: { convex: boolean; pts: { x: number; y: number }[] }[] = [];
  for (let i = 0; i < curve.length; i++) {
    const convex = fn.d2(curve[i].x) >= 0;
    const last = runs[runs.length - 1];
    if (!last || last.convex !== convex) {
      const start = i > 0 ? [curve[i - 1]] : [];
      runs.push({ convex, pts: [...start, curve[i]] });
    } else {
      last.pts.push(curve[i]);
    }
  }

  const toPath = (pts: { x: number; y: number }[]) =>
    pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ');

  const zeroY = sy(0);
  const tanY = (x: number) => tangentValue(fn, x0, x);

  // Cercle osculateur : dessiné comme une ELLIPSE = image affine du cercle par
  // les échelles (différentes) des axes. Le contact d'ordre 2 étant préservé par
  // une transformation affine, l'ellipse épouse réellement la courbe rendue.
  const kx = innerW / (xHi - xLo); // px par unité en x
  const ky = innerH / (yHi - yLo); // px par unité en y
  const circle = osculatingCircle(fn, x0);
  let osc: { cx: number; cy: number; rx: number; ry: number; opacity: number } | null = null;
  if (circle) {
    const t = (circle.r - CURVATURE_FADE_START * (b - a)) / ((CURVATURE_FADE_END - CURVATURE_FADE_START) * (b - a));
    const opacity = Math.max(0, Math.min(1, 1 - t));
    if (opacity > 0) {
      osc = { cx: sx(circle.cx), cy: sy(circle.cy), rx: circle.r * kx, ry: circle.r * ky, opacity };
    }
  }

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
      {ticks(yLo, yHi, 5).map((ty, i) => (
        <g key={`y${i}`}>
          <line x1={M.left} x2={W - M.right} y1={sy(ty)} y2={sy(ty)} stroke="#e2e8f0" />
          <text x={M.left - 8} y={sy(ty)} textAnchor="end" dominantBaseline="middle" fontSize={11} fill="#64748b">
            {fmt(ty)}
          </text>
        </g>
      ))}

      {/* Graduations X */}
      {ticks(xLo, xHi, 5).map((tx, i) => (
        <text key={`x${i}`} x={sx(tx)} y={H - M.bottom + 18} textAnchor="middle" fontSize={11} fill="#64748b">
          {fmt(tx)}
        </text>
      ))}

      {/* Axe zéro */}
      <line x1={M.left} x2={W - M.right} y1={zeroY} y2={zeroY} stroke="#94a3b8" strokeWidth={1.25} />

      {/* Tangente en x₀ */}
      <line
        x1={sx(xLo)}
        y1={sy(tanY(xLo))}
        x2={sx(xHi)}
        y2={sy(tanY(xHi))}
        stroke={CONVEXITY_COLORS.tangent}
        strokeWidth={1.75}
        strokeDasharray="5 4"
        clipPath={`url(#${clipId})`}
      />

      {/* Cercle osculateur (ellipse = image affine du cercle), centre et rayon */}
      {osc ? (
        <g clipPath={`url(#${clipId})`} opacity={osc.opacity}>
          <ellipse
            cx={osc.cx}
            cy={osc.cy}
            rx={osc.rx}
            ry={osc.ry}
            fill={CONVEXITY_COLORS.osculating}
            fillOpacity={0.07}
            stroke={CONVEXITY_COLORS.osculating}
            strokeWidth={1.75}
          />
          <line
            x1={sx(x0)}
            y1={sy(fn.f(x0))}
            x2={osc.cx}
            y2={osc.cy}
            stroke={CONVEXITY_COLORS.osculating}
            strokeWidth={1.25}
            strokeDasharray="3 3"
          />
          <circle cx={osc.cx} cy={osc.cy} r={3} fill={CONVEXITY_COLORS.osculating} />
        </g>
      ) : null}

      {/* Courbe colorée par convexité */}
      {runs.map((run, i) => (
        <path
          key={i}
          d={toPath(run.pts)}
          fill="none"
          stroke={run.convex ? CONVEXITY_COLORS.convex : CONVEXITY_COLORS.concave}
          strokeWidth={2.75}
          clipPath={`url(#${clipId})`}
        />
      ))}

      {/* Points d'inflexion */}
      {fn.inflections.map((r, i) => (
        <circle key={i} cx={sx(r)} cy={sy(fn.f(r))} r={4.5} fill="#fff" stroke="#0f172a" strokeWidth={1.75} />
      ))}

      {/* Point x₀ sur la courbe */}
      <circle cx={sx(x0)} cy={sy(fn.f(x0))} r={4.5} fill={CONVEXITY_COLORS.point} />

      {/* Cadre */}
      <line x1={M.left} x2={M.left} y1={M.top} y2={H - M.bottom} stroke="#cbd5e1" />
      <line x1={M.left} x2={W - M.right} y1={H - M.bottom} y2={H - M.bottom} stroke="#cbd5e1" />
    </svg>
  );
}
