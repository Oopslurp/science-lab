import {
  Bar,
  BarChart,
  CartesianGrid,
  ReferenceArea,
  ReferenceLine,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from 'recharts';
import type { HistogramBin } from './largeNumbersMath';

interface MeansHistogramProps {
  bins: HistogramBin[];
  mu: number;
  band: { low: number; high: number };
  domain: [number, number];
  labels: { axis: string; mu: string };
  ariaLabel: string;
}

export const HIST_COLORS = {
  bar: '#6366f1', // barres (indigo)
  band: '#34d399', // bande de concentration (émeraude)
  mu: '#059669', // espérance μ (émeraude foncé)
};

export default function MeansHistogram({
  bins,
  mu,
  band,
  domain,
  labels,
  ariaLabel,
}: MeansHistogramProps) {
  return (
    <div className="h-72 w-full" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer>
        <BarChart data={bins} margin={{ top: 8, right: 16, left: 0, bottom: 16 }}>
          <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" />
          {/* Bande de concentration [μ − kσ/√n, μ + kσ/√n] (derrière les barres) */}
          <ReferenceArea x1={band.low} x2={band.high} fill={HIST_COLORS.band} fillOpacity={0.18} />
          <XAxis
            dataKey="mid"
            type="number"
            domain={domain}
            tickCount={7}
            stroke="#94a3b8"
            fontSize={12}
            tickFormatter={(v: number) => v.toFixed(2)}
            label={{ value: labels.axis, position: 'insideBottomRight', offset: -4, fill: '#475569', fontSize: 12 }}
          />
          <YAxis stroke="#94a3b8" fontSize={12} width={40} allowDecimals={false} />
          <Bar dataKey="count" fill={HIST_COLORS.bar} isAnimationActive={false} />
          {/* Espérance μ (cible) par-dessus */}
          <ReferenceLine
            x={mu}
            stroke={HIST_COLORS.mu}
            strokeWidth={2}
            label={{ value: labels.mu, position: 'top', fill: HIST_COLORS.mu, fontSize: 12 }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
