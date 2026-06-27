import type { LawId } from './largeNumbersMath';

interface DrawAnimationProps {
  law: LawId;
  displayed: number[]; // tirages révélés (déjà tronqués au plafond d'affichage)
  hiddenCount: number; // tirages réels NON affichés (n − plafond), > 0 si dépassement
  mean: number; // Mₙ calculée sur TOUS les n tirages
  labels: { title: string; sampleMean: string; more: (x: number) => string; heads: string; tails: string };
}

// Disposition des points d'un dé (grille 3×3), en coordonnées viewBox 0..1.
const PIPS: Record<number, Array<[number, number]>> = {
  1: [[0.5, 0.5]],
  2: [[0.28, 0.28], [0.72, 0.72]],
  3: [[0.28, 0.28], [0.5, 0.5], [0.72, 0.72]],
  4: [[0.28, 0.28], [0.72, 0.28], [0.28, 0.72], [0.72, 0.72]],
  5: [[0.28, 0.28], [0.72, 0.28], [0.5, 0.5], [0.28, 0.72], [0.72, 0.72]],
  6: [[0.28, 0.3], [0.72, 0.3], [0.28, 0.5], [0.72, 0.5], [0.28, 0.7], [0.72, 0.7]],
};

function Die({ value }: { value: number }) {
  return (
    <svg viewBox="0 0 1 1" className="h-9 w-9" aria-hidden>
      <rect x="0.04" y="0.04" width="0.92" height="0.92" rx="0.16" fill="#fff" stroke="#475569" strokeWidth="0.05" />
      {(PIPS[value] ?? []).map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="0.09" fill="#4f46e5" />
      ))}
    </svg>
  );
}

function Coin({ value, heads, tails }: { value: number; heads: string; tails: string }) {
  const isHeads = value === 1;
  return (
    <span
      className={
        'inline-flex h-9 w-9 items-center justify-center rounded-full border text-sm font-semibold ' +
        (isHeads ? 'border-accent bg-accent/10 text-accent' : 'border-slate-300 bg-slate-50 text-slate-500')
      }
    >
      {isHeads ? heads : tails}
    </span>
  );
}

export default function DrawAnimation({ law, displayed, hiddenCount, mean, labels }: DrawAnimationProps) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">{labels.title}</p>
      <div className="flex flex-wrap items-center gap-1.5">
        {displayed.map((v, i) => {
          if (law === 'dice') return <Die key={i} value={v} />;
          if (law === 'coin') return <Coin key={i} value={v} heads={labels.heads} tails={labels.tails} />;
          return (
            <span
              key={i}
              className="inline-flex h-9 min-w-9 items-center justify-center rounded-md border border-slate-200 bg-slate-50 px-1.5 font-mono text-xs tabular-nums text-slate-700"
            >
              {v.toFixed(2)}
            </span>
          );
        })}
        {hiddenCount > 0 ? (
          <span className="ml-1 text-xs font-medium text-slate-400">{labels.more(hiddenCount)}</span>
        ) : null}
      </div>
      <p className="mt-3 font-mono text-sm tabular-nums text-slate-800">
        {labels.sampleMean} = <span className="font-semibold text-accent">{mean.toFixed(3)}</span>
      </p>
    </div>
  );
}
