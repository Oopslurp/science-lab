import LanguageToggle from './LanguageToggle';
import NavBar, { type NavItem } from './NavBar';

interface HeaderProps {
  navItems: NavItem[];
}

/**
 * Barre supérieure fixe : marque + navigation + bascule de langue.
 * Toujours visible pour garder l'accès au toggle et aux sections en permanence.
 */
export default function Header({ navItems }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <a href="#top" className="flex items-center gap-2">
          <span className="inline-block h-6 w-6 rounded-md bg-slate-900" aria-hidden />
          <span className="text-base font-semibold tracking-tight text-slate-900">
            Science Lab
          </span>
        </a>

        <div className="flex items-center gap-3">
          <NavBar items={navItems} />
          <LanguageToggle />
        </div>
      </div>
    </header>
  );
}
