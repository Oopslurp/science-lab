export interface LegendEntry {
  color: string;
  label: string;
  variant?: 'line' | 'dot'; // ligne (courbes) ou carré (grille)
  dashed?: boolean;
}

/** Légende partagée : échantillon de trait ou de couleur + libellé. */
export default function Legend({ items }: { items: LegendEntry[] }) {
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-600">
      {items.map((it, i) => (
        <span key={i} className="inline-flex items-center gap-1.5">
          {it.variant === 'line' ? (
            <svg width={20} height={8} aria-hidden>
              <line
                x1={0}
                y1={4}
                x2={20}
                y2={4}
                stroke={it.color}
                strokeWidth={2.5}
                strokeDasharray={it.dashed ? '3 2' : undefined}
              />
            </svg>
          ) : (
            <span className="h-3 w-3 rounded-sm" style={{ backgroundColor: it.color }} />
          )}
          {it.label}
        </span>
      ))}
    </div>
  );
}
