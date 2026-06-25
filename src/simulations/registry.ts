import type { SimulationMeta } from './types';
import EulerSimulation from './euler/EulerSimulation';

/**
 * Registre des simulations — SOURCE UNIQUE DE VÉRITÉ.
 * La barre de navigation et la page d'accueil itèrent sur ce tableau.
 * Pour ajouter une simulation : créer son module puis ajouter une entrée ici.
 */
export const simulations: SimulationMeta[] = [
  {
    id: 'euler',
    title: { fr: "Méthode d'Euler", en: 'Euler method' },
    description: {
      fr: "Approcher pas à pas la solution de y′ = k·y et visualiser l'erreur numérique.",
      en: 'Step-by-step approximation of y′ = k·y and its numerical error.',
    },
    component: EulerSimulation,
  },
];
