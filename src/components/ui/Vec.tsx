/**
 * Notation vectorielle : dessine une petite flèche AU-DESSUS de la lettre, en CSS.
 * Évite le caractère combinant U+20D7 (non rendu par certaines polices → « tofu »).
 */
export default function Vec({ children }: { children: string }) {
  return (
    <span className="relative inline-block leading-none">
      <span
        aria-hidden
        className="pointer-events-none absolute -top-[0.5em] left-1/2 -translate-x-1/2 text-[0.62em]"
      >
        →
      </span>
      {children}
    </span>
  );
}
