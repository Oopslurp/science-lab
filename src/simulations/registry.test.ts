import { describe, it, expect } from 'vitest';
import { simulations } from './registry';
import { categories } from './categories';

describe('registre des simulations', () => {
  it('ids uniques', () => {
    const ids = simulations.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('chaque simulation référence une catégorie connue', () => {
    const known = new Set(categories.map((c) => c.id));
    for (const s of simulations) {
      expect(known.has(s.category)).toBe(true);
    }
  });

  it('chaque simulation a un titre et une description FR + EN non vides', () => {
    for (const s of simulations) {
      expect(s.title.fr.length).toBeGreaterThan(0);
      expect(s.title.en.length).toBeGreaterThan(0);
      expect(s.description.fr.length).toBeGreaterThan(0);
      expect(s.description.en.length).toBeGreaterThan(0);
    }
  });

  it('chaque simulation a une icône et un composant', () => {
    for (const s of simulations) {
      expect(s.icon).toBeTruthy();
      expect(s.component).toBeTruthy();
    }
  });
});
