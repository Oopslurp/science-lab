import type { SimulationMeta } from './types';
import EulerSimulation from './euler/EulerSimulation';
import EulerIcon from './euler/EulerIcon';
import DecaySimulation from './decay/DecaySimulation';
import DecayIcon from './decay/DecayIcon';
import TitrationSimulation from './titration/TitrationSimulation';
import TitrationIcon from './titration/TitrationIcon';

/**
 * Registre des simulations — SOURCE UNIQUE DE VÉRITÉ.
 * La galerie (regroupée par catégorie) itère sur ce tableau.
 * Pour ajouter une simulation : créer son module puis ajouter une entrée ici
 * (id, catégorie, titre/description FR-EN, icône, composant).
 */
export const simulations: SimulationMeta[] = [
  {
    id: 'euler',
    category: 'maths',
    title: { fr: "Méthode d'Euler", en: 'Euler method' },
    description: {
      fr: "Approcher pas à pas la solution de y′ = k·y et visualiser l'erreur numérique.",
      en: 'Step-by-step approximation of y′ = k·y and its numerical error.',
    },
    icon: EulerIcon,
    component: EulerSimulation,
  },
  {
    id: 'decay',
    category: 'physics',
    title: { fr: 'Décroissance radioactive', en: 'Radioactive decay' },
    description: {
      fr: 'Loi exacte N(t) = N₀·e^(−λt), demi-vie réglable et noyaux qui se désintègrent.',
      en: 'Exact law N(t) = N₀·e^(−λt), adjustable half-life and decaying nuclei.',
    },
    icon: DecayIcon,
    component: DecaySimulation,
  },
  {
    id: 'titration',
    category: 'chemistry',
    title: { fr: 'Titrage acide-base', en: 'Acid–base titration' },
    description: {
      fr: 'Courbe pH = f(V) d’un acide fort par une base forte, avec point d’équivalence.',
      en: 'pH = f(V) curve of a strong acid by a strong base, with equivalence point.',
    },
    icon: TitrationIcon,
    component: TitrationSimulation,
  },
];
