/** Icône pile : corps de pile avec cosse et éclair (décharge). */
export default function BatteryIcon({ className }: { className?: string }) {
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
      {/* Corps de la pile */}
      <rect x="3" y="8" width="16" height="9" rx="1.5" />
      {/* Cosse + */}
      <line x1="21" y1="11" x2="21" y2="14" />
      {/* Éclair (courant débité) */}
      <path d="M12 9.5 L9.5 12.8 h2.2 L11 15.5 L14 11.8 h-2.2 Z" fill="currentColor" stroke="none" />
    </svg>
  );
}
