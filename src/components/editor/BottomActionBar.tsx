import { cn } from "@/lib/utils";
import type { EditorPanel } from "@/lib/editor/editorTypes";

const actions: Array<{
  id: Exclude<EditorPanel, null>;
  label: string;
}> = [
  { id: "library", label: "SVG" },
  { id: "shapeSize", label: "Suprafață" },
  { id: "element", label: "Editare" },
  { id: "export", label: "Export" },
];

type BottomActionBarProps = {
  activePanel: EditorPanel;
  hasSelection: boolean;
  onChange: (panel: EditorPanel) => void;
};

export function BottomActionBar({
  activePanel,
  hasSelection,
  onChange,
}: BottomActionBarProps) {
  return (
    <div className="editor-panel fixed inset-x-3 bottom-3 z-40 rounded-[1.4rem] border border-white/70 px-2 py-2 shadow-[0_22px_60px_-30px_rgba(0,0,0,0.45)] md:hidden">
      <div className="grid grid-cols-4 gap-2">
        {actions.map((action) => {
          const disabled = action.id === "element" && !hasSelection;
          const isActive = activePanel === action.id;

          return (
            <button
              key={action.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(isActive ? null : action.id)}
              className={cn(
                "rounded-[1rem] px-2 py-2.5 text-center text-[11px] font-semibold uppercase tracking-[0.12em] transition",
                isActive
                  ? "bg-[var(--editor-ink)] text-white"
                  : "bg-white/75 text-[var(--editor-muted)]",
                disabled && "opacity-45"
              )}
            >
              {action.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
