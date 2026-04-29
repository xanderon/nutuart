import { shapeOptions } from "@/lib/editor/editorDefaults";
import { cn } from "@/lib/utils";
import type { EditorShape } from "@/lib/editor/editorTypes";

type ShapeSelectorProps = {
  value: EditorShape;
  onChange: (shape: EditorShape) => void;
  compact?: boolean;
  dense?: boolean;
};

function ShapePreview({ shape }: { shape: EditorShape }) {
  if (shape === "rectangle") {
    return <div className="h-8 w-11 rounded-[0.45rem] border border-black/18 bg-white/90" />;
  }

  if (shape === "oval") {
    return <div className="h-7 w-11 rounded-[999px] border border-black/18 bg-white/90" />;
  }

  return (
    <div className="relative h-8 w-11 overflow-hidden rounded-b-[0.35rem]">
      <div className="absolute inset-x-0 bottom-0 h-[58%] border border-black/18 border-t-0 bg-white/90" />
      <div className="absolute inset-x-0 top-0 h-[58%] rounded-t-[999px] border border-black/18 border-b-0 bg-white/90" />
    </div>
  );
}

function getCompactLabel(shape: EditorShape) {
  if (shape === "rectangle") {
    return "Rect";
  }

  if (shape === "oval") {
    return "Oval";
  }

  return "Arc";
}

export function ShapeSelector({
  value,
  onChange,
  compact = false,
  dense = false,
}: ShapeSelectorProps) {
  const concise = compact || dense;

  return (
    <div className={cn("grid gap-2", concise ? "grid-cols-3" : "grid-cols-1 sm:grid-cols-3")}>
      {shapeOptions.map((option) => {
        const isActive = option.value === value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-[0.95rem] border text-left transition duration-150",
              isActive
                ? "border-[var(--editor-accent)] bg-[var(--editor-accent-soft)] shadow-[0_12px_40px_-28px_rgba(13,107,114,0.8)]"
                : "border-[var(--editor-line)] bg-white/66 hover:border-[var(--editor-line-strong)]"
            )}
          >
            <div
              className={cn(
                "flex items-center gap-2.5",
                concise ? "justify-center px-1 py-2.5 text-center" : "justify-between p-2.5"
              )}
            >
              <ShapePreview shape={option.value} />
              {!concise ? (
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[var(--editor-ink)]">{option.label}</p>
                  <p className="mt-0.5 text-[10px] leading-relaxed text-[var(--editor-muted)]">
                    {option.description}
                  </p>
                </div>
              ) : (
                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--editor-ink)]">
                  {getCompactLabel(option.value)}
                </span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
