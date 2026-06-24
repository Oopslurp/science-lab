import Header from './components/Header';
import Hero from './components/Hero';
import Footer from './components/Footer';
import type { NavItem } from './components/NavBar';
import { useTranslation } from './i18n/useTranslation';

export default function App() {
  const { t } = useTranslation();

  // Éléments de nav PROVISOIRES (Phase 3). En Phase 4 ils seront générés
  // automatiquement depuis le registre de simulations.
  const navItems: NavItem[] = [
    { id: 'euler', label: t('nav.euler') },
    { id: 'decay', label: t('nav.decay') },
    { id: 'titration', label: t('nav.titration') },
  ];

  return (
    <div id="top" className="min-h-screen">
      <Header navItems={navItems} />

      <main>
        <Hero />

        {/* Emplacement des futures simulations (Phases 4 à 6). */}
        <section className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="rounded-xl border border-dashed border-slate-300 bg-white/50 px-6 py-16 text-center">
            <p className="text-sm text-slate-400">{t('home.placeholder')}</p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
