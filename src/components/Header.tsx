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
          <span className="inline-block h-6 w-6 rounded-md bg-slate-900" aria-hidden />
          <span className="text-base font-semibold tracking-tight text-slate-900">
            Science Lab
          </span>
        </a>

        <LanguageToggle />
      </div>
    </header>
  );
}
