/** Icône prédominance : deux courbes de distribution qui se croisent à pH = pKA. */
export default function PredominanceIcon({ className }: { className?: string }) {
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
      {/* Forme acide : majoritaire à gauche, minoritaire à droite */}
      <path d="M3 6 C 9 6 9 18 21 18" />
      {/* Forme basique : l'inverse */}
      <path d="M3 18 C 9 18 9 6 21 6" opacity={0.5} />
      {/* Frontière pH = pKA (croisement) */}
      <line x1="12" y1="3" x2="12" y2="21" strokeDasharray="2 2" opacity={0.6} />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </svg>
  );
}
