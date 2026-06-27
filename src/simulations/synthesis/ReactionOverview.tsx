import {
  FAMILY_COLORS,
  REACTIONS,
  type GroupId,
  type ReactionDetail,
  type ReactionFamily,
} from './synthesisData';

interface ReactionOverviewProps {
  groups: Record<GroupId, string>;
  families: Record<ReactionFamily, string>;
  details: Record<ReactionDetail, string>;
  labels: { reaction: string; type: string; yield: string };
}

/**
 * Vue d'ensemble : tableau simple des 16 réactions de la banque (départ → arrivée, type,
 * rendement). Volontairement PAS un graphe de nœuds/flèches (rendu complexe pour peu de
 * gain) — un tableau est aussi informatif et sûr à afficher.
 */
export default function ReactionOverview({ groups, families, details, labels }: ReactionOverviewProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-400">
          <tr>
            <th className="px-3 py-2 font-semibold">{labels.reaction}</th>
            <th className="px-3 py-2 font-semibold">{labels.type}</th>
            <th className="px-3 py-2 text-right font-semibold">{labels.yield}</th>
          </tr>
        </thead>
        <tbody>
          {REACTIONS.map((r, i) => (
            <tr key={i} className="border-t border-slate-100">
              <td className="whitespace-nowrap px-3 py-2 text-slate-800">
                {groups[r.from]} → {groups[r.to]}
              </td>
              <td className="px-3 py-2">
                <span className="font-medium" style={{ color: FAMILY_COLORS[r.family] }}>
                  {families[r.family]}
                </span>
                <span className="text-slate-500"> · {details[r.detail]}</span>
              </td>
              <td className="px-3 py-2 text-right font-mono tabular-nums text-slate-700">
                {Math.round(r.yield * 100)} %
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
