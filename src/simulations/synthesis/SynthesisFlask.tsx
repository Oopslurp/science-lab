import { useEffect, useId, useState } from 'react';

interface SynthesisFlaskProps {
  /** Couleur du liquide = couleur de la dernière réaction. `null` ⇒ ballon vide. */
  color: string | null;
  /** Incrémenté à CHAQUE clic sur une carte : remonte les bulles (animation one-shot). */
  pulseKey: number;
  title: string;
}

/** Quelques bulles qui montent et s'estompent une fois, au montage (transitions CSS pures). */
function Bubbles({ color }: { color: string }) {
  const [run, setRun] = useState(false);
  useEffect(() => {
    const r = requestAnimationFrame(() => setRun(true));
    return () => cancelAnimationFrame(r);
  }, []);
  const bubbles = [
    { cx: 21, delay: 0 },
    { cx: 25, delay: 110 },
    { cx: 28, delay: 210 },
    { cx: 23, delay: 300 },
  ];
  return (
    <g>
      {bubbles.map((b, i) => (
        <circle
          key={i}
          cx={b.cx}
          cy={49}
          r={1.6}
          fill={color}
          style={{
            transform: run ? 'translateY(-12px)' : 'translateY(0px)',
            opacity: run ? 0 : 0.65,
            transition: `transform 650ms ease-out ${b.delay}ms, opacity 650ms ease-out ${b.delay}ms`,
          }}
        />
      ))}
    </g>
  );
}

/**
 * Ballon de synthèse (fond rond) en SVG ligne, même style épuré que les icônes de l'app.
 * Décoration : silhouette de verrerie, pas un schéma chimique. Le liquide prend la couleur
 * (catégorielle) du type de la dernière réaction ; des bulles montent brièvement à chaque clic.
 */
export default function SynthesisFlask({ color, pulseKey, title }: SynthesisFlaskProps) {
  const clipId = useId();
  return (
    <svg
      viewBox="0 0 48 58"
      className="h-20 w-auto shrink-0"
      role="img"
      aria-label={title}
    >
      <title>{title}</title>

      <clipPath id={clipId}>
        <circle cx="24" cy="38" r="15" />
      </clipPath>

      {/* Liquide (teinte sobre) + bulles, clippés à la sphère */}
      {color ? (
        <g clipPath={`url(#${clipId})`}>
          <rect x="8" y="34" width="32" height="21" fill={color} opacity={0.22} />
          <line x1="9" y1="34" x2="39" y2="34" stroke={color} strokeWidth="1.2" opacity={0.5} />
          {pulseKey > 0 ? <Bubbles key={pulseKey} color={color} /> : null}
        </g>
      ) : null}

      {/* Silhouette du ballon : col + sphère (col ouvert en haut) */}
      <path
        d="M20 7 L20 23.5 A 15 15 0 1 0 28 23.5 L28 7"
        fill="none"
        stroke="#334155"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Lèvre du col */}
      <line x1="19" y1="7" x2="29" y2="7" stroke="#334155" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
