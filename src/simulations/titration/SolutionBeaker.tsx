import { pHColor } from './titrationMath';

interface SolutionBeakerProps {
  pH: number;
  /** Niveau de remplissage ∈ [0, 1] (proportionnel au volume total). */
  fill: number;
}

/** Bécher SVG dont la couleur du liquide suit l'indicateur universel. */
export default function SolutionBeaker({ pH, fill }: SolutionBeakerProps) {
  const color = pHColor(pH);
  const topY = 30 + (1 - fill) * 90; // surface du liquide (y croissant vers le bas)
  const bottomY = 130;

  return (
    <svg viewBox="0 0 100 150" className="h-40 w-auto" role="img">
      {/* Liquide (clippé dans le bécher) */}
      <clipPath id="beaker-clip">
        <path d="M25 20 L25 122 a8 8 0 0 0 8 8 h34 a8 8 0 0 0 8 -8 L83 20" />
      </clipPath>
      <rect
        x={25}
        y={topY}
        width={58}
        height={bottomY - topY}
        fill={color}
        clipPath="url(#beaker-clip)"
        className="transition-all duration-300"
      />
      {/* Contour du bécher */}
      <path
        d="M25 20 L25 122 a8 8 0 0 0 8 8 h34 a8 8 0 0 0 8 -8 L83 20"
        fill="none"
        stroke="#94a3b8"
        strokeWidth={2}
        strokeLinecap="round"
      />
      {/* Bec verseur */}
      <path d="M25 20 q-5 -2 -6 -6 M83 20 q5 -2 6 -6" fill="none" stroke="#94a3b8" strokeWidth={2} strokeLinecap="round" />
      {/* pH affiché */}
      <text x={54} y={108} textAnchor="middle" fontSize={15} fontWeight={700} fill="#fff">
        {pH.toFixed(1)}
      </text>
    </svg>
  );
}
