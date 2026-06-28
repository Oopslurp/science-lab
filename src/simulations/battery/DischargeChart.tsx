import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DischargePoint } from './batteryMath';

interface DischargeChartProps {
  data: DischargePoint[];
  qMax: number;
  emf: number;
  qNow: number;
  uNow: number;
  labels: { q: string; u: string };
  ariaLabel: string;
}

export const BATTERY_COLORS = {
  curve: '#4f46e5', // indigo (accent) — tension de décharge
  now: '#e11d48', // rose — point de fonctionnement
  emf: '#94a3b8', // gris — tension à vide (emf)
};

function fmtQ(v: number): string {
  return v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v.toFixed(0);
}

export default function DischargeChart({
  data,
  qMax,
  emf,
  qNow,
  uNow,
  labels,
  ariaLabel,
}: DischargeChartProps) {
  return (
    <div className="h-64 w-full" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 16 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis
            dataKey="q"
            type="number"
            domain={[0, qMax]}
            tickCount={6}
            stroke="#94a3b8"
            fontSize={12}
            tickFormatter={fmtQ}
            label={{ value: labels.q, position: 'insideBottomRight', offset: -4, fill: '#475569', fontSize: 12 }}
          />
          <YAxis
            domain={[0, Math.ceil(emf * 1.1 * 10) / 10]}
            stroke="#94a3b8"
            fontSize={12}
            width={36}
            tickFormatter={(v: number) => v.toFixed(1)}
          />
          <Tooltip
            isAnimationActive={false}
            formatter={(value: number) => [`${value.toFixed(2)} V`, labels.u]}
            labelFormatter={(l: number) => `${labels.q} = ${(+l).toFixed(0)} C`}
            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
          />
          {/* Tension à vide (emf) */}
          <ReferenceLine y={emf} stroke={BATTERY_COLORS.emf} strokeDasharray="2 3" />
          {/* Charge délivrée actuelle */}
          <ReferenceLine x={qNow} stroke={BATTERY_COLORS.now} strokeDasharray="4 2" />
          <Line
            type="monotone"
            dataKey="U"
            stroke={BATTERY_COLORS.curve}
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
          />
          <ReferenceDot x={qNow} y={uNow} r={4} fill={BATTERY_COLORS.now} stroke="#fff" strokeWidth={1.5} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
