import type { Lang } from './types';

/**
 * Dictionnaire de traduction, organisé par section via le préfixe des clés
 * (`nav.*`, `hero.*`, `home.*`, `footer.*`).
 *
 * Structure plate volontaire : `keyof` donne directement le type de toutes les
 * clés valides, ce qui rend `t()` entièrement typé (clé inconnue = erreur TS).
 * Les deux langues partagent exactement le même jeu de clés.
 */
const fr = {
  // Navigation (provisoire en Phase 3 ; générée depuis le registre en Phase 4)
  'nav.euler': "Méthode d'Euler",
  'nav.decay': 'Décroissance radioactive',
  'nav.titration': 'Titrage',

  // Page d'accueil
  'hero.eyebrow': 'Laboratoire virtuel',
  'hero.title': 'Science Lab',
  'hero.subtitle':
    'Simulations interactives pour les mathématiques, la physique et la chimie',
  'hero.intro':
    "Une application pour visualiser les concepts scientifiques plutôt que de seulement les lire : manipulez les paramètres et observez l'effet en temps réel.",

  'home.placeholder': 'Les simulations apparaîtront ici (Phases 4 à 6).',

  // Pied de page
  'footer.tagline': 'Outil pédagogique — calculs effectués entièrement côté client.',
  'footer.level': 'Niveau lycée avancé / début du supérieur',
} as const;

// La version EN doit couvrir exactement les mêmes clés que `fr`.
const en: Record<keyof typeof fr, string> = {
  'nav.euler': 'Euler method',
  'nav.decay': 'Radioactive decay',
  'nav.titration': 'Titration',

  'hero.eyebrow': 'Virtual laboratory',
  'hero.title': 'Science Lab',
  'hero.subtitle': 'Interactive simulations for mathematics, physics and chemistry',
  'hero.intro':
    'An app to visualize scientific concepts rather than just read about them: adjust the parameters and watch the effect in real time.',

  'home.placeholder': 'Simulations will appear here (Phases 4 to 6).',

  'footer.tagline': 'Educational tool — all computations run entirely in the browser.',
  'footer.level': 'Advanced high-school / early undergraduate level',
};

export type TranslationKey = keyof typeof fr;

export const translations: Record<Lang, Record<TranslationKey, string>> = { fr, en };
