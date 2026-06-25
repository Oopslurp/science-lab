import { galleryHref } from '../router/useHashRoute';
import LanguageToggle from './LanguageToggle';

/**
 * Barre supérieure fixe : la marque ramène toujours à la galerie ; toggle FR/EN.
 * (La navigation entre simulations passe par la galerie, pas par des liens ici.)
 */
export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a href={galleryHref} className="flex items-center gap-2">
          <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
            <rect width="32" height="32" rx="7" fill="#0f172a" />
            <path
              d="M12 6h8M13 6v8.5L8.5 23a2 2 0 0 0 1.8 3h11.4a2 2 0 0 0 1.8-3L19 14.5V6"
              fill="none"
              stroke="#6366f1"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-base font-semibold tracking-tight text-slate-900">
            Science Lab
          </span>
        </a>

        <LanguageToggle />
      </div>
    </header>
  );
}
