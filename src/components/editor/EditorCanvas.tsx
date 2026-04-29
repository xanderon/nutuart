"use client";

import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import type { CanvasStageHandle } from "./canvas/CanvasStage";
import { CanvasStage } from "./canvas/CanvasStage";
import { defaultViewport } from "@/lib/editor/editorDefaults";
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
    const previousContainerSizeRef = useRef({ width: 0, height: 0 });

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

    useEffect(() => {
      const previousContainer = previousContainerSizeRef.current;

      if (!containerSize.width || !containerSize.height) {
        return;
      }

      previousContainerSizeRef.current = containerSize;

      if (!previousContainer.width || !previousContainer.height) {
        return;
      }

      const resized =
        Math.abs(previousContainer.width - containerSize.width) > 2 ||
        Math.abs(previousContainer.height - containerSize.height) > 2;

      if (!resized || viewport.scale > 1.08) {
        return;
      }

      const horizontalOverflow =
        artboardFrame.left < 6 ||
        artboardFrame.left + artboardFrame.width > containerSize.width - 6;
      const verticalOverflow =
        artboardFrame.top < 6 ||
        artboardFrame.top + artboardFrame.height > containerSize.height - 6;
      const isNearDefaultOffset =
        Math.abs(viewport.offsetX) < 20 && Math.abs(viewport.offsetY) < 20;

      if ((horizontalOverflow || verticalOverflow || isNearDefaultOffset) &&
          (viewport.scale !== defaultViewport.scale ||
            viewport.offsetX !== defaultViewport.offsetX ||
            viewport.offsetY !== defaultViewport.offsetY)) {
        onViewportChange(defaultViewport);
      }
    }, [
      artboardFrame.height,
      artboardFrame.left,
      artboardFrame.top,
      artboardFrame.width,
      containerSize,
      onViewportChange,
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
                left: artboardFrame.left + artboardFrame.width / 2,
                top: artboardFrame.top + 5,
              }}
            >
              <div className="absolute -translate-x-1/2 rounded-full border border-black/6 bg-[rgba(253,252,248,0.76)] px-1.5 py-0.5 text-[7px] font-medium leading-none whitespace-nowrap text-[rgba(24,23,18,0.7)] shadow-[0_6px_14px_-12px_rgba(0,0,0,0.4)] sm:text-[8px]">
                <span className="inline-flex items-center gap-0.5 whitespace-nowrap">
                  <span>{document.widthCm}</span>
                  <span>cm</span>
                </span>
              </div>
            </div>

            <div
              className="absolute"
              style={{
                left: artboardFrame.left + 6,
                top: artboardFrame.top + artboardFrame.height / 2,
              }}
            >
              <div className="absolute -translate-x-1/2 -translate-y-1/2 -rotate-90 rounded-full border border-black/6 bg-[rgba(253,252,248,0.76)] px-1.5 py-0.5 text-[7px] font-medium leading-none whitespace-nowrap text-[rgba(24,23,18,0.7)] shadow-[0_6px_14px_-12px_rgba(0,0,0,0.4)] sm:text-[8px]">
                <span className="inline-flex items-center gap-0.5 whitespace-nowrap">
                  <span>{document.heightCm}</span>
                  <span>cm</span>
                </span>
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
