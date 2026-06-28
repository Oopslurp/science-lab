/** Icône convexité : courbe en S (convexe puis concave) avec tangente et point d'inflexion. */
export default function ConvexityIcon({ className }: { className?: string }) {
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
      {/* Courbe en S : un tronçon convexe puis un tronçon concave */}
      <path d="M4 20 C 9 20 9 12 12 12 C 15 12 15 4 20 4" />
      {/* Tangente qui traverse au point d'inflexion */}
      <line x1="6" y1="16" x2="18" y2="8" opacity={0.5} />
      {/* Point d'inflexion */}
      <circle cx="12" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}
