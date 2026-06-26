import { describe, it, expect } from 'vitest';
import { parse, simHref } from './useHashRoute';
import { simulations } from '../simulations/registry';

describe('useHashRoute.parse', () => {
  it('vide ou racine → galerie', () => {
    expect(parse('')).toEqual({ name: 'gallery' });
    expect(parse('#/')).toEqual({ name: 'gallery' });
  });

  it('route de simulation', () => {
    expect(parse('#/sim/euler')).toEqual({ name: 'sim', id: 'euler' });
  });

  it('route inconnue → galerie', () => {
    expect(parse('#/nimporte')).toEqual({ name: 'gallery' });
  });

  it('encodage malformé ne lève pas d’exception → galerie', () => {
    expect(parse('#/sim/%E0%A4%A')).toEqual({ name: 'gallery' });
  });

  it('chaque simulation du registre fait un aller-retour via le routeur', () => {
    for (const s of simulations) {
      expect(parse(simHref(s.id))).toEqual({ name: 'sim', id: s.id });
    }
  });
});
