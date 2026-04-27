"use client";

import { useRouter } from "next/navigation";

type EditorToolbarProps = {
  scaleLabel: string;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onFit: () => void;
};

export function EditorToolbar({
  scaleLabel,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onFit,
}: EditorToolbarProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-30 border-b border-black/8 bg-[rgba(244,241,234,0.94)] px-2 py-2 backdrop-blur-xl">
      <div className="mx-auto flex max-w-[1460px] items-center justify-between gap-2">
        <button
          type="button"
          onClick={() => {
            if (window.history.length > 1) {
              router.back();
              return;
            }

            router.push("/");
          }}
          className="rounded-full border border-[var(--editor-line)] bg-white/78 px-3 py-2 text-sm font-medium text-[var(--editor-ink)]"
        >
          Înapoi
        </button>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={onUndo}
            disabled={!canUndo}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--editor-line)] bg-white/78 text-lg text-[var(--editor-ink)] disabled:opacity-35"
            aria-label="Undo"
          >
            ↶
          </button>
          <button
            type="button"
            onClick={onRedo}
            disabled={!canRedo}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--editor-line)] bg-white/78 text-lg text-[var(--editor-ink)] disabled:opacity-35"
            aria-label="Redo"
          >
            ↷
          </button>
          <button
            type="button"
            onClick={onFit}
            className="rounded-full bg-[var(--editor-ink)] px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-white"
          >
            Fit
          </button>
          <div className="hidden rounded-full bg-black/5 px-2.5 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--editor-muted)] sm:block">
            {scaleLabel}
          </div>
        </div>
      </div>
    </header>
  );
}
