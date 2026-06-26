import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { EnergyPoint } from './projectileMath';

interface EnergyChartProps {
  data: EnergyPoint[];
  currentT: number;
  tMax: number;
  emMax: number;
  labels: { time: string; ec: string; ep: string; em: string };
  ariaLabel: string;
}

export const ENERGY_COLORS = {
  ec: '#4f46e5', // cinétique (indigo)
  ep: '#f59e0b', // potentielle (ambre)
  em: '#475569', // mécanique (ardoise, total)
  now: '#e11d48', // instant courant
};

export default function EnergyChart({
  data,
  currentT,
  tMax,
  emMax,
  labels,
  ariaLabel,
}: EnergyChartProps) {
  return (
    <div className="h-56 w-full" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 16 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          <XAxis
            dataKey="t"
            type="number"
            domain={[0, tMax]}
            tickCount={6}
            stroke="#94a3b8"
            fontSize={12}
            tickFormatter={(v: number) => v.toFixed(1)}
            label={{ value: labels.time, position: 'insideBottomRight', offset: -4, fill: '#475569', fontSize: 12 }}
          />
          <YAxis
            domain={[0, emMax]}
            stroke="#94a3b8"
            fontSize={12}
            width={44}
            tickFormatter={(v: number) => v.toFixed(0)}
          />
          <Tooltip
            isAnimationActive={false}
            formatter={(value: number, name: string) => [value.toFixed(1), name]}
            labelFormatter={(l: number) => `${labels.time} = ${(+l).toFixed(2)}`}
            contentStyle={{ borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 12 }}
          />
          <Line type="monotone" dataKey="ec" name={labels.ec} stroke={ENERGY_COLORS.ec} strokeWidth={2.5} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="ep" name={labels.ep} stroke={ENERGY_COLORS.ep} strokeWidth={2.5} dot={false} isAnimationActive={false} />
          <Line type="monotone" dataKey="em" name={labels.em} stroke={ENERGY_COLORS.em} strokeWidth={2} strokeDasharray="5 3" dot={false} isAnimationActive={false} />
          <ReferenceLine x={currentT} stroke={ENERGY_COLORS.now} strokeDasharray="4 2" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
