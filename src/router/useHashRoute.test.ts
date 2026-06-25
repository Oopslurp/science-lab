import { describe, it, expect } from 'vitest';
import { parse } from './useHashRoute';

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
});
