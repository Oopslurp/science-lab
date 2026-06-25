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
import type { TitrationPoint } from './titrationMath';

interface TitrationChartProps {
  data: TitrationPoint[];
  ve: number; // volume équivalent
  currentV: number; // volume versé actuel
  vMax: number;
  labels: { volume: string; ph: string; equivalence: string };
}

export const TITRATION_COLORS = {
  curve: '#4f46e5', // indigo (accent)
  equivalence: '#059669', // emerald
  now: '#e11d48', // rose
  neutral: '#94a3b8', // gris (pH 7)
};

export default function TitrationChart({
  data,
  ve,
  currentV,
  vMax,
  labels,
}: TitrationChartProps) {
  return (
    <div className="h-72 w-full">
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 16, right: 16, left: 0, bottom: 16 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis
            dataKey="v"
            type="number"
            domain={[0, vMax]}
            tickCount={7}
            stroke="#94a3b8"
            fontSize={12}
            tickFormatter={(v: number) => v.toFixed(0)}
            label={{ value: labels.volume, position: 'insideBottomRight', offset: -4, fill: '#475569', fontSize: 12 }}
          />
          <YAxis
            domain={[0, 14]}
            ticks={[0, 2, 4, 6, 8, 10, 12, 14]}
            stroke="#94a3b8"
            fontSize={12}
            width={32}
          />
          <Tooltip
            isAnimationActive={false}
            formatter={(value: number) => [value.toFixed(2), labels.ph]}
            labelFormatter={(l: number) => `${labels.volume} = ${(+l).toFixed(1)}`}
            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
          />
          {/* pH neutre */}
          <ReferenceLine y={7} stroke={TITRATION_COLORS.neutral} strokeDasharray="2 3" />
          {/* Volume équivalent */}
          <ReferenceLine
            x={ve}
            stroke={TITRATION_COLORS.equivalence}
            strokeDasharray="4 2"
            label={{ value: labels.equivalence, position: 'insideTopRight', fill: TITRATION_COLORS.equivalence, fontSize: 11 }}
          />
          <Line
            type="linear"
            dataKey="pH"
            stroke={TITRATION_COLORS.curve}
            strokeWidth={2.5}
            dot={false}
            isAnimationActive={false}
          />
          <ReferenceDot x={ve} y={7} r={4} fill={TITRATION_COLORS.equivalence} stroke="#fff" strokeWidth={1.5} />
          <ReferenceLine x={currentV} stroke={TITRATION_COLORS.now} strokeDasharray="4 2" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
