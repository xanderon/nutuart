"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type { CanvasStageHandle } from "./canvas/CanvasStage";
import { CanvasStage } from "./canvas/CanvasStage";
import { getAspectRatio } from "@/lib/editor/geometryUtils";
import type {
  EditorDocument,
  EditorElement,
  EditorViewport,
} from "@/lib/editor/editorTypes";
import {
  getEditorArtboardInsets,
  getFitArtboardSize,
} from "@/lib/editor/viewportUtils";

type EditorCanvasProps = {
  document: EditorDocument;
  selectedElementId: string | null;
  viewport: EditorViewport;
  onViewportChange: (viewport: EditorViewport) => void;
  onCanvasSizeChange?: (size: { width: number; height: number }) => void;
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
      onCanvasSizeChange,
      onSelectElement,
      onUpdateElement,
    },
    ref
  ) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [feedback, setFeedback] = useState<GestureFeedback | null>(null);
    const [showHint, setShowHint] = useState(true);
    const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

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

    useEffect(() => {
      if (!containerRef.current) {
        return;
      }

      const element = containerRef.current;
      const resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (!entry) {
          return;
        }

        setContainerSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      });

      resizeObserver.observe(element);
      return () => resizeObserver.disconnect();
    }, []);

    useEffect(() => {
      onCanvasSizeChange?.(containerSize);
    }, [containerSize, onCanvasSizeChange]);

    const aspectRatio = getAspectRatio(document.widthCm, document.heightCm);
    const fitInsets = useMemo(
      () => getEditorArtboardInsets(containerSize),
      [containerSize]
    );
    const fitArtboard = useMemo(
      () =>
        getFitArtboardSize(
          {
            width: containerSize.width,
            height: containerSize.height,
          },
          aspectRatio,
          fitInsets
        ),
      [aspectRatio, containerSize.height, containerSize.width, fitInsets]
    );
    const artboardFrame = useMemo(() => {
      const width = fitArtboard.width * viewport.scale;
      const height = fitArtboard.height * viewport.scale;
      const left = containerSize.width / 2 + viewport.offsetX - width / 2;
      const top = containerSize.height / 2 + viewport.offsetY - height / 2;

      return {
        left,
        top,
        width,
        height,
      };
    }, [
      containerSize.height,
      containerSize.width,
      fitArtboard.height,
      fitArtboard.width,
      viewport.offsetX,
      viewport.offsetY,
      viewport.scale,
    ]);

    return (
      <div
        ref={containerRef}
        data-editor-canvas="true"
        className="relative flex h-full min-h-0 flex-1 overflow-hidden bg-transparent"
      >
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

        {containerSize.width > 0 && containerSize.height > 0 ? (
          <div className="pointer-events-none absolute inset-0 z-20">
            <div
              className="absolute"
              style={{
                left: artboardFrame.left,
                top: Math.max(4, artboardFrame.top - 18),
                width: artboardFrame.width,
              }}
            >
              <div className="relative h-3.5">
                <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-[rgba(28,39,47,0.34)]" />
                <div className="absolute left-0 top-1/2 h-1.5 w-px -translate-y-1/2 bg-[rgba(28,39,47,0.34)]" />
                <div className="absolute right-0 top-1/2 h-1.5 w-px -translate-y-1/2 bg-[rgba(28,39,47,0.34)]" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/8 bg-[rgba(253,252,248,0.94)] px-1.5 py-0 text-[8px] font-semibold text-[var(--editor-ink)] shadow-sm">
                  {document.widthCm} cm
                </div>
              </div>
            </div>

            <div
              className="absolute"
              style={{
                left: Math.max(2, artboardFrame.left - 18),
                top: artboardFrame.top,
                height: artboardFrame.height,
              }}
            >
              <div className="relative h-full w-3">
                <div className="absolute left-1/2 top-0 h-px w-1.5 -translate-x-1/2 bg-[rgba(28,39,47,0.34)]" />
                <div className="absolute left-1/2 bottom-0 h-px w-1.5 -translate-x-1/2 bg-[rgba(28,39,47,0.34)]" />
                <div className="absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-[rgba(28,39,47,0.34)]" />
                <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 rounded-full border border-black/8 bg-[rgba(253,252,248,0.94)] px-1.5 py-0 text-[8px] font-semibold whitespace-nowrap text-[var(--editor-ink)] shadow-sm">
                  {document.heightCm} cm
                </div>
              </div>
            </div>
          </div>
        ) : null}

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
