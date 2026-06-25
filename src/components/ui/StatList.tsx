export interface StatItem {
  label: string;
  value: string;
  emphasize?: boolean;
}

interface StatListProps {
  items: StatItem[];
  title?: string;
  columns?: 2 | 4;
}

/** Panneau de statistiques partagé par les simulations (mise en forme cohérente). */
export default function StatList({ items, title, columns = 4 }: StatListProps) {
  const cols = columns === 2 ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4';
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      {title ? (
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
          {title}
        </p>
      ) : null}
      <dl className={`grid gap-x-4 gap-y-2 font-mono text-sm tabular-nums ${cols}`}>
        {items.map((it, i) => (
          <div key={i}>
            <dt className="font-sans text-[11px] uppercase tracking-wide text-slate-400">
              {it.label}
            </dt>
            <dd className={it.emphasize ? 'text-accent' : 'text-slate-800'}>{it.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
