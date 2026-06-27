/** Icône : deux décroissances exponentielles (avec / sans catalyseur) partant du même point. */
export default function KineticsIcon({ className }: { className?: string }) {
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
      <line x1="3" y1="4" x2="3" y2="20" opacity={0.5} />
      <line x1="3" y1="20" x2="21" y2="20" opacity={0.5} />
      {/* sans catalyseur (lent) */}
      <path d="M3 5 Q11 13 21 18" opacity={0.45} strokeDasharray="2.2 2.2" />
      {/* avec catalyseur (rapide) */}
      <path d="M3 5 Q7 16 21 19" />
    </svg>
  );
}
