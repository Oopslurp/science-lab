export interface NavItem {
  id: string; // ancre de scroll (#id)
  label: string;
}

interface NavBarProps {
  items: NavItem[];
}

/**
 * Liens d'ancrage vers les sections.
 * En Phase 2 les `items` sont provisoires (passés depuis App) ; en Phase 4 ils seront
 * générés automatiquement depuis le registre de simulations.
 */
export default function NavBar({ items }: NavBarProps) {
  return (
    <nav className="hidden md:flex items-center gap-1">
      {items.map((item) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-slate-900"
        >
          {item.label}
        </a>
      ))}
    </nav>
  );
}
