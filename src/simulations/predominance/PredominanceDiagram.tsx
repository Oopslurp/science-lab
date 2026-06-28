import { type Indicator } from './predominanceMath';
import { PREDOMINANCE_COLORS } from './DistributionChart';

interface PredominanceDiagramProps {
  pKA: number;
  pH: number;
  acidLabel: string;
  baseLabel: string;
  indicator: Indicator | null;
  indicatorName: string | null;
  texts: { predominates: string; pka: string };
  ariaLabel: string;
}

const W = 640;
const H = 150;
const M = { left: 20, right: 20 };
const innerW = W - M.left - M.right;
const BAR_TOP = 34;
const BAR_H = 42;
const BAR_BOTTOM = BAR_TOP + BAR_H;

/** Diagramme de prédominance : axe de pH coupé en pKA, domaine acide | domaine basique. */
export default function PredominanceDiagram({
  pKA,
  pH,
  acidLabel,
  baseLabel,
  indicator,
  indicatorName,
  texts,
  ariaLabel,
}: PredominanceDiagramProps) {
  const sx = (v: number) => M.left + (Math.max(0, Math.min(14, v)) / 14) * innerW;
  const xPka = sx(pKA);
  const xPh = sx(pH);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={ariaLabel}>
      <title>{ariaLabel}</title>

      {/* Domaines de prédominance */}
      <rect x={sx(0)} y={BAR_TOP} width={xPka - sx(0)} height={BAR_H} fill={PREDOMINANCE_COLORS.acid} fillOpacity={0.12} />
      <rect x={xPka} y={BAR_TOP} width={sx(14) - xPka} height={BAR_H} fill={PREDOMINANCE_COLORS.base} fillOpacity={0.12} />
      <rect x={sx(0)} y={BAR_TOP} width={innerW} height={BAR_H} fill="none" stroke="#cbd5e1" />

      {/* Formules + « prédomine » dans chaque domaine */}
      <text x={(sx(0) + xPka) / 2} y={BAR_TOP + 20} textAnchor="middle" fontSize={16} fontWeight={600} fill={PREDOMINANCE_COLORS.acid}>
        {acidLabel}
      </text>
      <text x={(sx(0) + xPka) / 2} y={BAR_TOP + 35} textAnchor="middle" fontSize={10} fill="#64748b">
        {texts.predominates}
      </text>
      <text x={(xPka + sx(14)) / 2} y={BAR_TOP + 20} textAnchor="middle" fontSize={16} fontWeight={600} fill={PREDOMINANCE_COLORS.base}>
        {baseLabel}
      </text>
      <text x={(xPka + sx(14)) / 2} y={BAR_TOP + 35} textAnchor="middle" fontSize={10} fill="#64748b">
        {texts.predominates}
      </text>

      {/* Zone de virage de l'indicateur (par-dessus la barre) */}
      {indicator ? (
        <g>
          <rect
            x={sx(indicator.pHLow)}
            y={BAR_TOP}
            width={sx(indicator.pHHigh) - sx(indicator.pHLow)}
            height={BAR_H}
            fill={indicator.colorBase}
            fillOpacity={0.22}
            stroke={indicator.colorBase}
            strokeDasharray="3 2"
          />
          {indicatorName ? (
            <text x={(sx(indicator.pHLow) + sx(indicator.pHHigh)) / 2} y={BAR_BOTTOM + 32} textAnchor="middle" fontSize={11} fill={indicator.colorBase}>
              {indicatorName}
            </text>
          ) : null}
        </g>
      ) : null}

      {/* Frontière pH = pKA */}
      <line x1={xPka} x2={xPka} y1={BAR_TOP - 8} y2={BAR_BOTTOM + 4} stroke={PREDOMINANCE_COLORS.pka} strokeWidth={1.75} strokeDasharray="4 2" />
      <text x={xPka} y={BAR_TOP - 12} textAnchor="middle" fontSize={11} fontWeight={600} fill={PREDOMINANCE_COLORS.pka}>
        {texts.pka} = {pKA.toFixed(2)}
      </text>

      {/* Graduations pH */}
      {[0, 2, 4, 6, 8, 10, 12, 14].map((t) => (
        <g key={t}>
          <line x1={sx(t)} x2={sx(t)} y1={BAR_BOTTOM} y2={BAR_BOTTOM + 4} stroke="#94a3b8" />
          <text x={sx(t)} y={BAR_BOTTOM + 16} textAnchor="middle" fontSize={10} fill="#64748b">
            {t}
          </text>
        </g>
      ))}

      {/* Curseur pH */}
      <line x1={xPh} x2={xPh} y1={BAR_TOP - 4} y2={BAR_BOTTOM + 4} stroke={PREDOMINANCE_COLORS.now} strokeWidth={1.75} />
      <path d={`M${xPh - 5},${BAR_TOP - 12} L${xPh + 5},${BAR_TOP - 12} L${xPh},${BAR_TOP - 4} Z`} fill={PREDOMINANCE_COLORS.now} />
    </svg>
  );
}
