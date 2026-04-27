import type { EditorShape } from "@/lib/editor/editorTypes";
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

      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--editor-muted)]">
            Lățime (cm)
          </span>
          <input
            type="number"
            inputMode="decimal"
            min={20}
            max={320}
            step={1}
            value={widthCm}
            onChange={(event) => onWidthChange(Number(event.target.value))}
            className="h-11 w-full rounded-[0.9rem] border border-[var(--editor-line)] bg-white/88 px-3 text-base text-[var(--editor-ink)] outline-none transition focus:border-[var(--editor-accent)]"
          />
        </label>
        <label className="space-y-2">
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--editor-muted)]">
            Înălțime (cm)
          </span>
          <input
            type="number"
            inputMode="decimal"
            min={20}
            max={320}
            step={1}
            value={heightCm}
            onChange={(event) => onHeightChange(Number(event.target.value))}
            className="h-11 w-full rounded-[0.9rem] border border-[var(--editor-line)] bg-white/88 px-3 text-base text-[var(--editor-ink)] outline-none transition focus:border-[var(--editor-accent)]"
          />
        </label>
      </div>
    </div>
  );
}
