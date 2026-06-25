/** Icône Riemann : rectangles sous une courbe (aire approchée). */
export default function RiemannIcon({ className }: { className?: string }) {
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
      {/* axes */}
      <path d="M4 3v17h17" opacity={0.45} />
      {/* rectangles */}
      <rect x="6" y="14" width="3" height="6" fill="currentColor" fillOpacity={0.25} />
      <rect x="9" y="11" width="3" height="9" fill="currentColor" fillOpacity={0.25} />
      <rect x="12" y="8" width="3" height="12" fill="currentColor" fillOpacity={0.25} />
      <rect x="15" y="6" width="3" height="14" fill="currentColor" fillOpacity={0.25} />
      {/* courbe */}
      <path d="M5 16C9 15 14 8 20 5" />
    </svg>
  );
}
