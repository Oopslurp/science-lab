interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  /** Affichage formaté de la valeur (sinon la valeur brute). */
  format?: (value: number) => string;
  unit?: string;
}

/** Slider réutilisable : libellé + valeur courante + piste native (mobile-friendly). */
export default function Slider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format,
  unit,
}: SliderProps) {
  const display = format ? format(value) : String(value);
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-medium text-slate-700">{label}</span>
        <span className="font-mono text-sm tabular-nums text-slate-900">
          {display}
          {unit ? <span className="ml-0.5 text-slate-400">{unit}</span> : null}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-accent"
      />
    </label>
  );
}
