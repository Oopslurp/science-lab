/** Icône équilibre : courbe Qr croisant la constante K (ligne pointillée) en un point. */
export default function EquilibriumIcon({ className }: { className?: string }) {
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
      {/* constante K */}
      <path d="M5 12h15" strokeDasharray="2 2" opacity={0.7} />
      {/* courbe Qr croissante */}
      <path d="M5 19c6 0 8-12 14-15" />
      {/* point d'équilibre */}
      <circle cx="11.5" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}
