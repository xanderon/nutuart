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

export type MobileQuickAction = {
  id: string;
  label: string;
  icon: ComponentType<{ className?: string; strokeWidth?: number }>;
  onClick: () => void;
  disabled?: boolean;
  tone?: "default" | "danger";
};

type BottomActionBarProps = {
  activePanel: EditorPanel;
  hasSelection: boolean;
  quickActions?: MobileQuickAction[];
  onChange: (panel: EditorPanel) => void;
};

export function BottomActionBar({
  activePanel,
  hasSelection,
  quickActions = [],
  onChange,
}: BottomActionBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-black/8 bg-[rgba(244,241,234,0.96)] px-1.5 py-1 pb-[calc(env(safe-area-inset-bottom)+0.35rem)] backdrop-blur-xl md:hidden">
      {quickActions.length ? (
        <div className="mb-1.5 flex gap-1 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.id}
                type="button"
                aria-label={action.label}
                title={action.label}
                disabled={action.disabled}
                onClick={action.onClick}
                className={cn(
                  "flex h-9 min-w-9 shrink-0 items-center justify-center rounded-[0.85rem] border bg-white/78 px-2 transition",
                  action.tone === "danger"
                    ? "border-[color:color-mix(in_srgb,var(--editor-danger)_28%,white)] text-[var(--editor-danger)]"
                    : "border-[var(--editor-line)] text-[var(--editor-ink)]",
                  action.disabled && "opacity-40"
                )}
              >
                <Icon className="h-4 w-4" strokeWidth={2.05} />
              </button>
            );
          })}
        </div>
      ) : null}

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
                "flex h-9 items-center justify-center rounded-[0.8rem] px-1 transition",
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
