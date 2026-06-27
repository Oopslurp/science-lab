/** Icône : un parcours en 3 nœuds (une séquence réactionnelle, le cœur de la simulation). */
export default function SynthesisIcon({ className }: { className?: string }) {
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
      <path d="M5 16.5 L12 7.5 L19 16.5" opacity={0.7} />
      <circle cx="5" cy="16.5" r="2.3" fill="currentColor" stroke="none" />
      <circle cx="12" cy="7.5" r="2.3" fill="currentColor" stroke="none" />
      <circle cx="19" cy="16.5" r="2.3" fill="currentColor" stroke="none" />
    </svg>
  );
}
