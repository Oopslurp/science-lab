import type { ComponentType } from 'react';
import type { Lang } from '../i18n/types';

/** Texte court disponible dans les deux langues (titre, description). */
export interface LocalizedText {
  fr: string;
  en: string;
}

export function pick(text: LocalizedText, lang: Lang): string {
  return text[lang];
}

/** Props reçues par CHAQUE composant de simulation, fournies par le registre. */
export interface SimulationComponentProps {
  meta: SimulationMeta;
  index: number; // rang d'affichage (1, 2, 3…)
}

/**
 * Métadonnées d'une simulation.
 * Source unique de vérité : la nav et la page d'accueil sont générées depuis ce type.
 * Ajouter une simulation = créer son composant + ajouter une entrée au registre.
 */
export interface SimulationMeta {
  id: string; // ancre de scroll + clé unique
  title: LocalizedText;
  description: LocalizedText; // courte, affichée en sous-titre de section
  component: ComponentType<SimulationComponentProps>;
}
