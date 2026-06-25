/** Icône décroissance : courbe exponentielle décroissante au-dessus d'une ligne de base. */
export default function DecayIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* axes */}
      <path d="M4 3v17h16" opacity={0.45} />
      {/* courbe N(t) = N0 e^(-λt) */}
      <path d="M4 5c5 0 5 12 16 13" />
      {/* repères de demi-vie */}
      <circle cx="9" cy="9.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="14.5" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
