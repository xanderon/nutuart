import {
  AlignCenterHorizontal,
  AlignCenterVertical,
  AlignEndHorizontal,
  AlignEndVertical,
  AlignStartHorizontal,
  AlignStartVertical,
} from "lucide-react";
import { editorAssetMap } from "@/lib/editor/editorAssets";
import { isElementOutOfBounds } from "@/lib/editor/geometryUtils";
import type { EditorElement, EditorShape } from "@/lib/editor/editorTypes";

type AlignmentAction =
  | "top"
  | "left"
  | "centerX"
  | "right"
  | "middle"
  | "bottom";

type ElementControlsProps = {
  element: EditorElement | null;
  selectedCount?: number;
  shape: EditorShape;
  aspectRatio: number;
  onRotate: (rotation: number) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onFlipX: () => void;
  onFlipY: () => void;
  onAlign: (alignment: AlignmentAction) => void;
};

const alignmentActions: Array<{
  id: AlignmentAction;
  label: string;
  Icon: typeof AlignStartVertical;
}> = [
  { id: "left", label: "Align left", Icon: AlignStartVertical },
  { id: "centerX", label: "Align center", Icon: AlignCenterVertical },
  { id: "right", label: "Align right", Icon: AlignEndVertical },
  { id: "top", label: "Align top", Icon: AlignStartHorizontal },
  { id: "middle", label: "Align middle", Icon: AlignCenterHorizontal },
  { id: "bottom", label: "Align bottom", Icon: AlignEndHorizontal },
];

export function ElementControls({
  element,
  selectedCount = 0,
  shape,
  aspectRatio,
  onRotate,
  onDuplicate,
  onDelete,
  onFlipX,
  onFlipY,
  onAlign,
}: ElementControlsProps) {
  if (selectedCount > 1) {
    return (
      <div className="space-y-4">
        <div className="rounded-[1.1rem] border border-[var(--editor-line)] bg-white/78 p-3">
          <p className="text-sm font-semibold text-[var(--editor-ink)]">
            {selectedCount} elemente selectate
          </p>
          <p className="mt-1 text-sm text-[var(--editor-muted)]">
            Acțiunile de mai jos se aplică întregului grup.
          </p>
        </div>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--editor-muted)]">
            Align
          </p>
          <div className="grid grid-cols-6 gap-2">
            {alignmentActions.map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                aria-label={label}
                title={label}
                onClick={() => onAlign(id)}
                className="flex h-11 items-center justify-center rounded-[0.95rem] border border-[var(--editor-line)] bg-white/88 text-[var(--editor-ink)] transition hover:border-[var(--editor-line-strong)]"
              >
                <Icon size={18} strokeWidth={1.8} />
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={onDuplicate}
            className="rounded-[0.95rem] border border-[var(--editor-line)] bg-white/88 px-4 py-2.5 text-sm font-medium text-[var(--editor-ink)] transition hover:border-[var(--editor-line-strong)]"
          >
            Duplică
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="rounded-[0.95rem] border border-[color:color-mix(in_srgb,var(--editor-danger)_35%,white)] bg-[color:color-mix(in_srgb,var(--editor-danger)_6%,white)] px-4 py-2.5 text-sm font-medium text-[var(--editor-danger)] transition"
          >
            Șterge
          </button>
          <button
            type="button"
            onClick={onFlipX}
            className="rounded-[0.95rem] border border-[var(--editor-line)] bg-white/88 px-4 py-2.5 text-sm font-medium text-[var(--editor-ink)] transition hover:border-[var(--editor-line-strong)]"
          >
            Oglindire orizontală
          </button>
          <button
            type="button"
            onClick={onFlipY}
            className="rounded-[0.95rem] border border-[var(--editor-line)] bg-white/88 px-4 py-2.5 text-sm font-medium text-[var(--editor-ink)] transition hover:border-[var(--editor-line-strong)]"
          >
            Oglindire verticală
          </button>
        </div>
      </div>
    );
  }

  if (!element) {
    return (
      <div className="rounded-[1.1rem] border border-dashed border-[var(--editor-line)] bg-white/55 p-3 text-sm text-[var(--editor-muted)]">
        Selectează un element.
      </div>
    );
  }

  const asset = editorAssetMap[element.assetId];
  const outOfBounds = isElementOutOfBounds(element, shape, aspectRatio);

  return (
    <div className="space-y-4">
      <div className="rounded-[1.1rem] border border-[var(--editor-line)] bg-white/78 p-3">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-[var(--editor-ink)]">
              {asset?.name ?? "Element selectat"}
            </p>
          </div>
          {outOfBounds ? (
            <span className="rounded-full bg-[color:color-mix(in_srgb,var(--editor-danger)_12%,white)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-[var(--editor-danger)]">
              În afara formei
            </span>
          ) : null}
        </div>
      </div>

      <label className="space-y-2">
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-[var(--editor-muted)]">
          Rotire
        </span>
        <input
          type="range"
          min={-180}
          max={180}
          step={1}
          value={element.rotation}
          onChange={(event) => onRotate(Number(event.target.value))}
          className="w-full accent-[var(--editor-accent)]"
        />
        <div className="flex justify-between text-xs text-[var(--editor-muted)]">
          <span>-180°</span>
          <span>{Math.round(element.rotation)}°</span>
          <span>180°</span>
        </div>
      </label>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onDuplicate}
          className="rounded-[0.95rem] border border-[var(--editor-line)] bg-white/88 px-4 py-2.5 text-sm font-medium text-[var(--editor-ink)] transition hover:border-[var(--editor-line-strong)]"
        >
          Duplică
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="rounded-[0.95rem] border border-[color:color-mix(in_srgb,var(--editor-danger)_35%,white)] bg-[color:color-mix(in_srgb,var(--editor-danger)_6%,white)] px-4 py-2.5 text-sm font-medium text-[var(--editor-danger)] transition"
        >
          Șterge
        </button>
        <button
          type="button"
          onClick={onFlipX}
          className="rounded-[0.95rem] border border-[var(--editor-line)] bg-white/88 px-4 py-2.5 text-sm font-medium text-[var(--editor-ink)] transition hover:border-[var(--editor-line-strong)]"
        >
          Oglindire orizontală
        </button>
        <button
          type="button"
          onClick={onFlipY}
          className="rounded-[0.95rem] border border-[var(--editor-line)] bg-white/88 px-4 py-2.5 text-sm font-medium text-[var(--editor-ink)] transition hover:border-[var(--editor-line-strong)]"
        >
          Oglindire verticală
        </button>
      </div>
    </div>
  );
}
