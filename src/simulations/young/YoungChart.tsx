import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { IntensityPoint } from './youngMath';

interface YoungChartProps {
  data: IntensityPoint[];
  color: string; // couleur de la courbe ≈ λ
  labels: { y: string; intensity: string };
  ariaLabel: string;
}

export default function YoungChart({ data, color, labels, ariaLabel }: YoungChartProps) {
  return (
    <div className="h-64 w-full" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 16 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis
            dataKey="yMm"
            type="number"
            domain={[data[0]?.yMm ?? -12, data[data.length - 1]?.yMm ?? 12]}
            tickCount={7}
            stroke="#94a3b8"
            fontSize={12}
            tickFormatter={(v: number) => v.toFixed(0)}
            label={{ value: labels.y, position: 'insideBottomRight', offset: -4, fill: '#475569', fontSize: 12 }}
          />
          <YAxis domain={[0, 1.05]} stroke="#94a3b8" fontSize={12} width={32} tickFormatter={(v: number) => v.toFixed(1)} />
          <Tooltip
            isAnimationActive={false}
            formatter={(value: number) => [value.toFixed(2), labels.intensity]}
            labelFormatter={(l: number) => `${labels.y} = ${(+l).toFixed(1)}`}
            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
          />
          <Line type="monotone" dataKey="i" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
