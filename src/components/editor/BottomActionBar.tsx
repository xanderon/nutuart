import type { ComponentType } from "react";
import {
  Download,
  File,
  Flower2,
  SlidersHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { EditorPanel } from "@/lib/editor/editorTypes";

const actions: Array<{
  id: Exclude<EditorPanel, null>;
  label: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
}> = [
  { id: "library", label: "Desene", icon: Flower2 },
  { id: "shapeSize", label: "Pagină", icon: File },
  { id: "element", label: "Edit", icon: SlidersHorizontal },
  { id: "export", label: "Save", icon: Download },
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
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/8 bg-[rgba(244,241,234,0.96)] px-1.5 py-1.5 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] backdrop-blur-xl md:hidden">
      <div className="grid grid-cols-4 gap-1">
        {actions.map((action) => {
          const Icon = action.icon;
          const disabled = action.id === "element" && !hasSelection;
          const isActive = activePanel === action.id;

          return (
            <button
              key={action.id}
              type="button"
              disabled={disabled}
              aria-label={action.label}
              title={action.label}
              onClick={() => onChange(isActive ? null : action.id)}
              className={cn(
                "flex h-10 items-center justify-center rounded-[0.8rem] px-1 transition",
                isActive
                  ? "bg-[var(--editor-ink)] text-white"
                  : "bg-white/72 text-[var(--editor-muted)]",
                disabled && "opacity-45"
              )}
            >
              <Icon className="h-4 w-4 shrink-0" strokeWidth={2.1} />
            </button>
          );
        })}
      </div>
    </div>
  );
}
