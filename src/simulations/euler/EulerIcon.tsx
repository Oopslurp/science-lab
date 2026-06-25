/** Icône Euler : ligne brisée qui approche une courbe lisse (style trait sobre). */
export default function EulerIcon({ className }: { className?: string }) {
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
      {/* Courbe exacte (estompée) */}
      <path d="M3 19c5 0 7-5 18-15" opacity={0.45} />
      {/* Ligne brisée d'Euler */}
      <polyline points="3,19 9,15 14,11 21,4" />
      {/* Points des pas */}
      <circle cx="3" cy="19" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="9" cy="15" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="14" cy="11" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="21" cy="4" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
