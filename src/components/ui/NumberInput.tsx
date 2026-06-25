interface NumberInputProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  unit?: string;
}

/** Champ numérique réutilisable, pour les réglages nécessitant de la précision. */
export default function NumberInput({
  label,
  value,
  min,
  max,
  step,
  onChange,
  unit,
}: NumberInputProps) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      <span className="flex items-center gap-2">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full rounded-lg border border-slate-300 px-3 py-1.5 font-mono text-sm tabular-nums text-slate-900 shadow-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
        />
        {unit ? <span className="text-sm text-slate-400">{unit}</span> : null}
      </span>
    </label>
  );
}
