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
import type { QrPoint } from './equilibriumMath';

interface EquilibriumChartProps {
  data: QrPoint[];
  ka: number;
  x: number; // avancement à l'équilibre
  bound: number;
  labels: { xi: string; qr: string; k: string };
  ariaLabel: string;
}

export const EQUILIBRIUM_COLORS = {
  curve: '#4f46e5', // indigo (accent) — Qr(ξ)
  k: '#e11d48', // rose — constante K
  point: '#059669', // emerald — état d'équilibre
};

function fmt(v: number): string {
  if (v === 0) return '0';
  const a = Math.abs(v);
  if (a >= 1000 || a < 0.01) return v.toExponential(1);
  if (a >= 1) return v.toFixed(1);
  return v.toFixed(3);
}

export default function EquilibriumChart({
  data,
  ka,
  x,
  bound,
  labels,
  ariaLabel,
}: EquilibriumChartProps) {
  const maxQr = data.length ? data[data.length - 1].qr : ka;
  const yMax = Math.max(maxQr, ka) * 1.1;

  return (
    <div className="h-72 w-full" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 16, right: 16, left: 4, bottom: 16 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis
            dataKey="xi"
            type="number"
            domain={[0, bound]}
            stroke="#94a3b8"
            fontSize={12}
            tickFormatter={fmt}
            label={{ value: labels.xi, position: 'insideBottomRight', offset: -4, fill: '#475569', fontSize: 12 }}
          />
          <YAxis domain={[0, yMax]} stroke="#94a3b8" fontSize={12} width={52} tickFormatter={fmt} />
          <Tooltip
            isAnimationActive={false}
            formatter={(value: number) => [fmt(value), labels.qr]}
            labelFormatter={(l: number) => `${labels.xi} = ${fmt(+l)}`}
            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
          />
          <ReferenceLine
            y={ka}
            stroke={EQUILIBRIUM_COLORS.k}
            strokeDasharray="4 2"
            label={{ value: labels.k, position: 'insideTopRight', fill: EQUILIBRIUM_COLORS.k, fontSize: 11 }}
          />
          <Line
            type="monotone"
            dataKey="qr"
            stroke={EQUILIBRIUM_COLORS.curve}
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
          />
          <ReferenceDot x={x} y={ka} r={4.5} fill={EQUILIBRIUM_COLORS.point} stroke="#fff" strokeWidth={1.5} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
