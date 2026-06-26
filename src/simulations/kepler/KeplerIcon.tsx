/** Icône Kepler : corps central + orbite elliptique avec un corps en orbite. */
export default function KeplerIcon({ className }: { className?: string }) {
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
      <ellipse cx="12" cy="12" rx="9" ry="5.5" opacity={0.7} />
      <circle cx="12" cy="12" r="2" fill="currentColor" stroke="none" />
      <circle cx="21" cy="12" r="1.3" fill="currentColor" stroke="none" />
    </svg>
  );
}
