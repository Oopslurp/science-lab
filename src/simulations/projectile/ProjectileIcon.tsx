/** Icône : arc parabolique partant du sol, avec le projectile à son sommet. */
export default function ProjectileIcon({ className }: { className?: string }) {
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
      <path d="M3 20 Q12 1 21 20" opacity={0.8} strokeDasharray="2.4 2.4" />
      <line x1="3" y1="20" x2="21" y2="20" />
      <circle cx="12" cy="5.5" r="1.8" fill="currentColor" stroke="none" />
    </svg>
  );
}
