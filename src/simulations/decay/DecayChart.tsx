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
import type { DecayPoint } from './decayMath';

interface DecayChartProps {
  data: DecayPoint[];
  markers: DecayPoint[];
  currentT: number;
  n0: number;
  tMax: number;
  labels: { time: string; remaining: string };
}

export const DECAY_COLORS = {
  curve: '#4f46e5', // indigo (accent)
  marker: '#059669', // emerald — repères de demi-vie
  now: '#e11d48', // rose — instant courant
};

export default function DecayChart({
  data,
  markers,
  currentT,
  n0,
  tMax,
  labels,
}: DecayChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 16 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
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
          <YAxis
            domain={[0, n0]}
            stroke="#94a3b8"
            fontSize={12}
            width={44}
            tickFormatter={(v: number) => v.toFixed(0)}
          />
          <Tooltip
            isAnimationActive={false}
            formatter={(value: number) => [Math.round(value).toString(), labels.remaining]}
            labelFormatter={(l: number) => `${labels.time} = ${(+l).toFixed(1)}`}
            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
          />
          <Line
            type="monotone"
            dataKey="n"
            stroke={DECAY_COLORS.curve}
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
          />
          {markers.map((m, i) => (
            <ReferenceDot
              key={i}
              x={m.t}
              y={m.n}
              r={3.5}
              fill={DECAY_COLORS.marker}
              stroke="#fff"
              strokeWidth={1}
            />
          ))}
          <ReferenceLine x={currentT} stroke={DECAY_COLORS.now} strokeDasharray="4 2" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
