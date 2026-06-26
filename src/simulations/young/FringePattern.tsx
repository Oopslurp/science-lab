import type { IntensityPoint, Rgb } from './youngMath';

interface FringePatternProps {
  profile: IntensityPoint[];
  rgb: Rgb; // couleur de base ≈ λ
  ariaLabel: string;
}

const W = 600;
const H = 48;

/**
 * Bande horizontale figurant le motif de franges sur l'écran : à chaque position,
 * la couleur (≈ λ) est modulée par l'intensité I(y) (franges sombres = bande assombrie).
 */
export default function FringePattern({ profile, rgb, ariaLabel }: FringePatternProps) {
  const n = profile.length;
  const sw = W / n;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="h-12 w-full rounded-md"
      preserveAspectRatio="none"
      role="img"
      aria-label={ariaLabel}
    >
      <title>{ariaLabel}</title>
      <rect width={W} height={H} fill="#000" />
      {profile.map((p, k) => (
        <rect
          key={k}
          x={k * sw}
          y={0}
          width={sw + 0.6}
          height={H}
          fill={`rgb(${Math.round(rgb.r * p.i)},${Math.round(rgb.g * p.i)},${Math.round(rgb.b * p.i)})`}
        />
      ))}
    </svg>
  );
}
