import type { Lang } from './types';

/**
 * Dictionnaire de traduction, organisé par section via le préfixe des clés
 * (`hero.*`, `section.*`, `common.*`, `footer.*`).
 *
 * Ce dictionnaire couvre les textes STRUCTURELS communs (chrome de page, libellés
 * de section). Les textes propres à chaque simulation sont co-localisés dans son
 * module et sélectionnés via la langue active — ce qui garde chaque simulation
 * autonome (cf. registre).
 *
 * Structure plate volontaire : `keyof` donne directement le type de toutes les
 * clés valides, ce qui rend `t()` entièrement typé (clé inconnue = erreur TS).
 */
const fr = {
  // Page d'accueil
  'hero.eyebrow': 'Laboratoire virtuel',
  'hero.title': 'Science Lab',
  'hero.subtitle':
    'Simulations interactives pour les mathématiques, la physique et la chimie',
  'hero.intro':
    "Une application pour visualiser les concepts scientifiques plutôt que de seulement les lire : manipulez les paramètres et observez l'effet en temps réel.",

  // Libellés communs aux simulations
  'common.simulation': 'Simulation',
  'section.theory': 'Théorie',
  'section.controls': 'Contrôles',
  'section.visualization': 'Visualisation',
  'section.observe': 'Quoi observer',
  'section.curriculum': 'Lien avec le programme',

  // Pied de page
  'footer.tagline': 'Outil pédagogique — calculs effectués entièrement côté client.',
  'footer.level': 'Niveau lycée avancé / début du supérieur',
} as const;

// La version EN doit couvrir exactement les mêmes clés que `fr`.
const en: Record<keyof typeof fr, string> = {
  'hero.eyebrow': 'Virtual laboratory',
  'hero.title': 'Science Lab',
  'hero.subtitle': 'Interactive simulations for mathematics, physics and chemistry',
  'hero.intro':
    'An app to visualize scientific concepts rather than just read about them: adjust the parameters and watch the effect in real time.',

  'common.simulation': 'Simulation',
  'section.theory': 'Theory',
  'section.controls': 'Controls',
  'section.visualization': 'Visualization',
  'section.observe': 'What to observe',
  'section.curriculum': 'Curriculum link',

  'footer.tagline': 'Educational tool — all computations run entirely in the browser.',
  'footer.level': 'Advanced high-school / early undergraduate level',
};

export type TranslationKey = keyof typeof fr;

export const translations: Record<Lang, Record<TranslationKey, string>> = { fr, en };
