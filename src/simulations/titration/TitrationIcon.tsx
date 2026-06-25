/** Icône titrage : fiole conique (erlenmeyer) avec une goutte de titrant. */
export default function TitrationIcon({ className }: { className?: string }) {
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
      {/* goutte de titrant */}
      <circle cx="12" cy="2.5" r="0.9" fill="currentColor" stroke="none" />
      {/* fiole */}
      <path d="M9.5 5h5M10.5 5v4l-4 9a1.8 1.8 0 0 0 1.7 2.6h7.6A1.8 1.8 0 0 0 17.5 18l-4-9V5" />
      {/* surface du liquide */}
      <path d="M8.2 15h7.6" />
    </svg>
  );
}
