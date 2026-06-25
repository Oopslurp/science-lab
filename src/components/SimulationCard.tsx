import type { Lang } from '../i18n/types';
import { simHref } from '../router/useHashRoute';
import { pick, type SimulationMeta } from '../simulations/types';

interface SimulationCardProps {
  meta: SimulationMeta;
  lang: Lang;
}

/** Case de la galerie : tuile icône (style logo) + nom + courte description. */
export default function SimulationCard({ meta, lang }: SimulationCardProps) {
  const Icon = meta.icon;
  return (
    <a
      href={simHref(meta.id)}
      className="group flex gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md"
    >
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-accent-soft">
        <Icon className="h-6 w-6" />
      </span>
      <span className="min-w-0">
        <span className="block font-semibold text-slate-900 transition-colors group-hover:text-accent">
          {pick(meta.title, lang)}
        </span>
        <span className="mt-1 block text-sm leading-snug text-slate-500">
          {pick(meta.description, lang)}
        </span>
      </span>
    </a>
  );
}
