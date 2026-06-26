interface ProportionBarsProps {
  items: { label: string; value: number; color: string }[];
  max: number;
  format: (v: number) => string;
}

/** Barres horizontales de proportions relatives (esprit visuel proche de la grille d'atomes). */
export default function ProportionBars({ items, max, format }: ProportionBarsProps) {
  return (
    <div className="space-y-2" aria-hidden>
      {items.map((it, i) => {
        const pct = max > 0 ? Math.max(0, Math.min(1, it.value / max)) * 100 : 0;
        return (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-12 shrink-0 font-mono text-slate-600">{it.label}</span>
            <span className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
              <span
                className="block h-full rounded-full transition-all duration-300"
                style={{ width: `${pct}%`, backgroundColor: it.color }}
              />
            </span>
            <span className="w-24 shrink-0 text-right font-mono tabular-nums text-slate-700">
              {format(it.value)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
