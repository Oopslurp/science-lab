/** Icône dichotomie : courbe traversant l'axe, encadrement qui se resserre vers la racine. */
export default function BisectionIcon({ className }: { className?: string }) {
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
      {/* Courbe qui traverse l'axe au centre (la racine) */}
      <path d="M4 6 Q 12 14 20 22" opacity={0.45} />
      {/* Axe */}
      <line x1="3" y1="14" x2="21" y2="14" opacity={0.5} />
      {/* Encadrement extérieur */}
      <line x1="6" y1="11" x2="6" y2="17" />
      <line x1="18" y1="11" x2="18" y2="17" />
      {/* Encadrement resserré */}
      <line x1="10" y1="11.5" x2="10" y2="16.5" opacity={0.7} />
      <line x1="14" y1="11.5" x2="14" y2="16.5" opacity={0.7} />
      {/* Milieu / racine */}
      <circle cx="12" cy="14" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}
