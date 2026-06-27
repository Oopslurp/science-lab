import { useId } from 'react';

export interface Particle {
  x: number; // position normalisée ∈ [0, 1]
  y: number;
}

interface ParticleBoxProps {
  particles: Particle[];
  boxPx: number; // côté de la boîte (px), proportionnel au volume
  ariaLabel: string;
}

const SIZE = 360; // viewBox carré FIXE
const PARTICLE_R = 5;

export const GAS_COLORS = {
  wall: '#0f172a', // parois (ardoise)
  fill: '#eef2ff', // intérieur (indigo très clair)
  particle: '#4f46e5', // particules (indigo)
};

export default function ParticleBox({ particles, boxPx, ariaLabel }: ParticleBoxProps) {
  const clipId = useId();
  const origin = (SIZE - boxPx) / 2; // boîte centrée
  const toPx = (n: number) => origin + n * boxPx;

  return (
    <svg
      viewBox={`0 0 ${SIZE} ${SIZE}`}
      className="h-auto w-full rounded-lg bg-slate-50"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label={ariaLabel}
    >
      <title>{ariaLabel}</title>

      <clipPath id={clipId}>
        <rect x={origin} y={origin} width={boxPx} height={boxPx} rx={4} />
      </clipPath>

      {/* Boîte */}
      <rect x={origin} y={origin} width={boxPx} height={boxPx} rx={4} fill={GAS_COLORS.fill} stroke={GAS_COLORS.wall} strokeWidth={2.5} />

      {/* Particules (clippées à l'intérieur de la boîte) */}
      <g clipPath={`url(#${clipId})`}>
        {particles.map((p, i) => (
          <circle key={i} cx={toPx(p.x)} cy={toPx(p.y)} r={PARTICLE_R} fill={GAS_COLORS.particle} />
        ))}
      </g>
    </svg>
  );
}
