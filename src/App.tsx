import Header from './components/Header';
import Hero from './components/Hero';
import Footer from './components/Footer';
import type { NavItem } from './components/NavBar';
import { useTranslation } from './i18n/useTranslation';
import { simulations } from './simulations/registry';
import { pick } from './simulations/types';

export default function App() {
  const { lang } = useTranslation();

  // Nav générée automatiquement depuis le registre de simulations.
  const navItems: NavItem[] = simulations.map((s) => ({
    id: s.id,
    label: pick(s.title, lang),
  }));

  return (
    <div id="top" className="min-h-screen">
      <Header navItems={navItems} />

      <main>
        <Hero />

        {/* Sections générées depuis le registre : ajouter une simulation = une ligne. */}
        {simulations.map((sim, i) => {
          const Component = sim.component;
          return <Component key={sim.id} meta={sim} index={i + 1} />;
        })}
      </main>

      <Footer />
    </div>
  );
}
