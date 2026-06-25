import { useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Footer from './components/Footer';
import SimulationGallery from './components/SimulationGallery';
import { useTranslation } from './i18n/useTranslation';
import { galleryHref, useHashRoute } from './router/useHashRoute';
import { simulations } from './simulations/registry';

export default function App() {
  const { t } = useTranslation();
  const route = useHashRoute();

  // Repart en haut de page à chaque changement de vue.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [route]);

  const selected =
    route.name === 'sim' ? simulations.find((s) => s.id === route.id) : undefined;

  return (
    <div id="top" className="min-h-screen">
      <Header />

      <main>
        {selected ? (
          <>
            <div className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
              <a
                href={galleryHref}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 transition-colors hover:text-accent"
              >
                <span aria-hidden>←</span> {t('gallery.back')}
              </a>
            </div>
            <selected.component meta={selected} />
          </>
        ) : (
          <>
            <Hero />
            <SimulationGallery />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
