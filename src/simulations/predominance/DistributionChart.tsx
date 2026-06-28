import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DistributionPoint, Indicator } from './predominanceMath';

interface DistributionChartProps {
  data: DistributionPoint[];
  pKA: number;
  pH: number;
  indicator: Indicator | null;
  labels: { ph: string; fraction: string; acid: string; base: string; pka: string };
  ariaLabel: string;
}

export const PREDOMINANCE_COLORS = {
  acid: '#4f46e5', // indigo (accent) — forme acide
  base: '#0891b2', // cyan — forme basique
  pka: '#059669', // émeraude — pH = pKA
  now: '#e11d48', // rose — pH actuel
};

export default function DistributionChart({
  data,
  pKA,
  pH,
  indicator,
  labels,
  ariaLabel,
}: DistributionChartProps) {
  return (
    <div className="h-72 w-full" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 16 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis
            dataKey="pH"
            type="number"
            domain={[0, 14]}
            ticks={[0, 2, 4, 6, 8, 10, 12, 14]}
            stroke="#94a3b8"
            fontSize={12}
            label={{ value: labels.ph, position: 'insideBottomRight', offset: -4, fill: '#475569', fontSize: 12 }}
          />
          <YAxis
            domain={[0, 1]}
            ticks={[0, 0.25, 0.5, 0.75, 1]}
            stroke="#94a3b8"
            fontSize={12}
            width={36}
            tickFormatter={(v: number) => v.toFixed(2)}
          />
          <Tooltip
            isAnimationActive={false}
            formatter={(value: number, name: string) => [value.toFixed(3), name]}
            labelFormatter={(l: number) => `${labels.ph} = ${(+l).toFixed(1)}`}
            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
          />

          {/* Zone de virage de l'indicateur sélectionné */}
          {indicator ? (
            <ReferenceArea
              x1={indicator.pHLow}
              x2={indicator.pHHigh}
              fill={indicator.colorBase}
              fillOpacity={0.14}
              stroke={indicator.colorBase}
              strokeOpacity={0.4}
            />
          ) : null}

          {/* Égalité des formes (50 %) et pH = pKA */}
          <ReferenceLine y={0.5} stroke="#94a3b8" strokeDasharray="2 3" />
          <ReferenceLine
            x={pKA}
            stroke={PREDOMINANCE_COLORS.pka}
            strokeDasharray="4 2"
            label={{ value: labels.pka, position: 'insideTopLeft', fill: PREDOMINANCE_COLORS.pka, fontSize: 11 }}
          />
          {/* pH actuel */}
          <ReferenceLine x={pH} stroke={PREDOMINANCE_COLORS.now} strokeWidth={1.5} />

          <Line
            type="monotone"
            dataKey="acid"
            name={labels.acid}
            stroke={PREDOMINANCE_COLORS.acid}
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="base"
            name={labels.base}
            stroke={PREDOMINANCE_COLORS.base}
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
