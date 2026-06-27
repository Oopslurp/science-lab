/** Icône : histogramme en cloche resserré (concentration des moyennes). */
export default function LargeNumbersIcon({ className }: { className?: string }) {
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
      <line x1="3" y1="20" x2="21" y2="20" opacity={0.6} />
      <rect x="5" y="15" width="2.4" height="5" fill="currentColor" stroke="none" opacity={0.5} />
      <rect x="8" y="10" width="2.4" height="10" fill="currentColor" stroke="none" opacity={0.75} />
      <rect x="11" y="6" width="2.4" height="14" fill="currentColor" stroke="none" />
      <rect x="14" y="10" width="2.4" height="10" fill="currentColor" stroke="none" opacity={0.75} />
      <rect x="17" y="15" width="2.4" height="5" fill="currentColor" stroke="none" opacity={0.5} />
    </svg>
  );
}
