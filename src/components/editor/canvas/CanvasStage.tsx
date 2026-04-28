"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import Konva from "konva";
import { Group, Layer, Rect, Stage } from "react-konva";
import {
  clamp,
  getAspectRatio,
  getNormalizedPoint,
  isElementOutOfBounds,
} from "@/lib/editor/geometryUtils";
import type {
  EditorDocument,
  EditorElement,
  EditorViewport,
  Point,
  Size,
} from "@/lib/editor/editorTypes";
import {
  clampZoom,
  getFitArtboardSize,
  getStepZoom,
  getTouchCenter,
  getTouchDistance,
  zoomAroundPoint,
} from "@/lib/editor/viewportUtils";
import { ArtboardShape } from "./ArtboardShape";
import { SvgElement } from "./SvgElement";
import { TransformHandles } from "./TransformHandles";

export type CanvasStageHandle = {
  exportImage: () => string | null;
  zoomIn: () => void;
  zoomOut: () => void;
};

type CanvasStageProps = {
  document: EditorDocument;
  selectedElementId: string | null;
  viewport: EditorViewport;
  onViewportChange: (viewport: EditorViewport) => void;
  onSelectElement: (id: string | null) => void;
  onUpdateElement: (id: string, patch: Partial<EditorElement>) => void;
  onViewportGesture?: (label: string) => void;
};

export const CanvasStage = forwardRef<CanvasStageHandle, CanvasStageProps>(
  function CanvasStage(
    {
      document: designDocument,
      selectedElementId,
      viewport,
      onViewportChange,
      onSelectElement,
      onUpdateElement,
      onViewportGesture,
    },
    ref
  ) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const artboardGroupRef = useRef<Konva.Group>(null);
    const nodeMapRef = useRef<Record<string, Konva.Image | null>>({});
    const [containerSize, setContainerSize] = useState<Size>({ width: 0, height: 0 });
    const panStateRef = useRef<{ pointerId: number; startX: number; startY: number } | null>(
      null
    );
    const pinchStateRef = useRef<{
      distance: number;
      center: Point;
      viewport: EditorViewport;
    } | null>(null);

    useEffect(() => {
      if (!wrapperRef.current) {
        return;
      }

      const element = wrapperRef.current;
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

    const aspectRatio = getAspectRatio(
      designDocument.widthCm,
      designDocument.heightCm
    );
    const padding = containerSize.width >= 1024 ? 42 : containerSize.width >= 768 ? 32 : 20;
    const fitArtboard = useMemo(
      () =>
        getFitArtboardSize(
          {
            width: Math.max(containerSize.width, 320),
            height: Math.max(containerSize.height, 320),
          },
          aspectRatio,
          padding
        ),
      [aspectRatio, containerSize.height, containerSize.width, padding]
    );

    const selectedElement = useMemo(
      () =>
        selectedElementId
          ? designDocument.elements.find((item) => item.id === selectedElementId) ?? null
          : null,
      [designDocument.elements, selectedElementId]
    );

    const setZoomStep = useCallback(
      (delta: number) => {
        onViewportChange(
          getStepZoom(viewport, delta, {
            width: containerSize.width,
            height: containerSize.height,
          })
        );
      },
      [containerSize.height, containerSize.width, onViewportChange, viewport]
    );

    useImperativeHandle(
      ref,
      () => ({
        exportImage: () => {
          const artboardNode = artboardGroupRef.current;

          if (!artboardNode) {
            return null;
          }

          const maxEdge = Math.max(fitArtboard.width, fitArtboard.height);
          const scaleFactor = maxEdge > 0 ? 1800 / maxEdge : 2;
          const exportWidth = Math.max(600, Math.round(fitArtboard.width * scaleFactor));
          const exportHeight = Math.max(600, Math.round(fitArtboard.height * scaleFactor));
          const container = window.document.createElement("div");
          const tempStage = new Konva.Stage({
            container,
            width: exportWidth,
            height: exportHeight,
          });
          const tempLayer = new Konva.Layer();
          const clone = artboardNode.clone({
            x: exportWidth / 2,
            y: exportHeight / 2,
            scaleX: scaleFactor,
            scaleY: scaleFactor,
          });

          tempStage.add(tempLayer);
          tempLayer.add(clone);
          tempLayer.draw();

          const dataUrl = tempStage.toDataURL({ pixelRatio: 1 });
          tempStage.destroy();

          return dataUrl;
        },
        zoomIn: () => setZoomStep(0.2),
        zoomOut: () => setZoomStep(-0.2),
      }),
      [fitArtboard.height, fitArtboard.width, setZoomStep]
    );

    useEffect(() => {
      if (!selectedElementId) {
        return;
      }

      const selectedExists = designDocument.elements.some(
        (element) => element.id === selectedElementId
      );

      if (!selectedExists) {
        onSelectElement(null);
      }
    }, [designDocument.elements, onSelectElement, selectedElementId]);

    const isViewportTarget = (target: Konva.Node) =>
      target === target.getStage() ||
      target.attrs.name === "artboard-hit-area" ||
      target.attrs.name === "artboard-surface";

    const handleWheel = (event: Konva.KonvaEventObject<WheelEvent>) => {
      event.evt.preventDefault();

      if (!containerSize.width || !containerSize.height) {
        return;
      }

      const stage = stageRef.current;
      if (!stage) {
        return;
      }

      const pointer = stage.getPointerPosition();
      if (!pointer) {
        return;
      }

      const delta = event.evt.deltaY > 0 ? -0.15 : 0.15;
      const nextScale = clampZoom(viewport.scale + delta);
      onViewportChange(
        zoomAroundPoint(
          viewport,
          nextScale,
          pointer,
          containerSize
        )
      );
      onViewportGesture?.(`Zoom ${Math.round(nextScale * 100)}%`);
    };

    const handleTouchStart = (event: Konva.KonvaEventObject<TouchEvent>) => {
      const touches = event.evt.touches;

      if (touches.length === 2) {
        pinchStateRef.current = {
          distance: getTouchDistance(touches),
          center: getTouchCenter(touches),
          viewport,
        };
        panStateRef.current = null;
        return;
      }

      const targetIsStage = isViewportTarget(event.target);

      if (!targetIsStage || viewport.scale <= 1) {
        if (targetIsStage) {
          onSelectElement(null);
        }
        return;
      }

      onSelectElement(null);

      const touch = touches[0];
      panStateRef.current = {
        pointerId: touch.identifier,
        startX: touch.clientX - viewport.offsetX,
        startY: touch.clientY - viewport.offsetY,
      };
    };

    const handleTouchMove = (event: Konva.KonvaEventObject<TouchEvent>) => {
      const touches = event.evt.touches;

      if (touches.length === 2 && pinchStateRef.current && containerSize.width && containerSize.height) {
        event.evt.preventDefault();
        const distance = getTouchDistance(touches);
        const center = getTouchCenter(touches);
        const initialScale = pinchStateRef.current.viewport.scale;
        const nextScale =
          pinchStateRef.current.viewport.scale *
          (distance / Math.max(pinchStateRef.current.distance, 1));
        const nextViewport = zoomAroundPoint(
          pinchStateRef.current.viewport,
          nextScale,
          pinchStateRef.current.center,
          containerSize
        );
        const movedX = center.x - pinchStateRef.current.center.x;
        const movedY = center.y - pinchStateRef.current.center.y;

        onViewportChange(
          {
            ...nextViewport,
            offsetX: nextViewport.offsetX + movedX,
            offsetY: nextViewport.offsetY + movedY,
          }
        );

        if (Math.abs(nextScale - initialScale) > 0.02) {
          onViewportGesture?.(`Zoom ${Math.round(clampZoom(nextScale) * 100)}%`);
        } else if (Math.abs(movedX) > 3 || Math.abs(movedY) > 3) {
          onViewportGesture?.("Pan");
        }
        return;
      }

      if (!panStateRef.current || touches.length !== 1) {
        return;
      }

      event.evt.preventDefault();
      const touch = touches[0];
      onViewportChange({
        ...viewport,
        offsetX: touch.clientX - panStateRef.current.startX,
        offsetY: touch.clientY - panStateRef.current.startY,
      });
    };

    const handleTouchEnd = () => {
      if (pinchStateRef.current) {
        pinchStateRef.current = null;
      }

      if (panStateRef.current) {
        panStateRef.current = null;
      }
    };

    const handlePointerDown = (event: Konva.KonvaEventObject<PointerEvent>) => {
      const targetIsStage = isViewportTarget(event.target);

      if (!targetIsStage) {
        return;
      }

      onSelectElement(null);

      if (viewport.scale <= 1) {
        return;
      }

      panStateRef.current = {
        pointerId: event.evt.pointerId,
        startX: event.evt.clientX - viewport.offsetX,
        startY: event.evt.clientY - viewport.offsetY,
      };
    };

    const handlePointerMove = (event: Konva.KonvaEventObject<PointerEvent>) => {
      if (!panStateRef.current || panStateRef.current.pointerId !== event.evt.pointerId) {
        return;
      }

      onViewportChange({
        ...viewport,
        offsetX: event.evt.clientX - panStateRef.current.startX,
        offsetY: event.evt.clientY - panStateRef.current.startY,
      });
    };

    const handlePointerUp = () => {
      panStateRef.current = null;
    };

    const handleDragEnd = (id: string, x: number, y: number) => {
      const normalized = getNormalizedPoint(
        { x, y },
        fitArtboard,
        { x: -fitArtboard.width / 2, y: -fitArtboard.height / 2 }
      );

      onUpdateElement(id, normalized);
    };

    const handleTransformEnd = useCallback(() => {
      const selectedNode = selectedElementId
        ? nodeMapRef.current[selectedElementId]
        : null;

      if (!selectedElementId || !selectedNode) {
        return;
      }

      const scaleX = selectedNode.scaleX();
      const scaleY = selectedNode.scaleY();
      const flipX = scaleX < 0;
      const flipY = scaleY < 0;
      const widthPx = clamp(
        selectedNode.width() * Math.abs(scaleX),
        fitArtboard.width * 0.04,
        fitArtboard.width
      );
      const heightPx = clamp(
        selectedNode.height() * Math.abs(scaleY),
        fitArtboard.height * 0.04,
        fitArtboard.height
      );

      // Konva mutates node scale during transforms, so reset the transient scale
      // before syncing size back into controlled React state.
      selectedNode.scaleX(flipX ? -1 : 1);
      selectedNode.scaleY(flipY ? -1 : 1);
      selectedNode.width(widthPx);
      selectedNode.height(heightPx);

      const normalized = getNormalizedPoint(
        { x: selectedNode.x(), y: selectedNode.y() },
        fitArtboard,
        { x: -fitArtboard.width / 2, y: -fitArtboard.height / 2 }
      );

      onUpdateElement(selectedElementId, {
        ...normalized,
        width: widthPx / fitArtboard.width,
        height: heightPx / fitArtboard.height,
        rotation: selectedNode.rotation(),
        flipX,
        flipY,
      });
    }, [fitArtboard, onUpdateElement, selectedElementId]);

    const viewportCenter: Point = {
      x: containerSize.width / 2 + viewport.offsetX,
      y: containerSize.height / 2 + viewport.offsetY,
    };

    return (
      <div ref={wrapperRef} className="h-full min-h-[420px] w-full rounded-[2rem]">
        {containerSize.width > 0 && containerSize.height > 0 ? (
          <Stage
            ref={stageRef}
            width={containerSize.width}
            height={containerSize.height}
            className="touch-none"
            onWheel={handleWheel}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <Layer>
              <Rect
                x={0}
                y={0}
                width={containerSize.width}
                height={containerSize.height}
                fill="rgba(255,255,255,0.001)"
                name="artboard-hit-area"
              />

              <Group
                x={viewportCenter.x}
                y={viewportCenter.y}
                scaleX={viewport.scale}
                scaleY={viewport.scale}
              >
                <Group ref={artboardGroupRef}>
                  <ArtboardShape
                    shape={designDocument.shape}
                    width={fitArtboard.width}
                    height={fitArtboard.height}
                  />

                  <Group
                    clipFunc={(context) => {
                      context.beginPath();
                      const left = -fitArtboard.width / 2;
                      const top = -fitArtboard.height / 2;
                      if (designDocument.shape === "rectangle") {
                        context.roundRect(left, top, fitArtboard.width, fitArtboard.height, 28);
                        return;
                      }

                      if (designDocument.shape === "oval") {
                        context.ellipse(
                          0,
                          0,
                          fitArtboard.width / 2,
                          fitArtboard.height / 2,
                          0,
                          0,
                          Math.PI * 2
                        );
                        return;
                      }

                      const archHeight = Math.min(
                        fitArtboard.height * 0.36,
                        fitArtboard.width * 0.45
                      );
                      context.moveTo(left, top + fitArtboard.height);
                      context.lineTo(left, top + archHeight);
                      context.quadraticCurveTo(
                        0,
                        top - archHeight * 0.22,
                        left + fitArtboard.width,
                        top + archHeight
                      );
                      context.lineTo(
                        left + fitArtboard.width,
                        top + fitArtboard.height
                      );
                      context.closePath();
                    }}
                  >
                    {designDocument.elements.map((element) => (
                      <SvgElement
                        key={element.id}
                        element={element}
                        isSelected={selectedElementId === element.id}
                        artboardWidth={fitArtboard.width}
                        artboardHeight={fitArtboard.height}
                        registerNode={(id, node) => {
                          nodeMapRef.current[id] = node;
                        }}
                        onSelect={onSelectElement}
                        onDragEnd={handleDragEnd}
                      />
                    ))}
                  </Group>
                </Group>

                {selectedElementId ? (
                  <TransformHandles
                    selectedElementId={selectedElementId}
                    nodeMapRef={nodeMapRef}
                    artboardWidth={fitArtboard.width}
                    artboardHeight={fitArtboard.height}
                    onTransformEnd={handleTransformEnd}
                  />
                ) : null}

                {selectedElement && isElementOutOfBounds(selectedElement) ? (
                  <Rect
                    x={-fitArtboard.width / 2}
                    y={-fitArtboard.height / 2}
                    width={fitArtboard.width}
                    height={fitArtboard.height}
                    stroke="rgba(176, 70, 53, 0.75)"
                    strokeWidth={2}
                    cornerRadius={designDocument.shape === "rectangle" ? 28 : 0}
                    dash={[8, 8]}
                    listening={false}
                  />
                ) : null}
              </Group>
            </Layer>
          </Stage>
        ) : null}
      </div>
    );
  }
);
