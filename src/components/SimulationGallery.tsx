import { useTranslation } from '../i18n/useTranslation';
import { categories } from '../simulations/categories';
import { simulations } from '../simulations/registry';
import { pick } from '../simulations/types';
import SimulationCard from './SimulationCard';

/** Page d'accueil : cases de simulations regroupées par discipline. */
export default function SimulationGallery() {
  const { t, lang } = useTranslation();

  return (
    <div className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
      <h2 className="mb-8 text-lg font-semibold text-slate-900">{t('gallery.heading')}</h2>

      {categories.map((cat) => {
        const sims = simulations.filter((s) => s.category === cat.id);
        if (sims.length === 0) return null; // catégorie masquée tant qu'elle est vide
        return (
          <section key={cat.id} id={`cat-${cat.id}`} className="mt-10 scroll-mt-24 first:mt-0">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-400">
              {pick(cat.label, lang)}
            </h3>
            {/* 3 colonnes FIXES dès la tablette (md), 2 sur grand mobile, 1 sur mobile —
                pas une grille auto-adaptative : chaque catégorie (6 cartes) s'affiche en 2 rangées de 3. */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {sims.map((s) => (
                <SimulationCard key={s.id} meta={s} lang={lang} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
