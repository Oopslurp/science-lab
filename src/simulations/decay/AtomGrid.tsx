import { useMemo } from 'react';

interface AtomGridProps {
  n0: number;
  /** Fraction restante e^(−λt) ∈ [0, 1]. */
  fraction: number;
}

// PRNG déterministe (mulberry32) : l'ordre de désintégration est aléatoire mais STABLE.
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Chaque noyau reçoit un seuil ∈ (0,1] (valeurs uniformément réparties puis mélangées).
 * Un noyau est « présent » tant que son seuil ≤ fraction restante. Conséquence :
 *  - le nombre de noyaux présents = round(fraction·N₀) → cohérent avec la courbe ;
 *  - ils s'éteignent dans un ordre spatial aléatoire (désintégration individuelle aléatoire).
 */
export default function AtomGrid({ n0, fraction }: AtomGridProps) {
  const thresholds = useMemo(() => {
    const arr = Array.from({ length: n0 }, (_, i) => (i + 0.5) / n0);
    const rnd = mulberry32(0x9e3779b9 ^ n0);
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }, [n0]);

  const cols = Math.ceil(Math.sqrt(n0));

  return (
    <div
      className="grid gap-1"
      style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
      aria-hidden
    >
      {thresholds.map((threshold, i) => {
        const present = threshold <= fraction;
        return (
          <span
            key={i}
            className={
              'aspect-square rounded-sm transition-colors duration-500 ' +
              (present ? 'bg-accent' : 'bg-slate-200')
            }
          />
        );
      })}
    </div>
  );
}
