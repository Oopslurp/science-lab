/** Icône : une boîte avec quelques particules (gaz). */
export default function IdealGasIcon({ className }: { className?: string }) {
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
      <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
      <circle cx="8" cy="9" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="15" cy="7.5" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="13" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="17" cy="15" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="7" cy="16" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}
