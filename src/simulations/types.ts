import type { ComponentType, LazyExoticComponent } from 'react';
import type { Lang } from '../i18n/types';
import type { CategoryId } from './categories';

/** Texte court disponible dans les deux langues (titre, description). */
export interface LocalizedText {
  fr: string;
  en: string;
}

export function pick(text: LocalizedText, lang: Lang): string {
  return text[lang];
}

/** Icône de simulation : petit SVG ligne, taille pilotée par `className`. */
export type SimulationIcon = ComponentType<{ className?: string }>;

/** Composant de simulation, éventuellement chargé en différé (React.lazy). */
export type SimulationComponent =
  | ComponentType<SimulationComponentProps>
  | LazyExoticComponent<ComponentType<SimulationComponentProps>>;

/** Props reçues par CHAQUE composant de simulation, fournies par le registre. */
export interface SimulationComponentProps {
  meta: SimulationMeta;
}

/**
 * Métadonnées d'une simulation.
 * Source unique de vérité : la galerie, les catégories et la nav en découlent.
 * Ajouter une simulation = créer son composant + son icône, puis ajouter une entrée ici.
 */
export interface SimulationMeta {
  id: string; // route (#/sim/<id>) + clé unique
  category: CategoryId;
  title: LocalizedText;
  description: LocalizedText; // courte, affichée sur la case et en sous-titre
  icon: SimulationIcon;
  component: SimulationComponent;
}
