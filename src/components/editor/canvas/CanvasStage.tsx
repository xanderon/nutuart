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
  getTouchAngle,
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

const ROTATION_UNLOCK_DEGREES = 12;
const SELECTED_GESTURE_PADDING = 44;

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
    const elementGestureRef = useRef<{
      id: string;
      node: Konva.Image;
      x: number;
      y: number;
      width: number;
      height: number;
      rotation: number;
      flipX: boolean;
      flipY: boolean;
      distance: number;
      center: Point;
      angle: number;
      viewportScale: number;
      rotateUnlocked: boolean;
    } | null>(null);
    const selectedTouchSeedRef = useRef(false);

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

    const getAngleDeltaDegrees = (currentAngle: number, baselineAngle: number) =>
      ((((currentAngle - baselineAngle) * 180) / Math.PI) + 540) % 360 - 180;

    const getElementBounds = useCallback(
      (node: Konva.Image) => {
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();

        return {
          flipX: scaleX < 0,
          flipY: scaleY < 0,
          widthPx: clamp(
            node.width() * Math.abs(scaleX),
            fitArtboard.width * 0.04,
            fitArtboard.width
          ),
          heightPx: clamp(
            node.height() * Math.abs(scaleY),
            fitArtboard.height * 0.04,
            fitArtboard.height
          ),
        };
      },
      [fitArtboard.height, fitArtboard.width]
    );

    const commitNodeTransform = useCallback(
      (id: string, node: Konva.Image) => {
        const { flipX, flipY, widthPx, heightPx } = getElementBounds(node);

        node.scaleX(flipX ? -1 : 1);
        node.scaleY(flipY ? -1 : 1);
        node.width(widthPx);
        node.height(heightPx);

        const normalized = getNormalizedPoint(
          { x: node.x(), y: node.y() },
          fitArtboard,
          { x: -fitArtboard.width / 2, y: -fitArtboard.height / 2 }
        );

        onUpdateElement(id, {
          ...normalized,
          width: widthPx / fitArtboard.width,
          height: heightPx / fitArtboard.height,
          rotation: node.rotation(),
          flipX,
          flipY,
        });
      },
      [fitArtboard, getElementBounds, onUpdateElement]
    );

    const isTouchWithinSelectedElement = useCallback(
      (touches: TouchList, padding = SELECTED_GESTURE_PADDING) => {
        const stage = stageRef.current;
        const selectedNode = selectedElementId
          ? nodeMapRef.current[selectedElementId]
          : null;

        if (!stage || !selectedNode) {
          return false;
        }

        const containerBounds = stage.container().getBoundingClientRect();
        const bounds = selectedNode.getClientRect({
          skipShadow: true,
          skipStroke: true,
        });

        return Array.from(touches)
          .slice(0, 2)
          .some((touch) => {
            const x = touch.clientX - containerBounds.left;
            const y = touch.clientY - containerBounds.top;

            return (
              x >= bounds.x - padding &&
              x <= bounds.x + bounds.width + padding &&
              y >= bounds.y - padding &&
              y <= bounds.y + bounds.height + padding
            );
          });
      },
      [selectedElementId]
    );

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
        const selectedNode = selectedElementId
          ? nodeMapRef.current[selectedElementId]
          : null;

        if (
          selectedElementId &&
          selectedNode &&
          (
            selectedTouchSeedRef.current ||
            isTouchWithinSelectedElement(touches, SELECTED_GESTURE_PADDING)
          )
        ) {
          event.evt.preventDefault();
          if (selectedNode.isDragging()) {
            selectedNode.stopDrag();
          }

          const { flipX, flipY, widthPx, heightPx } = getElementBounds(selectedNode);
          elementGestureRef.current = {
            id: selectedElementId,
            node: selectedNode,
            x: selectedNode.x(),
            y: selectedNode.y(),
            width: widthPx,
            height: heightPx,
            rotation: selectedNode.rotation(),
            flipX,
            flipY,
            distance: Math.max(getTouchDistance(touches), 1),
            center: getTouchCenter(touches),
            angle: getTouchAngle(touches),
            viewportScale: viewport.scale,
            rotateUnlocked: false,
          };
          pinchStateRef.current = null;
          panStateRef.current = null;
          return;
        }

        pinchStateRef.current = {
          distance: getTouchDistance(touches),
          center: getTouchCenter(touches),
          viewport,
        };
        elementGestureRef.current = null;
        panStateRef.current = null;
        return;
      }

      selectedTouchSeedRef.current = isTouchWithinSelectedElement(
        touches,
        SELECTED_GESTURE_PADDING
      );

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

      if (touches.length === 2 && elementGestureRef.current) {
        event.evt.preventDefault();
        const gesture = elementGestureRef.current;
        const distance = Math.max(getTouchDistance(touches), 1);
        const scale = distance / gesture.distance;
        const center = getTouchCenter(touches);
        const currentAngle = getTouchAngle(touches);
        const angleDelta = getAngleDeltaDegrees(currentAngle, gesture.angle);
        const nextX =
          gesture.x + (center.x - gesture.center.x) / Math.max(gesture.viewportScale, 1);
        const nextY =
          gesture.y + (center.y - gesture.center.y) / Math.max(gesture.viewportScale, 1);
        const nextWidth = clamp(
          gesture.width * scale,
          fitArtboard.width * 0.04,
          fitArtboard.width
        );
        const nextHeight = clamp(
          gesture.height * scale,
          fitArtboard.height * 0.04,
          fitArtboard.height
        );
        let nextRotation = gesture.rotation;

        if (gesture.rotateUnlocked) {
          nextRotation = gesture.rotation + angleDelta;
        } else if (Math.abs(angleDelta) >= ROTATION_UNLOCK_DEGREES) {
          gesture.rotateUnlocked = true;
          gesture.angle = currentAngle;
          gesture.rotation = gesture.node.rotation();
        }

        gesture.node.x(nextX);
        gesture.node.y(nextY);
        gesture.node.width(nextWidth);
        gesture.node.height(nextHeight);
        gesture.node.rotation(nextRotation);
        gesture.node.scaleX(gesture.flipX ? -1 : 1);
        gesture.node.scaleY(gesture.flipY ? -1 : 1);
        gesture.node.getLayer()?.batchDraw();
        return;
      }

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

    const handleTouchEnd = (event: Konva.KonvaEventObject<TouchEvent>) => {
      if (elementGestureRef.current && event.evt.touches.length < 2) {
        const { id, node } = elementGestureRef.current;
        commitNodeTransform(id, node);
        elementGestureRef.current = null;
      }

      if (event.evt.touches.length === 0) {
        selectedTouchSeedRef.current = false;
      }

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
        commitNodeTransform(selectedElementId, selectedNode);
    }, [commitNodeTransform, selectedElementId]);

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
