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
  roundTo,
  ELEMENT_POSITION_MAX,
  ELEMENT_POSITION_MIN,
  getAspectRatio,
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
  getEditorArtboardInsets,
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
const SELECTION_HANDLE_PADDING = 24;

type CanvasStageProps = {
  document: EditorDocument;
  selectedElementId: string | null;
  selectedElementIds: string[];
  viewport: EditorViewport;
  onViewportChange: (viewport: EditorViewport) => void;
  onSelectElement: (id: string | null) => void;
  onAddElementToSelection: (id: string) => void;
  onClearSelection: () => void;
  onUpdateElement: (id: string, patch: Partial<EditorElement>) => void;
  onUpdateElements: (
    updates: Array<{
      id: string;
      patch: Partial<EditorElement>;
    }>
  ) => void;
  onViewportGesture?: (label: string) => void;
};

export const CanvasStage = forwardRef<CanvasStageHandle, CanvasStageProps>(
  function CanvasStage(
    {
      document: designDocument,
      selectedElementId,
      selectedElementIds,
      viewport,
      onViewportChange,
      onSelectElement,
      onAddElementToSelection,
      onClearSelection,
      onUpdateElement,
      onUpdateElements,
      onViewportGesture,
    },
    ref
  ) {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const stageRef = useRef<Konva.Stage>(null);
    const artboardGroupRef = useRef<Konva.Group>(null);
    const nodeMapRef = useRef<Record<string, Konva.Image | null>>({});
    const [containerSize, setContainerSize] = useState<Size>({ width: 0, height: 0 });
    const [transientElements, setTransientElements] = useState<
      Record<string, Partial<EditorElement>>
    >({});
    const panStateRef = useRef<{ pointerId: number; startX: number; startY: number } | null>(
      null
    );
    const longPressTimerRef = useRef<number | null>(null);
    const longPressConsumedRef = useRef<string | null>(null);
    const groupDragStateRef = useRef<{
      draggedId: string;
      originNodes: Record<string, Point>;
    } | null>(null);
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

    const renderedElements = useMemo(
      () =>
        designDocument.elements.map((element) => ({
          ...element,
          ...transientElements[element.id],
        })),
      [designDocument.elements, transientElements]
    );

    const selectedElementSet = useMemo(
      () => new Set(selectedElementIds),
      [selectedElementIds]
    );

    const selectedElements = useMemo(
      () => renderedElements.filter((element) => selectedElementSet.has(element.id)),
      [renderedElements, selectedElementSet]
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
      if (!selectedElementIds.length && !selectedElementId) {
        return;
      }

      const selectedExists = designDocument.elements.map((element) => element.id);
      const hasPrimary = selectedElementId
        ? selectedExists.includes(selectedElementId)
        : false;
      const hasAny = selectedElementIds.some((id) => selectedExists.includes(id));

      if (!hasAny || (selectedElementId && !hasPrimary)) {
        onClearSelection();
      }
    }, [
      designDocument.elements,
      onClearSelection,
      selectedElementId,
      selectedElementIds,
    ]);

    const clearLongPressTimer = useCallback(() => {
      if (longPressTimerRef.current) {
        window.clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }
    }, []);

    const isViewportTarget = (target: Konva.Node) =>
      target === target.getStage() ||
      target.attrs.name === "artboard-hit-area" ||
      target.attrs.name === "artboard-surface";

    const viewportCenter: Point = {
      x: containerSize.width / 2 + viewport.offsetX,
      y: containerSize.height / 2 + viewport.offsetY,
    };
    const artboardOffset = {
      x: -fitArtboard.width / 2,
      y: -fitArtboard.height / 2,
    };
    const playgroundBounds = useMemo(() => {
      if (!containerSize.width || !containerSize.height || viewport.scale <= 0) {
        return {
          minX: ELEMENT_POSITION_MIN,
          maxX: ELEMENT_POSITION_MAX,
          minY: ELEMENT_POSITION_MIN,
          maxY: ELEMENT_POSITION_MAX,
        };
      }

      const localMinX = -viewportCenter.x / viewport.scale;
      const localMaxX = (containerSize.width - viewportCenter.x) / viewport.scale;
      const localMinY = -viewportCenter.y / viewport.scale;
      const localMaxY = (containerSize.height - viewportCenter.y) / viewport.scale;

      return {
        minX: Math.max(
          ELEMENT_POSITION_MIN,
          roundTo((localMinX - artboardOffset.x) / fitArtboard.width)
        ),
        maxX: Math.min(
          ELEMENT_POSITION_MAX,
          roundTo((localMaxX - artboardOffset.x) / fitArtboard.width)
        ),
        minY: Math.max(
          ELEMENT_POSITION_MIN,
          roundTo((localMinY - artboardOffset.y) / fitArtboard.height)
        ),
        maxY: Math.min(
          ELEMENT_POSITION_MAX,
          roundTo((localMaxY - artboardOffset.y) / fitArtboard.height)
        ),
      };
    }, [
      artboardOffset.x,
      artboardOffset.y,
      containerSize.height,
      containerSize.width,
      fitArtboard.height,
      fitArtboard.width,
      viewport.scale,
      viewportCenter.x,
      viewportCenter.y,
    ]);

    const getNormalizedPointInPlayground = useCallback(
      (point: Point) => ({
        x: roundTo(
          clamp(
            (point.x - artboardOffset.x) / fitArtboard.width,
            playgroundBounds.minX,
            playgroundBounds.maxX
          )
        ),
        y: roundTo(
          clamp(
            (point.y - artboardOffset.y) / fitArtboard.height,
            playgroundBounds.minY,
            playgroundBounds.maxY
          )
        ),
      }),
      [
        artboardOffset.x,
        artboardOffset.y,
        fitArtboard.height,
        fitArtboard.width,
        playgroundBounds.maxX,
        playgroundBounds.maxY,
        playgroundBounds.minX,
        playgroundBounds.minY,
      ]
    );

    const setTransientElement = useCallback(
      (id: string, patch: Partial<EditorElement> | null) => {
        setTransientElements((current) => {
          if (!patch) {
            if (!(id in current)) {
              return current;
            }

            const next = { ...current };
            delete next[id];
            return next;
          }

          return {
            ...current,
            [id]: {
              ...current[id],
              ...patch,
            },
          };
        });
      },
      []
    );

    const getNodePatch = useCallback(
      (node: Konva.Image) => {
        const scaleX = node.scaleX();
        const scaleY = node.scaleY();
        const flipX = scaleX < 0;
        const flipY = scaleY < 0;
        const widthPx = clamp(
          node.width() * Math.abs(scaleX),
          fitArtboard.width * 0.04,
          fitArtboard.width
        );
        const heightPx = clamp(
          node.height() * Math.abs(scaleY),
          fitArtboard.height * 0.04,
          fitArtboard.height
        );
        const normalized = getNormalizedPointInPlayground({
          x: node.x(),
          y: node.y(),
        });

        return {
          ...normalized,
          width: widthPx / fitArtboard.width,
          height: heightPx / fitArtboard.height,
          rotation: node.rotation(),
          flipX,
          flipY,
        };
      },
      [fitArtboard.height, fitArtboard.width, getNormalizedPointInPlayground]
    );

    const isPointNearSelectedElement = useCallback(
      (point: Point, padding = SELECTION_HANDLE_PADDING) => {
        return selectedElementIds.some((id) => {
          const selectedNode = nodeMapRef.current[id];

          if (!selectedNode) {
            return false;
          }

          const bounds = selectedNode.getClientRect({
            skipShadow: true,
            skipStroke: true,
          });

          return (
            point.x >= bounds.x - padding &&
            point.x <= bounds.x + bounds.width + padding &&
            point.y >= bounds.y - padding &&
            point.y <= bounds.y + bounds.height + padding
          );
        });
      },
      [selectedElementIds]
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
        pinchStateRef.current = {
          distance: getTouchDistance(touches),
          center: getTouchCenter(touches),
          viewport,
        };
        panStateRef.current = null;
        return;
      }

      const stage = stageRef.current;
      const touch = touches[0];
      const containerBounds = stage?.container().getBoundingClientRect();
      const point = touch && containerBounds
        ? {
            x: touch.clientX - containerBounds.left,
            y: touch.clientY - containerBounds.top,
          }
        : null;

      if (point && isPointNearSelectedElement(point)) {
        return;
      }

      const targetIsStage = isViewportTarget(event.target);

        if (!targetIsStage || viewport.scale <= 1) {
        if (targetIsStage) {
          onClearSelection();
        }
        return;
      }

      onClearSelection();
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
      const stage = stageRef.current;
      const containerBounds = stage?.container().getBoundingClientRect();
      const point = containerBounds
        ? {
            x: event.evt.clientX - containerBounds.left,
            y: event.evt.clientY - containerBounds.top,
          }
        : null;

      if (point && isPointNearSelectedElement(point)) {
        return;
      }

      const targetIsStage = isViewportTarget(event.target);

      if (!targetIsStage) {
        return;
      }

      onClearSelection();

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

    const handleElementPointerDown = useCallback(
      (id: string, event: Konva.KonvaEventObject<PointerEvent>) => {
        clearLongPressTimer();
        longPressConsumedRef.current = null;

        if (event.evt.shiftKey && !selectedElementSet.has(id)) {
          onAddElementToSelection(id);
          longPressConsumedRef.current = id;
          return;
        }

        if (
          event.evt.pointerType !== "mouse" &&
          selectedElementIds.length > 0 &&
          !selectedElementSet.has(id)
        ) {
          longPressTimerRef.current = window.setTimeout(() => {
            onAddElementToSelection(id);
            longPressConsumedRef.current = id;
            longPressTimerRef.current = null;
          }, 360);
        }
      },
      [
        clearLongPressTimer,
        onAddElementToSelection,
        selectedElementIds.length,
        selectedElementSet,
      ]
    );

    const handleElementPointerUp = useCallback(() => {
      clearLongPressTimer();
    }, [clearLongPressTimer]);

    const handleElementSelect = useCallback(
      (id: string) => {
        if (longPressConsumedRef.current === id) {
          longPressConsumedRef.current = null;
          return;
        }

        if (selectedElementSet.has(id) && selectedElementIds.length > 1) {
          return;
        }

        onSelectElement(id);
      },
      [onSelectElement, selectedElementIds.length, selectedElementSet]
    );

    const handleDragStart = useCallback(
      (id: string) => {
        clearLongPressTimer();

        if (!selectedElementSet.has(id) || selectedElementIds.length < 2) {
          groupDragStateRef.current = null;
          return;
        }

        const originNodes: Record<string, Point> = {};

        selectedElementIds.forEach((selectedId) => {
          const node = nodeMapRef.current[selectedId];

          if (!node) {
            return;
          }

          originNodes[selectedId] = {
            x: node.x(),
            y: node.y(),
          };
        });

        groupDragStateRef.current = {
          draggedId: id,
          originNodes,
        };
      },
      [clearLongPressTimer, selectedElementIds, selectedElementSet]
    );

    const handleDragMove = useCallback(
      (id: string, x: number, y: number) => {
        const groupDragState = groupDragStateRef.current;

        if (!groupDragState || groupDragState.draggedId !== id) {
          return;
        }

        const draggedOrigin = groupDragState.originNodes[id];

        if (!draggedOrigin) {
          return;
        }

        const deltaX = x - draggedOrigin.x;
        const deltaY = y - draggedOrigin.y;

        Object.entries(groupDragState.originNodes).forEach(([selectedId, origin]) => {
          if (selectedId === id) {
            return;
          }

          const node = nodeMapRef.current[selectedId];

          if (!node) {
            return;
          }

          node.position({
            x: origin.x + deltaX,
            y: origin.y + deltaY,
          });
        });

        stageRef.current?.batchDraw();
      },
      []
    );

    const handleDragEnd = useCallback(
      (id: string, x: number, y: number) => {
        const groupDragState = groupDragStateRef.current;

        if (groupDragState && groupDragState.draggedId === id) {
          const updates = selectedElementIds
            .map((selectedId) => {
              const node = nodeMapRef.current[selectedId];

              if (!node) {
                return null;
              }

              return {
                id: selectedId,
                patch: getNormalizedPointInPlayground({
                  x: node.x(),
                  y: node.y(),
                }),
              };
            })
            .filter(Boolean) as Array<{
            id: string;
            patch: Partial<EditorElement>;
          }>;

          groupDragStateRef.current = null;
          onUpdateElements(updates);
          return;
        }

        const normalized = getNormalizedPointInPlayground({ x, y });
        setTransientElement(id, null);
        onUpdateElement(id, normalized);
      },
      [
        getNormalizedPointInPlayground,
        onUpdateElement,
        onUpdateElements,
        selectedElementIds,
        setTransientElement,
      ]
    );

    const handleTransformEnd = useCallback(() => {
      const updates = selectedElementIds
        .map((id) => {
          const node = nodeMapRef.current[id];

          if (!node) {
            return null;
          }

          return {
            id,
            patch: getNodePatch(node),
          };
        })
        .filter(Boolean) as Array<{
        id: string;
        patch: Partial<EditorElement>;
      }>;

      if (!updates.length) {
        return;
      }

      selectedElementIds.forEach((id) => setTransientElement(id, null));
      onUpdateElements(updates);
    }, [getNodePatch, onUpdateElements, selectedElementIds, setTransientElement]);

    const handleTransform = useCallback(() => {
      if (selectedElementIds.length !== 1 || !selectedElementId) {
        return;
      }

      const selectedNode = nodeMapRef.current[selectedElementId];

      if (!selectedNode) {
        return;
      }

      setTransientElement(selectedElementId, getNodePatch(selectedNode));
    }, [getNodePatch, selectedElementId, selectedElementIds.length, setTransientElement]);

    return (
      <div ref={wrapperRef} className="h-full min-h-[320px] w-full rounded-[2rem]">
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
                  {renderedElements.map((element) => (
                    <SvgElement
                      key={element.id}
                      element={element}
                      isSelected={selectedElementSet.has(element.id)}
                      artboardWidth={fitArtboard.width}
                      artboardHeight={fitArtboard.height}
                      registerNode={(id, node) => {
                        nodeMapRef.current[id] = node;
                      }}
                      onSelect={handleElementSelect}
                      onPointerDown={handleElementPointerDown}
                      onPointerUp={handleElementPointerUp}
                      onDragStart={handleDragStart}
                      onDragMove={handleDragMove}
                      onDragEnd={handleDragEnd}
                      allowDrag={selectedElementSet.has(element.id)}
                    />
                  ))}
                </Group>

                {selectedElementIds.length ? (
                  <TransformHandles
                    selectedElementIds={selectedElementIds}
                    nodeMapRef={nodeMapRef}
                    artboardWidth={fitArtboard.width}
                    artboardHeight={fitArtboard.height}
                    onTransform={handleTransform}
                    onTransformEnd={handleTransformEnd}
                  />
                ) : null}

                {selectedElements.some((element) =>
                  isElementOutOfBounds(
                    element,
                    designDocument.shape,
                    aspectRatio
                  )
                ) ? (
                  <Rect
                    x={-fitArtboard.width / 2}
                    y={-fitArtboard.height / 2}
                    width={fitArtboard.width}
                    height={fitArtboard.height}
                    stroke="rgba(176, 70, 53, 0.75)"
                    strokeWidth={2}
                    cornerRadius={designDocument.shape === "rectangle" ? 12 : 0}
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
