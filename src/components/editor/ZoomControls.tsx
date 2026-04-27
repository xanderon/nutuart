type ZoomControlsProps = {
  scale: number;
  onZoomOut: () => void;
  onZoomIn: () => void;
  onFit: () => void;
  onReset: () => void;
};

export function ZoomControls({
  scale,
  onZoomOut,
  onZoomIn,
  onFit,
  onReset,
}: ZoomControlsProps) {
  return (
    <div className="flex flex-col items-end gap-2">
      <div className="editor-panel flex items-center gap-2 rounded-full border border-white/70 px-2 py-2 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.5)]">
        <button
          type="button"
          onClick={onFit}
          className="rounded-full bg-black/5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--editor-muted)]"
        >
          Fit
        </button>
        <button
          type="button"
          onClick={onReset}
          className="rounded-full bg-black/5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--editor-muted)]"
        >
          Reset
        </button>
      </div>
      <div className="editor-panel flex items-center gap-2 rounded-full border border-white/70 px-2 py-2 shadow-[0_18px_40px_-28px_rgba(0,0,0,0.5)]">
        <button
          type="button"
          onClick={onZoomOut}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/86 text-lg text-[var(--editor-ink)]"
          aria-label="Micșorează"
        >
          −
        </button>
        <div className="rounded-full bg-black/5 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--editor-muted)]">
          {Math.round(scale * 100)}%
        </div>
        <button
          type="button"
          onClick={onZoomIn}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/86 text-lg text-[var(--editor-ink)]"
          aria-label="Mărește"
        >
          +
        </button>
      </div>
    </div>
  );
}
