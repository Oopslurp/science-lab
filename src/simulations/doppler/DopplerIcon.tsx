/** Icône Doppler : fronts d'onde resserrés à l'avant d'une source mobile. */
export default function DopplerIcon({ className }: { className?: string }) {
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
      {/* Fronts d'onde resserrés devant (droite), espacés derrière (gauche) */}
      <circle cx="10" cy="12" r="9" opacity={0.35} />
      <circle cx="11.5" cy="12" r="6" opacity={0.55} />
      <circle cx="13" cy="12" r="3" opacity={0.8} />
      {/* Source + sens du déplacement */}
      <circle cx="14" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <path d="M17 12 h3 m-1.5 -1.5 L20 12 l-1.5 1.5" />
    </svg>
  );
}
