import type { ReactElement, ReactNode } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

export interface KineticsChartPoint {
  t: number;
  aMain: number;
  vMain: number;
  aBase: number;
  vBase: number;
}

interface KineticsChartsProps {
  data: KineticsChartPoint[];
  showBase: boolean; // courbe « sans catalyseur » estompée en superposition
  a0: number;
  vMax: number;
  tMax: number;
  labels: { time: string; conc: string; rate: string };
  ariaConc: string;
  ariaRate: string;
}

export const KINETICS_COLORS = {
  conc: '#4f46e5', // [A](t) — indigo (accent)
  rate: '#0891b2', // v(t) — cyan
  base: '#94a3b8', // sans catalyseur — ardoise estompée
};

function ChartFrame({ ariaLabel, children }: { ariaLabel: string; children: ReactNode }) {
  return (
    <div className="h-52 w-full" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer>{children as ReactElement}</ResponsiveContainer>
    </div>
  );
}

export default function KineticsCharts({
  data,
  showBase,
  a0,
  vMax,
  tMax,
  labels,
  ariaConc,
  ariaRate,
}: KineticsChartsProps) {
  const xAxis = (
    <XAxis
      dataKey="t"
      type="number"
      domain={[0, tMax]}
      tickCount={7}
      stroke="#94a3b8"
      fontSize={12}
      tickFormatter={(v: number) => v.toFixed(0)}
      label={{ value: labels.time, position: 'insideBottomRight', offset: -4, fill: '#475569', fontSize: 12 }}
    />
  );

  return (
    <div className="space-y-3">
      {/* Concentration [A](t) */}
      <ChartFrame ariaLabel={ariaConc}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 16 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          {xAxis}
          <YAxis domain={[0, a0]} stroke="#94a3b8" fontSize={12} width={48} tickFormatter={(v: number) => v.toFixed(2)} />
          <Tooltip
            isAnimationActive={false}
            formatter={(value: number) => value.toFixed(3)}
            labelFormatter={(l: number) => `${labels.time} = ${(+l).toFixed(1)}`}
            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
          />
          {showBase ? (
            <Line type="monotone" dataKey="aBase" name={labels.conc} stroke={KINETICS_COLORS.base} strokeWidth={2} strokeDasharray="5 4" dot={false} isAnimationActive={false} opacity={0.8} />
          ) : null}
          <Line type="monotone" dataKey="aMain" name={labels.conc} stroke={KINETICS_COLORS.conc} strokeWidth={2.5} dot={false} isAnimationActive={false} />
        </LineChart>
      </ChartFrame>

      {/* Vitesse v(t) */}
      <ChartFrame ariaLabel={ariaRate}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 16 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          {xAxis}
          <YAxis domain={[0, vMax]} stroke="#94a3b8" fontSize={12} width={48} tickFormatter={(v: number) => v.toFixed(2)} />
          <Tooltip
            isAnimationActive={false}
            formatter={(value: number) => value.toFixed(3)}
            labelFormatter={(l: number) => `${labels.time} = ${(+l).toFixed(1)}`}
            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
          />
          {showBase ? (
            <Line type="monotone" dataKey="vBase" name={labels.rate} stroke={KINETICS_COLORS.base} strokeWidth={2} strokeDasharray="5 4" dot={false} isAnimationActive={false} opacity={0.8} />
          ) : null}
          <Line type="monotone" dataKey="vMain" name={labels.rate} stroke={KINETICS_COLORS.rate} strokeWidth={2.5} dot={false} isAnimationActive={false} />
        </LineChart>
      </ChartFrame>
    </div>
  );
}
