import { useId } from 'react';

/** Géométrie de la scène (unités viewBox, ratio 1:1) — partagée avec l'animation. */
export const SCENE = {
  W: 640,
  H: 300,
  lineY: 120,
  srcMinX: 40,
  srcMaxX: 600,
  obs: { x: 520, y: 225 },
  maxR: 800,
};

export const DOPPLER_COLORS = {
  wave: '#4f46e5', // indigo (accent) — fronts d'onde
  source: '#e11d48', // rose — source mobile
  // Convention astrophysique : approche = bleu (blueshift, f plus haute),
  // éloignement = rouge (redshift, f plus basse).
  higher: '#2563eb', // approche (son plus aigu) — bleu
  lower: '#dc2626', // éloignement (son plus grave) — rouge
  same: '#475569', // au plus près
};

export type Tone = 'higher' | 'lower' | 'same';

export interface Wave {
  x: number;
  y: number;
  r: number;
}

interface DopplerSceneProps {
  srcX: number;
  waves: Wave[];
  tone: Tone;
  labels: { source: string; observer: string };
  ariaLabel: string;
}

/** Scène de l'effet Doppler : source mobile émettant des fronts d'onde, observateur fixe. */
export default function DopplerScene({ srcX, waves, tone, labels, ariaLabel }: DopplerSceneProps) {
  const clipId = useId();
  const { W, H, lineY, obs, maxR } = SCENE;
  const obsColor = DOPPLER_COLORS[tone];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={ariaLabel}>
      <title>{ariaLabel}</title>

      <clipPath id={clipId}>
        <rect x={0} y={0} width={W} height={H} />
      </clipPath>

      <g clipPath={`url(#${clipId})`}>
        {/* Trajectoire de la source */}
        <line x1={SCENE.srcMinX} x2={SCENE.srcMaxX} y1={lineY} y2={lineY} stroke="#e2e8f0" strokeDasharray="4 4" />

        {/* Fronts d'onde (cercles concentriques qui s'estompent en s'agrandissant) */}
        {waves.map((w, i) => {
          const alpha = Math.max(0, 1 - w.r / maxR) * 0.55;
          if (alpha <= 0) return null;
          return (
            <circle
              key={i}
              cx={w.x}
              cy={w.y}
              r={w.r}
              fill="none"
              stroke={DOPPLER_COLORS.wave}
              strokeWidth={1.5}
              strokeOpacity={alpha}
            />
          );
        })}

        {/* Observateur fixe */}
        <g>
          <circle cx={obs.x} cy={obs.y} r={7} fill={obsColor} />
          <path
            d={`M${obs.x - 11},${obs.y + 20} a 11 11 0 0 1 22 0`}
            fill={obsColor}
            fillOpacity={0.85}
          />
          <text x={obs.x} y={obs.y + 38} textAnchor="middle" fontSize={11} fill="#475569">
            {labels.observer}
          </text>
        </g>

        {/* Source mobile (haut-parleur stylisé + flèche de déplacement) */}
        <g>
          <rect x={srcX - 7} y={lineY - 5} width={6} height={10} rx={1} fill={DOPPLER_COLORS.source} />
          <path d={`M${srcX - 1},${lineY - 5} L${srcX + 6},${lineY - 10} L${srcX + 6},${lineY + 10} L${srcX - 1},${lineY + 5} Z`} fill={DOPPLER_COLORS.source} />
          {/* Flèche : sens du déplacement (vers la droite) */}
          <line x1={srcX + 12} x2={srcX + 26} y1={lineY} y2={lineY} stroke={DOPPLER_COLORS.source} strokeWidth={1.5} />
          <path d={`M${srcX + 26},${lineY} l-5,-3 l0,6 Z`} fill={DOPPLER_COLORS.source} />
          <text x={srcX} y={lineY - 16} textAnchor="middle" fontSize={11} fill="#475569">
            {labels.source}
          </text>
        </g>
      </g>
    </svg>
  );
}
