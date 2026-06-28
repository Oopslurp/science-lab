/** Icône planche de Galton : triangle de clous au-dessus d'un histogramme en cloche. */
export default function GaltonIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {/* Clous (triangle) */}
      <circle cx="12" cy="4" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="10" cy="7" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="14" cy="7" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="8" cy="10" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="12" cy="10" r="0.7" fill="currentColor" stroke="none" />
      <circle cx="16" cy="10" r="0.7" fill="currentColor" stroke="none" />
      {/* Histogramme en cloche */}
      <rect x="5" y="17" width="2.4" height="3" />
      <rect x="8" y="15" width="2.4" height="5" />
      <rect x="11" y="13" width="2.4" height="7" />
      <rect x="14" y="15" width="2.4" height="5" />
      <rect x="17" y="17" width="2.4" height="3" />
    </svg>
  );
}
