import { REACTIONS, type GroupId, type Reaction } from './synthesisData';

export interface PathResult {
  groups: GroupId[]; // séquence de groupes traversés (start … target)
  steps: Reaction[]; // réactions enchaînées (length = nombre d'étapes)
  yield: number; // produit des rendements des étapes
}

/** Réactions partant d'un groupe donné (liste vide si aucune — ex. impasse `amine`). */
export function availableReactions(from: GroupId): Reaction[] {
  return REACTIONS.filter((r) => r.from === from);
}

/**
 * Tous les chemins SIMPLES (sans repasser par un groupe déjà visité) de `start` à `target`.
 * Recherche en profondeur exhaustive : le graphe est minuscule (10 nœuds, 16 arêtes).
 * Le rendement d'un chemin = produit des rendements de ses étapes (1 pour 0 étape).
 */
export function findAllPaths(start: GroupId, target: GroupId): PathResult[] {
  const results: PathResult[] = [];
  const visited = new Set<GroupId>([start]);
  const steps: Reaction[] = [];

  const dfs = (current: GroupId): void => {
    if (current === target) {
      results.push({
        groups: [start, ...steps.map((s) => s.to)],
        steps: [...steps],
        yield: steps.reduce((acc, s) => acc * s.yield, 1),
      });
      return;
    }
    for (const r of availableReactions(current)) {
      if (visited.has(r.to)) continue; // chemins simples : pas de cycle
      visited.add(r.to);
      steps.push(r);
      dfs(r.to);
      steps.pop();
      visited.delete(r.to);
    }
  };

  dfs(start);
  return results;
}

/**
 * Meilleur chemin (rendement maximal) de `start` à `target`.
 * `null` documenté si aucun chemin n'existe (jamais d'exception).
 */
export function findBestPath(start: GroupId, target: GroupId): PathResult | null {
  const paths = findAllPaths(start, target);
  if (paths.length === 0) return null;
  return paths.reduce((best, p) => (p.yield > best.yield ? p : best));
}
