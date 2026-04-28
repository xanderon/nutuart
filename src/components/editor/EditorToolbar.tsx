"use client";

import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  FlipHorizontal2,
  FlipVertical2,
  Redo2,
  ScanSearch,
  Trash2,
  Undo2,
} from "lucide-react";

type EditorToolbarProps = {
  scaleLabel: string;
  canUndo: boolean;
  canRedo: boolean;
  hasSelection: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onFit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onFlipX: () => void;
  onFlipY: () => void;
};

function ToolbarIconButton({
  label,
  disabled,
  onClick,
  tone = "default",
  children,
}: {
  label: string;
  disabled?: boolean;
  onClick: () => void;
  tone?: "default" | "danger";
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={[
        "flex h-9 w-9 items-center justify-center rounded-full border bg-white/78 transition disabled:opacity-35",
        tone === "danger"
          ? "border-[color:color-mix(in_srgb,var(--editor-danger)_28%,white)] text-[var(--editor-danger)]"
          : "border-[var(--editor-line)] text-[var(--editor-ink)]",
      ].join(" ")}
    >
      {children}
    </button>
  );
}

export function EditorToolbar({
  scaleLabel,
  canUndo,
  canRedo,
  hasSelection,
  onUndo,
  onRedo,
  onFit,
  onDuplicate,
  onDelete,
  onFlipX,
  onFlipY,
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
          className="flex h-9 items-center gap-2 rounded-full border border-[var(--editor-line)] bg-white/78 px-3 text-sm font-medium text-[var(--editor-ink)]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.2} />
          Înapoi
        </button>

        <div className="flex items-center gap-1">
          <ToolbarIconButton label="Undo" onClick={onUndo} disabled={!canUndo}>
            <Undo2 className="h-4 w-4" strokeWidth={2.2} />
          </ToolbarIconButton>
          <ToolbarIconButton label="Redo" onClick={onRedo} disabled={!canRedo}>
            <Redo2 className="h-4 w-4" strokeWidth={2.2} />
          </ToolbarIconButton>
          <ToolbarIconButton
            label="Duplică elementul selectat"
            onClick={onDuplicate}
            disabled={!hasSelection}
          >
            <Copy className="h-4 w-4" strokeWidth={2.2} />
          </ToolbarIconButton>
          <ToolbarIconButton
            label="Oglindire orizontală"
            onClick={onFlipX}
            disabled={!hasSelection}
          >
            <FlipHorizontal2 className="h-4 w-4" strokeWidth={2.2} />
          </ToolbarIconButton>
          <ToolbarIconButton
            label="Oglindire verticală"
            onClick={onFlipY}
            disabled={!hasSelection}
          >
            <FlipVertical2 className="h-4 w-4" strokeWidth={2.2} />
          </ToolbarIconButton>
          <ToolbarIconButton
            label="Șterge elementul selectat"
            onClick={onDelete}
            disabled={!hasSelection}
            tone="danger"
          >
            <Trash2 className="h-4 w-4" strokeWidth={2.2} />
          </ToolbarIconButton>
          <button
            type="button"
            onClick={onFit}
            aria-label="Încadrează în ecran"
            title="Încadrează în ecran"
            className="flex h-9 items-center gap-1 rounded-full bg-[var(--editor-ink)] px-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-white"
          >
            <ScanSearch className="h-4 w-4" strokeWidth={2.2} />
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
