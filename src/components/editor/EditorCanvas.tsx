"use client";

import { forwardRef, useEffect, useState } from "react";
import type { CanvasStageHandle } from "./canvas/CanvasStage";
import { CanvasStage } from "./canvas/CanvasStage";
import type {
  EditorDocument,
  EditorElement,
  EditorViewport,
} from "@/lib/editor/editorTypes";

type EditorCanvasProps = {
  document: EditorDocument;
  selectedElementId: string | null;
  viewport: EditorViewport;
  onViewportChange: (viewport: EditorViewport) => void;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, patch: Partial<EditorElement>) => void;
};

type GestureFeedback = {
  id: number;
  label: string;
};

export const EditorCanvas = forwardRef<CanvasStageHandle, EditorCanvasProps>(
  function EditorCanvas(
    {
      document,
      selectedElementId,
      viewport,
      onViewportChange,
      onSelectElement,
      onUpdateElement,
    },
    ref
  ) {
    const [feedback, setFeedback] = useState<GestureFeedback | null>(null);
    const [showHint, setShowHint] = useState(true);

    useEffect(() => {
      const timeoutId = window.setTimeout(() => setShowHint(false), 2200);
      return () => window.clearTimeout(timeoutId);
    }, []);

    useEffect(() => {
      if (!feedback) {
        return;
      }

      const timeoutId = window.setTimeout(() => setFeedback(null), 700);
      return () => window.clearTimeout(timeoutId);
    }, [feedback]);

    return (
      <div className="relative flex min-h-[58dvh] flex-1 overflow-hidden bg-[linear-gradient(180deg,rgba(255,255,255,0.38),rgba(255,255,255,0.08))] sm:min-h-[50dvh] lg:min-h-0">
        <div className="editor-grid-bg absolute inset-0 opacity-70" />
        <div className="relative z-10 h-full w-full">
          <CanvasStage
            ref={ref}
            document={document}
            selectedElementId={selectedElementId}
            viewport={viewport}
            onViewportChange={onViewportChange}
            onSelectElement={onSelectElement}
            onUpdateElement={onUpdateElement}
            onViewportGesture={(label) =>
              setFeedback({
                id: Date.now(),
                label,
              })
            }
          />
        </div>

        <div className="pointer-events-none absolute bottom-2 left-1/2 z-20 -translate-x-1/2">
          {feedback ? (
            <div className="editor-panel rounded-full border border-white/70 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--editor-accent)] shadow-[0_18px_40px_-28px_rgba(0,0,0,0.45)]">
              {feedback.label}
            </div>
          ) : showHint ? (
            <div className="editor-panel rounded-full border border-white/70 px-3 py-2 text-[11px] font-semibold text-[var(--editor-muted)] shadow-[0_18px_40px_-28px_rgba(0,0,0,0.45)]">
              1 deget: element • 2 degete: scenă
            </div>
          ) : null}
        </div>
      </div>
    );
  }
);
