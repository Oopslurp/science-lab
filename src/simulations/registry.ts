import { lazy } from 'react';
import type { SimulationMeta } from './types';
import EulerIcon from './euler/EulerIcon';
import DecayIcon from './decay/DecayIcon';
import TitrationIcon from './titration/TitrationIcon';
import RiemannIcon from './riemann/RiemannIcon';
import EquilibriumIcon from './equilibrium/EquilibriumIcon';

// Composants chargés en différé : Recharts & co ne sont téléchargés qu'à l'ouverture
// d'une simulation, pas sur la galerie d'accueil.
const EulerSimulation = lazy(() => import('./euler/EulerSimulation'));
const DecaySimulation = lazy(() => import('./decay/DecaySimulation'));
const TitrationSimulation = lazy(() => import('./titration/TitrationSimulation'));
const RiemannSimulation = lazy(() => import('./riemann/RiemannSimulation'));
const EquilibriumSimulation = lazy(() => import('./equilibrium/EquilibriumSimulation'));

/**
 * Registre des simulations — SOURCE UNIQUE DE VÉRITÉ.
 * La galerie (regroupée par catégorie) itère sur ce tableau.
 * Pour ajouter une simulation : créer son module puis ajouter une entrée ici
 * (id, catégorie, titre/description FR-EN, icône, composant).
 */
export const simulations: SimulationMeta[] = [
  {
    id: 'riemann',
    category: 'maths',
    title: { fr: 'Sommes de Riemann', en: 'Riemann sums' },
    description: {
      fr: 'Méthode des rectangles : approcher une intégrale et encadrer son aire.',
      en: 'Rectangle method: approximating an integral and bracketing its area.',
    },
    icon: RiemannIcon,
    component: RiemannSimulation,
  },
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
  {
    id: 'equilibrium',
    category: 'chemistry',
    title: { fr: 'Équilibre chimique', en: 'Chemical equilibrium' },
    description: {
      fr: 'Quotient de réaction Qr vs constante K : avancement d’un acide faible à l’équilibre.',
      en: 'Reaction quotient Qr vs constant K: weak-acid advancement at equilibrium.',
    },
    icon: EquilibriumIcon,
    component: EquilibriumSimulation,
  },
];
