"use client";

import { useState } from "react";
import { ArrowLeftRight, ArrowUpDown } from "lucide-react";
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
  dense?: boolean;
};

type DimensionFieldProps = {
  label: string;
  value: number;
  onChange: (value: number) => void;
  compact?: boolean;
  dense?: boolean;
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
  dense = false,
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

  const Icon = label === "Lățime" ? ArrowLeftRight : ArrowUpDown;
  const concise = compact || dense;

  return (
    <div
      className={[
        "rounded-[1rem] border border-[var(--editor-line)] bg-white/82",
        concise ? "space-y-1 p-2" : "space-y-2 p-3",
      ].join(" ")}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-black/5 text-[var(--editor-muted)]">
            <Icon className="h-3 w-3" strokeWidth={2.2} />
          </div>
          <div>
            <p className={concise ? "text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--editor-muted)]" : "text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--editor-muted)]"}>
              {label}
            </p>
            <div className={concise ? "mt-0.5 text-base font-semibold text-[var(--editor-ink)]" : "mt-1 text-xl font-semibold text-[var(--editor-ink)]"}>
              {value} <span className={concise ? "text-[10px] font-medium text-[var(--editor-muted)]" : "text-sm font-medium text-[var(--editor-muted)]"}>cm</span>
            </div>
          </div>
        </div>

        <div className={concise ? "flex items-center gap-1.5" : "flex items-center gap-2"}>
          <button
            type="button"
            onClick={() => stepBy(-5)}
            className={concise
              ? "flex h-7 w-7 items-center justify-center rounded-full border border-[var(--editor-line)] bg-white text-sm font-medium text-[var(--editor-ink)]"
              : "flex h-10 w-10 items-center justify-center rounded-full border border-[var(--editor-line)] bg-white text-lg font-medium text-[var(--editor-ink)]"}
            aria-label={`Micșorează ${label.toLowerCase()}`}
          >
            -
          </button>
          <button
            type="button"
            onClick={() => stepBy(5)}
            className={concise
              ? "flex h-7 w-7 items-center justify-center rounded-full border border-[var(--editor-line)] bg-white text-sm font-medium text-[var(--editor-ink)]"
              : "flex h-10 w-10 items-center justify-center rounded-full border border-[var(--editor-line)] bg-white text-lg font-medium text-[var(--editor-ink)]"}
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
        className={concise ? "w-full accent-[var(--editor-accent)] [&::-webkit-slider-thumb]:h-3" : "w-full accent-[var(--editor-accent)]"}
      />

      <div className={`grid gap-2 ${concise ? "grid-cols-[1fr]" : "grid-cols-[1fr_auto]"}`}>
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
          className={concise
            ? "h-8 rounded-[0.8rem] border border-[var(--editor-line)] bg-white px-2.5 text-sm text-[var(--editor-ink)] outline-none transition focus:border-[var(--editor-accent)]"
            : "h-11 rounded-[0.9rem] border border-[var(--editor-line)] bg-white px-3 text-base text-[var(--editor-ink)] outline-none transition focus:border-[var(--editor-accent)]"}
          aria-label={`${label} în centimetri`}
        />
        {!concise ? (
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
        <p className={concise ? "text-[9px] text-[var(--editor-muted)]" : "text-[11px] text-[var(--editor-muted)]"}>
          {concise
            ? `${MIN_DIMENSION_CM}-${MAX_DIMENSION_CM} cm`
            : `Min ${MIN_DIMENSION_CM} cm, max ${MAX_DIMENSION_CM} cm.`}
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
  dense = false,
}: SizeSelectorProps) {
  const concise = compact || dense;

  return (
    <div className={concise ? "space-y-3" : "space-y-4"}>
      <div className={concise ? "space-y-2" : "space-y-3"}>
        <p className={concise ? "text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--editor-muted)]" : "text-xs font-semibold uppercase tracking-[0.22em] text-[var(--editor-muted)]"}>
          Formă
        </p>
        <ShapeSelector
          value={shape}
          onChange={onShapeChange}
          compact={compact}
          dense={dense}
        />
      </div>

      <div
        className={`grid gap-2.5 ${
          compact ? "grid-cols-2" : dense ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
        }`}
      >
        <DimensionField
          label="Lățime"
          value={widthCm}
          onChange={onWidthChange}
          compact={compact}
          dense={dense}
        />
        <DimensionField
          label="Înălțime"
          value={heightCm}
          onChange={onHeightChange}
          compact={compact}
          dense={dense}
        />
      </div>
    </div>
  );
}
