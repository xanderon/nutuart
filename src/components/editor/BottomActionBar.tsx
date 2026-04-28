import { cn } from "@/lib/utils";
import type { EditorPanel } from "@/lib/editor/editorTypes";

const actions: Array<{
  id: Exclude<EditorPanel, null>;
  label: string;
}> = [
  { id: "library", label: "SVG" },
  { id: "shapeSize", label: "Formă" },
  { id: "element", label: "Edit" },
  { id: "export", label: "Save" },
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
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/8 bg-[rgba(244,241,234,0.96)] px-2 py-2 backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-4 gap-1.5">
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
                "rounded-[0.9rem] px-2 py-2 text-center text-[10px] font-semibold uppercase tracking-[0.12em] transition",
                isActive
                  ? "bg-[var(--editor-ink)] text-white"
                  : "bg-white/72 text-[var(--editor-muted)]",
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
