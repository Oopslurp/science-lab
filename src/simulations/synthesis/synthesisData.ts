/**
 * Banque FIXE de la synthèse organique multi-étapes.
 *
 * Toutes les structures partagent la même chaîne carbonée à 3 carbones : seul le groupe
 * caractéristique change d'une étape à l'autre, pas le squelette. Les molécules sont
 * représentées par leur formule semi-développée stylisée (convention des manuels de lycée
 * pour des molécules aussi courtes), pas par un schéma topologique.
 */

export type GroupId =
  | 'alcohol1'
  | 'alcohol2'
  | 'aldehyde'
  | 'ketone'
  | 'carboxylicacid'
  | 'ester'
  | 'amide'
  | 'haloalkane'
  | 'amine'
  | 'alkene';

export interface FunctionalGroup {
  id: GroupId;
  /** Formule semi-développée stylisée (neutre FR/EN). */
  formula: string;
}

/** Les 10 groupes caractéristiques (squelette à 3 carbones commun). */
export const GROUPS: FunctionalGroup[] = [
  { id: 'alcohol1', formula: 'CH₃–CH₂–CH₂–OH' }, // alcool primaire (propan-1-ol)
  { id: 'alcohol2', formula: 'CH₃–CH(OH)–CH₃' }, // alcool secondaire (propan-2-ol)
  { id: 'aldehyde', formula: 'CH₃–CH₂–CHO' }, // aldéhyde (propanal)
  { id: 'ketone', formula: 'CH₃–CO–CH₃' }, // cétone (propan-2-one)
  { id: 'carboxylicacid', formula: 'CH₃–CH₂–COOH' }, // acide carboxylique (acide propanoïque)
  { id: 'ester', formula: 'CH₃–CH₂–COO–CH₃' }, // ester (propanoate de méthyle)
  { id: 'amide', formula: 'CH₃–CH₂–CO–NH₂' }, // amide (propanamide)
  { id: 'haloalkane', formula: 'CH₃–CH₂–CH₂–Cl' }, // halogénoalcane (1-chloropropane)
  { id: 'amine', formula: 'CH₃–CH₂–CH₂–NH₂' }, // amine (propan-1-amine) — impasse intentionnelle
  { id: 'alkene', formula: 'CH₃–CH=CH₂' }, // alcène (propène)
];

const GROUP_BY_ID: Record<GroupId, FunctionalGroup> = Object.fromEntries(
  GROUPS.map((g) => [g.id, g])
) as Record<GroupId, FunctionalGroup>;

/** Groupe par id (retour `undefined` documenté si id inconnu, jamais d'exception). */
export function getGroup(id: GroupId): FunctionalGroup | undefined {
  return GROUP_BY_ID[id];
}

/** Les 5 familles de réaction rencontrées (programme de terminale). */
export type ReactionFamily = 'redox' | 'acid-base' | 'substitution' | 'addition' | 'elimination';

/**
 * Couleur par famille de réaction — CODE CATÉGORIEL pour repérer le type d'un coup d'œil,
 * PAS la vraie couleur du produit chimique. Palette sobre tirée de celle de l'app
 * (indigo/cyan/émeraude/ambre/violet), réutilisée par le ballon, les cartes et la vue
 * d'ensemble (un seul système de couleurs).
 */
export const FAMILY_COLORS: Record<ReactionFamily, string> = {
  redox: '#4f46e5', // indigo (accent)
  substitution: '#0891b2', // cyan
  addition: '#059669', // émeraude
  elimination: '#d97706', // ambre
  'acid-base': '#7c3aed', // violet
};

/** Détail i18n (traduit dans le `content` du composant, pas ici). */
export type ReactionDetail =
  | 'mildOxidation'
  | 'oxidation'
  | 'reduction'
  | 'esterification'
  | 'esterHydrolysis'
  | 'amidification'
  | 'amideHydrolysis'
  | 'nucleophilicSubstitution'
  | 'elimination'
  | 'hxAddition'
  | 'hydration';

export interface Reaction {
  from: GroupId;
  to: GroupId;
  family: ReactionFamily;
  detail: ReactionDetail;
  /**
   * Rendement de l'étape ∈ ]0, 1]. **Valeurs ILLUSTRATIVES** (mise en scène pédagogique),
   * PAS des données de laboratoire réelles — à signaler dans le texte théorique (cf. la
   * convention déjà utilisée pour `CATALYST_FACTOR`).
   */
  yield: number;
}

/** Banque FIXE des 16 réactions. */
export const REACTIONS: Reaction[] = [
  { from: 'alcohol1', to: 'aldehyde', family: 'redox', detail: 'mildOxidation', yield: 0.85 },
  { from: 'aldehyde', to: 'carboxylicacid', family: 'redox', detail: 'oxidation', yield: 0.9 },
  { from: 'alcohol2', to: 'ketone', family: 'redox', detail: 'oxidation', yield: 0.88 },
  { from: 'ketone', to: 'alcohol2', family: 'redox', detail: 'reduction', yield: 0.92 },
  { from: 'aldehyde', to: 'alcohol1', family: 'redox', detail: 'reduction', yield: 0.92 },
  { from: 'carboxylicacid', to: 'ester', family: 'substitution', detail: 'esterification', yield: 0.65 },
  { from: 'ester', to: 'carboxylicacid', family: 'substitution', detail: 'esterHydrolysis', yield: 0.8 },
  { from: 'haloalkane', to: 'alcohol1', family: 'substitution', detail: 'nucleophilicSubstitution', yield: 0.75 },
  { from: 'haloalkane', to: 'amine', family: 'substitution', detail: 'nucleophilicSubstitution', yield: 0.7 },
  { from: 'carboxylicacid', to: 'amide', family: 'acid-base', detail: 'amidification', yield: 0.55 },
  { from: 'amide', to: 'carboxylicacid', family: 'substitution', detail: 'amideHydrolysis', yield: 0.75 },
  { from: 'haloalkane', to: 'alkene', family: 'elimination', detail: 'elimination', yield: 0.6 },
  { from: 'alkene', to: 'haloalkane', family: 'addition', detail: 'hxAddition', yield: 0.8 },
  { from: 'alkene', to: 'alcohol2', family: 'addition', detail: 'hydration', yield: 0.7 },
  { from: 'alcohol1', to: 'haloalkane', family: 'substitution', detail: 'nucleophilicSubstitution', yield: 0.7 },
  { from: 'alcohol2', to: 'haloalkane', family: 'substitution', detail: 'nucleophilicSubstitution', yield: 0.65 },
];

export interface Challenge {
  id: 'A' | 'B' | 'C';
  start: GroupId;
  target: GroupId;
}

/** Les 3 défis (réactif de départ → produit cible). */
export const CHALLENGES: Challenge[] = [
  { id: 'A', start: 'haloalkane', target: 'ester' },
  { id: 'B', start: 'alkene', target: 'amide' },
  { id: 'C', start: 'ketone', target: 'ester' },
];
