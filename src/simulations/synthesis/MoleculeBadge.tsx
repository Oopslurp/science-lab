import { useEffect, useState } from 'react';

interface MoleculeBadgeProps {
  hereLabel: string;
  name: string;
  formula: string;
}

/**
 * Badge « tu es ici » : le nom + la formule passent en fondu (fade-out → bascule →
 * fade-in) à chaque changement de groupe, avec une légère pulsation. CSS pur (transitions
 * d'opacité et de scale), aucune dépendance ni keyframe ajoutée.
 */
export default function MoleculeBadge({ hereLabel, name, formula }: MoleculeBadgeProps) {
  const [shown, setShown] = useState({ name, formula });
  const [opacity, setOpacity] = useState(1);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    if (formula === shown.formula && name === shown.name) return;
    setOpacity(0); // fond la molécule actuelle
    setPulse(true);
    const swap = window.setTimeout(() => {
      setShown({ name, formula }); // bascule le texte invisible
      setOpacity(1); // ré-apparition de la nouvelle
    }, 160);
    const endPulse = window.setTimeout(() => setPulse(false), 260);
    return () => {
      window.clearTimeout(swap);
      window.clearTimeout(endPulse);
    };
  }, [name, formula, shown.formula, shown.name]);

  return (
    <div
      className={
        'rounded-xl border border-accent/30 bg-accent/5 p-4 transition-transform duration-200 ' +
        (pulse ? 'scale-[1.03]' : 'scale-100')
      }
    >
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{hereLabel}</p>
      <div className="transition-opacity duration-200" style={{ opacity }}>
        <p className="mt-1 text-lg font-bold text-slate-900">{shown.name}</p>
        <p className="font-mono text-base text-accent">{shown.formula}</p>
      </div>
    </div>
  );
}
