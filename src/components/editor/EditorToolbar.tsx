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
        "flex h-8 w-8 items-center justify-center rounded-full border bg-white/78 transition disabled:opacity-35 sm:h-9 sm:w-9",
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
    <header className="sticky top-0 z-30 border-b border-black/8 bg-[rgba(244,241,234,0.94)] px-2 py-1 backdrop-blur-xl sm:py-1.5">
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
          aria-label="Înapoi"
          title="Înapoi"
          className="flex h-8 items-center gap-1.5 rounded-full border border-[var(--editor-line)] bg-white/78 px-2.5 text-sm font-medium text-[var(--editor-ink)] sm:h-9 sm:gap-2 sm:px-3"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2.2} />
          <span className="hidden sm:inline">Înapoi</span>
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
            aria-label="Vezi pagina complet"
            title="Vezi pagina complet"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--editor-ink)] text-white sm:h-9 sm:w-auto sm:gap-1 sm:px-3"
          >
            <ScanSearch className="h-4 w-4" strokeWidth={2.2} />
            <span className="hidden text-[11px] font-semibold uppercase tracking-[0.12em] sm:inline">
              Pagină
            </span>
          </button>
          <div className="hidden rounded-full bg-black/5 px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--editor-muted)] sm:block">
            {scaleLabel}
          </div>
        </div>
      </div>
    </header>
  );
}
