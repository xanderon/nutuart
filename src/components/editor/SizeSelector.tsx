"use client";

import { useState } from "react";
import type { EditorShape } from "@/lib/editor/editorTypes";
import {
  MAX_DIMENSION_CM,
  MIN_DIMENSION_CM,
} from "@/lib/editor/editorDefaults";
import { ShapeSelector } from "./ShapeSelector";

type SizeSelectorProps = {
  shape: EditorShape;
  widthCm: number;
  heightCm: number;
  onShapeChange: (value: EditorShape) => void;
  onWidthChange: (value: number) => void;
  onHeightChange: (value: number) => void;
  compact?: boolean;
};

type DimensionFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  compact?: boolean;
};

function getDimensionWarning(value: string) {
  if (!value.trim()) {
    return `Introdu o valoare între ${MIN_DIMENSION_CM} și ${MAX_DIMENSION_CM} cm.`;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed)) {
    return "Folosește doar cifre.";
  }

  if (parsed < MIN_DIMENSION_CM || parsed > MAX_DIMENSION_CM) {
    return `Acceptat: ${MIN_DIMENSION_CM}-${MAX_DIMENSION_CM} cm.`;
  }

  return null;
}

function DimensionField({
  label,
  value,
  onChange,
  compact = false,
}: DimensionFieldProps) {
  const [draft, setDraft] = useState("");
  const [warning, setWarning] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const inputValue = isEditing ? draft : String(value);

  const commitDraft = () => {
    const candidate = isEditing ? draft : String(value);
    const nextWarning = getDimensionWarning(candidate);
    setWarning(nextWarning);

    if (nextWarning) {
      return;
    }

    onChange(Number(candidate));
    setIsEditing(false);
  };

  const stepBy = (delta: number) => {
    const nextValue = Math.min(
      MAX_DIMENSION_CM,
      Math.max(MIN_DIMENSION_CM, value + delta)
    );
    setIsEditing(false);
    setDraft("");
    setWarning(null);
    onChange(nextValue);
  };

  return (
    <div className="space-y-2 rounded-[1rem] border border-[var(--editor-line)] bg-white/82 p-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--editor-muted)]">
            {label}
          </p>
          <div className="mt-1 text-xl font-semibold text-[var(--editor-ink)]">
            {value} <span className="text-sm font-medium text-[var(--editor-muted)]">cm</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => stepBy(-5)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--editor-line)] bg-white text-lg font-medium text-[var(--editor-ink)]"
            aria-label={`Micșorează ${label.toLowerCase()}`}
          >
            -
          </button>
          <button
            type="button"
            onClick={() => stepBy(5)}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--editor-line)] bg-white text-lg font-medium text-[var(--editor-ink)]"
            aria-label={`Mărește ${label.toLowerCase()}`}
          >
            +
          </button>
        </div>
      </div>

      <input
        type="range"
        min={MIN_DIMENSION_CM}
        max={MAX_DIMENSION_CM}
        step={1}
        value={value}
        onChange={(event) => {
          const nextValue = Number(event.target.value);
          setDraft(String(nextValue));
          setWarning(null);
          onChange(nextValue);
        }}
        className="w-full accent-[var(--editor-accent)]"
      />

      <div className={`grid gap-2 ${compact ? "grid-cols-[1fr]" : "grid-cols-[1fr_auto]"}`}>
        <input
          type="text"
          inputMode="numeric"
          value={inputValue}
          onFocus={() => {
            setIsEditing(true);
            setDraft(String(value));
          }}
          onChange={(event) => {
            if (!isEditing) {
              setIsEditing(true);
            }
            setDraft(event.target.value.replace(/[^\d]/g, ""));
            setWarning(null);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              commitDraft();
            }
          }}
          onBlur={() => {
            commitDraft();
          }}
          className="h-11 rounded-[0.9rem] border border-[var(--editor-line)] bg-white px-3 text-base text-[var(--editor-ink)] outline-none transition focus:border-[var(--editor-accent)]"
          aria-label={`${label} în centimetri`}
        />
        {!compact ? (
          <button
            type="button"
            onClick={commitDraft}
            className="rounded-[0.9rem] border border-[var(--editor-line)] bg-white px-4 text-sm font-semibold text-[var(--editor-ink)]"
          >
            Set
          </button>
        ) : null}
      </div>

      {warning ? (
        <p className="text-xs font-medium text-[var(--editor-danger)]">{warning}</p>
      ) : (
        <p className="text-[11px] text-[var(--editor-muted)]">
          Min {MIN_DIMENSION_CM} cm, max {MAX_DIMENSION_CM} cm.
        </p>
      )}
    </div>
  );
}

export function SizeSelector({
  shape,
  widthCm,
  heightCm,
  onShapeChange,
  onWidthChange,
  onHeightChange,
  compact = false,
}: SizeSelectorProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--editor-muted)]">
          Formă
        </p>
        <ShapeSelector value={shape} onChange={onShapeChange} compact={compact} />
      </div>

      <div className={`grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}>
        <DimensionField
          label="Lățime"
          value={widthCm}
          onChange={onWidthChange}
          compact={compact}
        />
        <DimensionField
          label="Înălțime"
          value={heightCm}
          onChange={onHeightChange}
          compact={compact}
        />
      </div>
    </div>
  );
}
