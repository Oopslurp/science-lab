import { lazy } from 'react';
import type { SimulationMeta } from './types';
import EulerIcon from './euler/EulerIcon';
import DecayIcon from './decay/DecayIcon';
import TitrationIcon from './titration/TitrationIcon';
import RiemannIcon from './riemann/RiemannIcon';
import BisectionIcon from './bisection/BisectionIcon';
import ConvexityIcon from './convexity/ConvexityIcon';
import GaltonIcon from './galton/GaltonIcon';
import EquilibriumIcon from './equilibrium/EquilibriumIcon';
import YoungIcon from './young/YoungIcon';
import KeplerIcon from './kepler/KeplerIcon';
import ProjectileIcon from './projectile/ProjectileIcon';
import KineticsIcon from './kinetics/KineticsIcon';
import IdealGasIcon from './idealgas/IdealGasIcon';
import DopplerIcon from './doppler/DopplerIcon';
import LargeNumbersIcon from './largenumbers/LargeNumbersIcon';
import SynthesisIcon from './synthesis/SynthesisIcon';
import PredominanceIcon from './predominance/PredominanceIcon';
import BatteryIcon from './battery/BatteryIcon';

// Composants chargés en différé : Recharts & co ne sont téléchargés qu'à l'ouverture
// d'une simulation, pas sur la galerie d'accueil.
const EulerSimulation = lazy(() => import('./euler/EulerSimulation'));
const DecaySimulation = lazy(() => import('./decay/DecaySimulation'));
const TitrationSimulation = lazy(() => import('./titration/TitrationSimulation'));
const RiemannSimulation = lazy(() => import('./riemann/RiemannSimulation'));
const BisectionSimulation = lazy(() => import('./bisection/BisectionSimulation'));
const ConvexitySimulation = lazy(() => import('./convexity/ConvexitySimulation'));
const GaltonSimulation = lazy(() => import('./galton/GaltonSimulation'));
const EquilibriumSimulation = lazy(() => import('./equilibrium/EquilibriumSimulation'));
const YoungSimulation = lazy(() => import('./young/YoungSimulation'));
const KeplerSimulation = lazy(() => import('./kepler/KeplerSimulation'));
const ProjectileSimulation = lazy(() => import('./projectile/ProjectileSimulation'));
const KineticsSimulation = lazy(() => import('./kinetics/KineticsSimulation'));
const IdealGasSimulation = lazy(() => import('./idealgas/IdealGasSimulation'));
const DopplerSimulation = lazy(() => import('./doppler/DopplerSimulation'));
const LargeNumbersSimulation = lazy(() => import('./largenumbers/LargeNumbersSimulation'));
const SynthesisSimulation = lazy(() => import('./synthesis/SynthesisSimulation'));
const PredominanceSimulation = lazy(() => import('./predominance/PredominanceSimulation'));
const BatterySimulation = lazy(() => import('./battery/BatterySimulation'));

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
    id: 'largenumbers',
    category: 'maths',
    title: { fr: 'Loi des grands nombres', en: 'Law of large numbers' },
    description: {
      fr: 'Concentration des moyennes et inégalité de Bienaymé-Tchebychev (borne pessimiste).',
      en: 'Concentration of sample means and the Bienaymé-Chebyshev inequality (pessimistic bound).',
    },
    icon: LargeNumbersIcon,
    component: LargeNumbersSimulation,
  },
  {
    id: 'bisection',
    category: 'maths',
    title: { fr: 'Méthode de dichotomie', en: 'Bisection method' },
    description: {
      fr: 'Résoudre f(x) = 0 par encadrements successifs : un intervalle qui se divise en deux à chaque pas.',
      en: 'Solving f(x) = 0 by successive bracketing: an interval halved at each step.',
    },
    icon: BisectionIcon,
    component: BisectionSimulation,
  },
  {
    id: 'convexity',
    category: 'maths',
    title: { fr: 'Convexité et inflexions', en: 'Convexity and inflections' },
    description: {
      fr: 'Convexité d’une courbe, signe de f″ et points d’inflexion, lus sur la tangente.',
      en: 'Convexity of a curve, sign of f″ and inflection points, read off the tangent.',
    },
    icon: ConvexityIcon,
    component: ConvexitySimulation,
  },
  {
    id: 'galton',
    category: 'maths',
    title: { fr: 'Planche de Galton', en: 'Galton board' },
    description: {
      fr: 'Billes tombant à travers des clous : la loi binomiale émerge et tend vers la cloche normale.',
      en: 'Balls falling through pegs: the binomial law emerges and tends to the normal bell.',
    },
    icon: GaltonIcon,
    component: GaltonSimulation,
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
    id: 'young',
    category: 'physics',
    title: { fr: 'Interférences (fentes de Young)', en: 'Interference (Young’s slits)' },
    description: {
      fr: 'Franges d’interférence de deux fentes : interfrange i = λ·D / a.',
      en: 'Two-slit interference fringes: fringe spacing i = λ·D / a.',
    },
    icon: YoungIcon,
    component: YoungSimulation,
  },
  {
    id: 'kepler',
    category: 'physics',
    title: { fr: 'Gravitation (orbites de Kepler)', en: 'Gravitation (Kepler orbits)' },
    description: {
      fr: 'Orbite dans un champ de gravitation : intégration semi-implicite et 3ᵉ loi de Kepler.',
      en: 'Orbit in a gravitational field: symplectic integration and Kepler’s 3rd law.',
    },
    icon: KeplerIcon,
    component: KeplerSimulation,
  },
  {
    id: 'projectile',
    category: 'physics',
    title: { fr: 'Champ uniforme (tir parabolique)', en: 'Uniform field (projectile)' },
    description: {
      fr: 'Tir dans un champ uniforme (pesanteur ou électrique) : trajectoire et énergie mécanique.',
      en: 'Launch in a uniform field (gravity or electric): trajectory and mechanical energy.',
    },
    icon: ProjectileIcon,
    component: ProjectileSimulation,
  },
  {
    id: 'idealgas',
    category: 'physics',
    title: { fr: 'Gaz parfait', en: 'Ideal gas' },
    description: {
      fr: 'Équation d’état P·V = n·R·T : pression, volume, température et agitation des particules.',
      en: 'Equation of state P·V = n·R·T: pressure, volume, temperature and particle agitation.',
    },
    icon: IdealGasIcon,
    component: IdealGasSimulation,
  },
  {
    id: 'doppler',
    category: 'physics',
    title: { fr: 'Effet Doppler', en: 'Doppler effect' },
    description: {
      fr: 'Source sonore mobile : fronts d’onde resserrés ou étirés et décalage de la fréquence perçue.',
      en: 'Moving sound source: bunched or stretched wavefronts and a shift in the perceived frequency.',
    },
    icon: DopplerIcon,
    component: DopplerSimulation,
  },
  {
    id: 'kinetics',
    category: 'chemistry',
    title: { fr: 'Cinétique chimique', en: 'Chemical kinetics' },
    description: {
      fr: 'Réaction d’ordre 1 : concentration et vitesse, demi-réaction et effet d’un catalyseur.',
      en: 'First-order reaction: concentration and rate, half-reaction and catalyst effect.',
    },
    icon: KineticsIcon,
    component: KineticsSimulation,
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
  {
    id: 'predominance',
    category: 'chemistry',
    title: { fr: 'Diagramme de prédominance', en: 'Predominance diagram' },
    description: {
      fr: 'Couple acide/base et pKA : proportions des espèces selon le pH et zone de virage d’un indicateur.',
      en: 'Acid/base couple and pKA: species proportions versus pH and an indicator’s transition range.',
    },
    icon: PredominanceIcon,
    component: PredominanceSimulation,
  },
  {
    id: 'battery',
    category: 'chemistry',
    title: { fr: 'Pile électrochimique', en: 'Electrochemical cell' },
    description: {
      fr: 'Capacité d’une pile Q = n·z·F, durée de vie et tension de décharge (plateau puis chute).',
      en: 'Cell capacity Q = n·z·F, lifetime and discharge voltage (plateau then drop).',
    },
    icon: BatteryIcon,
    component: BatterySimulation,
  },
  {
    id: 'synthesis',
    category: 'chemistry',
    title: { fr: 'Synthèse organique', en: 'Organic synthesis' },
    description: {
      fr: 'Parcours multi-étapes : choisir des réactions pour atteindre une molécule cible au meilleur rendement.',
      en: 'Multi-step route: pick reactions to reach a target molecule with the best yield.',
    },
    icon: SynthesisIcon,
    component: SynthesisSimulation,
  },
];
