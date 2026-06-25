interface PlaybackControlsProps {
  playing: boolean;
  onToggle: () => void;
  onReset: () => void;
  labels: { play: string; pause: string; reset: string };
}

/** Boutons Lecture/Pause + Réinitialiser, partagés par les simulations animées. */
export default function PlaybackControls({
  playing,
  onToggle,
  onReset,
  labels,
}: PlaybackControlsProps) {
  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onToggle}
        className="flex-1 rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700"
      >
        {playing ? labels.pause : labels.play}
      </button>
      <button
        type="button"
        onClick={onReset}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
      >
        {labels.reset}
      </button>
    </div>
  );
}
