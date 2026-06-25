import type { LocalizedText } from './types';

export type CategoryId = 'maths' | 'physics' | 'chemistry';

export interface Category {
  id: CategoryId;
  label: LocalizedText;
}

/**
 * Disciplines — SOURCE UNIQUE des catégories.
 * L'ordre de ce tableau définit l'ordre d'affichage des groupes dans la galerie.
 */
export const categories: Category[] = [
  { id: 'maths', label: { fr: 'Mathématiques', en: 'Mathematics' } },
  { id: 'physics', label: { fr: 'Physique', en: 'Physics' } },
  { id: 'chemistry', label: { fr: 'Chimie', en: 'Chemistry' } },
];

export function getCategory(id: CategoryId): Category {
  const found = categories.find((c) => c.id === id);
  if (!found) throw new Error(`Catégorie inconnue : ${id}`);
  return found;
}
