/** Icône Young : deux fentes à gauche et des franges verticales (alternées) à droite. */
export default function YoungIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* fentes */}
      <circle cx="4" cy="10" r="0.9" fill="currentColor" stroke="none" />
      <circle cx="4" cy="14" r="0.9" fill="currentColor" stroke="none" />
      {/* franges (alternance brillante/sombre via l'opacité) */}
      <line x1="11" y1="4" x2="11" y2="20" />
      <line x1="14" y1="4" x2="14" y2="20" opacity={0.4} />
      <line x1="17" y1="4" x2="17" y2="20" />
      <line x1="20" y1="4" x2="20" y2="20" opacity={0.4} />
    </svg>
  );
}
