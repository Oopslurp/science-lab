import { R_MIN, type Vec2 } from './keplerMath';

interface OrbitViewProps {
  bodyPos: Vec2;
  trail: Vec2[];
  r0: number;
  viewHalf: number; // demi-largeur du monde visible (fixe)
  collided: boolean;
  ariaLabel: string;
}

const SIZE = 400;
const MARGIN = 12;

export const ORBIT_COLORS = {
  central: '#0f172a', // corps central (ardoise)
  trail: '#6366f1', // traînée (indigo)
  body: '#4f46e5', // corps en orbite
  collision: '#e11d48',
  reference: '#cbd5e1', // cercle de référence (r₀)
};

export default function OrbitView({
  bodyPos,
  trail,
  r0,
  viewHalf,
  collided,
  ariaLabel,
}: OrbitViewProps) {
  const scale = (SIZE / 2 - MARGIN) / viewHalf;
  const c = SIZE / 2;
  const sx = (x: number) => c + x * scale;
  const sy = (y: number) => c - y * scale; // y vers le haut

  const trailPath = trail
    .map((p, i) => `${i === 0 ? 'M' : 'L'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`)
    .join(' ');

  const centralR = Math.max(R_MIN * scale, 7);
  const bodyColor = collided ? ORBIT_COLORS.collision : ORBIT_COLORS.body;

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="h-auto w-full rounded-lg bg-slate-50"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={ariaLabel}
    >
      <title>{ariaLabel}</title>

      {/* Cercle de référence à r₀ (orbite circulaire) */}
      <circle cx={c} cy={c} r={r0 * scale} fill="none" stroke={ORBIT_COLORS.reference} strokeDasharray="3 4" />

      {/* Traînée */}
      <path d={trailPath} fill="none" stroke={ORBIT_COLORS.trail} strokeWidth={1.5} opacity={0.7} strokeLinejoin="round" />

      {/* Corps central */}
      <circle cx={c} cy={c} r={centralR} fill={ORBIT_COLORS.central} />

      {/* Corps en orbite */}
      <circle cx={sx(bodyPos.x)} cy={sy(bodyPos.y)} r={5} fill={bodyColor} stroke="#fff" strokeWidth={1.5} />
    </svg>
  );
}
