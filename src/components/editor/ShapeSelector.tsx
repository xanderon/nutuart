import { shapeOptions } from "@/lib/editor/editorDefaults";
import { cn } from "@/lib/utils";
import type { EditorShape } from "@/lib/editor/editorTypes";

type ShapeSelectorProps = {
  value: EditorShape;
  onChange: (shape: EditorShape) => void;
  compact?: boolean;
};

function ShapePreview({ shape }: { shape: EditorShape }) {
  if (shape === "rectangle") {
    return <div className="h-12 w-16 rounded-md border border-black/18 bg-white/85" />;
  }

  if (shape === "oval") {
    return <div className="h-10 w-[4.4rem] rounded-[999px] border border-black/18 bg-white/85" />;
  }

  return (
    <div className="relative h-12 w-16 overflow-hidden">
      <div className="absolute inset-x-0 bottom-0 h-8 border border-black/18 border-t-0 bg-white/85" />
      <div className="absolute inset-x-0 top-0 h-8 rounded-t-[999px] border border-black/18 border-b-0 bg-white/85" />
    </div>
  );
}

export function ShapeSelector({
  value,
  onChange,
  compact = false,
}: ShapeSelectorProps) {
  return (
    <div className={cn("grid gap-2.5", compact ? "grid-cols-3" : "grid-cols-1 sm:grid-cols-3")}>
      {shapeOptions.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-[1rem] border p-2.5 text-left transition duration-150",
              isActive
                ? "border-[var(--editor-accent)] bg-[var(--editor-accent-soft)] shadow-[0_12px_40px_-28px_rgba(13,107,114,0.8)]"
                : "border-[var(--editor-line)] bg-white/66 hover:border-[var(--editor-line-strong)]"
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <ShapePreview shape={option.value} />
              {!compact ? (
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--editor-ink)]">{option.label}</p>
                  <p className="mt-0.5 text-[11px] leading-relaxed text-[var(--editor-muted)]">
                    {option.description}
                  </p>
                </div>
              ) : (
                <span className="text-xs font-semibold text-[var(--editor-ink)]">
                  {option.label}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
