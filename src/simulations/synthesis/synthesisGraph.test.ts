import { describe, it, expect } from 'vitest';
import { CHALLENGES, GROUPS, REACTIONS } from './synthesisData';
import { availableReactions, findAllPaths, findBestPath } from './synthesisGraph';

describe('synthesisData (banque)', () => {
  it('10 groupes, 16 réactions', () => {
    expect(GROUPS).toHaveLength(10);
    expect(REACTIONS).toHaveLength(16);
  });

  it('réactions cohérentes : groupes connus, rendement ∈ ]0, 1], pas de boucle from===to', () => {
    const ids = new Set(GROUPS.map((g) => g.id));
    for (const r of REACTIONS) {
      expect(ids.has(r.from)).toBe(true);
      expect(ids.has(r.to)).toBe(true);
      expect(r.from).not.toBe(r.to);
      expect(r.yield).toBeGreaterThan(0);
      expect(r.yield).toBeLessThanOrEqual(1);
    }
  });

  it('amine est une impasse (aucune réaction n’en part)', () => {
    expect(availableReactions('amine')).toHaveLength(0);
  });

  it('exactement les 5 familles attendues — aucune protection/déprotection', () => {
    const families = [...new Set(REACTIONS.map((r) => r.family))].sort();
    expect(families).toEqual(['acid-base', 'addition', 'elimination', 'redox', 'substitution']);
  });
});

describe('synthesisGraph — défis (valeurs de référence)', () => {
  it('Défi A : haloalkane → ester, chemin unique de 4 étapes, ≈ 37,3 %', () => {
    const all = findAllPaths('haloalkane', 'ester');
    expect(all).toHaveLength(1); // chemin unique
    const best = findBestPath('haloalkane', 'ester');
    expect(best).not.toBeNull();
    expect(best!.steps).toHaveLength(4);
    expect(best!.yield).toBeCloseTo(0.75 * 0.85 * 0.9 * 0.65, 10);
    expect(best!.yield).toBeCloseTo(0.373, 3);
    expect(best!.groups).toEqual(['haloalkane', 'alcohol1', 'aldehyde', 'carboxylicacid', 'ester']);
  });

  it('Défi B : alkene → amide, deux chemins ; optimal via haloalkane (5 ét.) > via alcohol2 (6 ét.)', () => {
    const all = findAllPaths('alkene', 'amide');
    expect(all).toHaveLength(2);
    const viaHalo = all.find((p) => p.groups[1] === 'haloalkane');
    const viaAlcohol2 = all.find((p) => p.groups[1] === 'alcohol2');
    expect(viaHalo).toBeDefined();
    expect(viaAlcohol2).toBeDefined();
    expect(viaHalo!.steps).toHaveLength(5);
    expect(viaAlcohol2!.steps).toHaveLength(6);
    expect(viaHalo!.yield).toBeCloseTo(0.252, 3);
    expect(viaAlcohol2!.yield).toBeCloseTo(0.144, 3);

    const best = findBestPath('alkene', 'amide');
    expect(best!.groups[1]).toBe('haloalkane'); // le premier choix conditionne tout
    expect(best!.yield).toBeGreaterThan(viaAlcohol2!.yield);
  });

  it('Défi C : ketone → ester, chemin unique forcé de 6 étapes, ≈ 22,3 %', () => {
    const all = findAllPaths('ketone', 'ester');
    expect(all).toHaveLength(1); // aucun embranchement possible
    const best = findBestPath('ketone', 'ester');
    expect(best!.steps).toHaveLength(6);
    expect(best!.yield).toBeCloseTo(0.223, 3);
    expect(best!.groups).toEqual([
      'ketone',
      'alcohol2',
      'haloalkane',
      'alcohol1',
      'aldehyde',
      'carboxylicacid',
      'ester',
    ]);
  });

  it('findBestPath : null documenté si aucun chemin (depuis l’impasse amine)', () => {
    expect(findBestPath('amine', 'ester')).toBeNull();
  });

  it('chaque défi du registre a bien un meilleur chemin', () => {
    for (const ch of CHALLENGES) {
      expect(findBestPath(ch.start, ch.target)).not.toBeNull();
    }
  });
});
