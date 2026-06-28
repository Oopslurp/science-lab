interface BatteryGaugeProps {
  /** État de charge ∈ [0, 1]. */
  soc: number;
  voltage: number;
  anode: string;
  cathode: string;
  ariaLabel: string;
}

const W = 320;
const H = 150;

/** Couleur de la jauge selon l'état de charge (vert → ambre → rouge). */
function fillColor(soc: number): string {
  if (soc > 0.5) return '#059669'; // émeraude
  if (soc > 0.2) return '#d97706'; // ambre
  return '#dc2626'; // rouge
}

/** Pile stylisée : niveau de remplissage = état de charge, bornes − (anode) et + (cathode). */
export default function BatteryGauge({ soc, voltage, anode, cathode, ariaLabel }: BatteryGaugeProps) {
  const s = Math.max(0, Math.min(1, soc));
  // Corps de la pile
  const bx = 70;
  const by = 45;
  const bw = 180;
  const bh = 60;
  const pad = 5;
  const innerW = bw - 2 * pad;
  const fillW = innerW * s;
  const color = fillColor(s);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full max-w-xs" role="img" aria-label={ariaLabel}>
      <title>{ariaLabel}</title>

      {/* Bornes : − (anode, gauche) et + (cathode, droite) */}
      <text x={bx - 14} y={by + bh / 2 + 5} textAnchor="middle" fontSize={20} fontWeight={700} fill="#475569">−</text>
      <text x={bx + bw + 20} y={by + bh / 2 + 5} textAnchor="middle" fontSize={20} fontWeight={700} fill="#475569">+</text>
      <text x={bx} y={by - 8} textAnchor="start" fontSize={12} fill="#64748b">{anode}</text>
      <text x={bx + bw} y={by - 8} textAnchor="end" fontSize={12} fill="#64748b">{cathode}</text>

      {/* Cosse + (droite) */}
      <rect x={bx + bw} y={by + bh / 2 - 9} width={7} height={18} rx={2} fill="#cbd5e1" />

      {/* Remplissage (état de charge) */}
      <rect x={bx + pad} y={by + pad} width={Math.max(0, fillW)} height={bh - 2 * pad} rx={2} fill={color} opacity={0.85} />

      {/* Contour du corps */}
      <rect x={bx} y={by} width={bw} height={bh} rx={4} fill="none" stroke="#334155" strokeWidth={2} />

      {/* Tension au centre */}
      <text x={bx + bw / 2} y={by + bh / 2 + 6} textAnchor="middle" fontSize={20} fontWeight={700} fill="#0f172a">
        {voltage.toFixed(2)} V
      </text>
    </svg>
  );
}
