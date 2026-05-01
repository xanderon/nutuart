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
import { Circle, Group, Layer, Line, Rect, Stage } from "react-konva";
import {
  clamp,
  roundTo,
  ELEMENT_POSITION_MAX,
  ELEMENT_POSITION_MIN,
  getAspectRatio,
  getElementsBoundingBox,
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
const GROUP_DRAG_HANDLE_ID = "__selection-group-handle__";

type CanvasStageProps = {
  document: EditorDocument;
  selectedElementId: string | null;
  selectedElementIds: string[];
  viewport: EditorViewport;
  onViewportChange: (viewport: EditorViewport) => void;
  onSelectElement: (id: string | null) => void;
  onSetSelectedElements: (ids: string[]) => void;
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
      onSetSelectedElements,
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
    const [groupHandlePosition, setGroupHandlePosition] = useState<Point | null>(null);
    const [selectionRect, setSelectionRect] = useState<{
      pointerId: number;
      start: Point;
      current: Point;
    } | null>(null);
    const panStateRef = useRef<{ pointerId: number; startX: number; startY: number } | null>(
      null
    );
    const longPressTimerRef = useRef<number | null>(null);
    const longPressConsumedRef = useRef<string | null>(null);
    const groupDragStateRef = useRef<{
      draggedId: string;
      originNodes: Record<string, Point>;
      originPoint: Point;
      lockedAxis: "x" | "y" | null;
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
    const selectionBounds = useMemo(
      () =>
        selectedElements.length > 1 ? getElementsBoundingBox(selectedElements) : null,
      [selectedElements]
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

      if (event.evt.pointerType === "mouse") {
        if (point) {
          setSelectionRect({
            pointerId: event.evt.pointerId,
            start: point,
            current: point,
          });
        }
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
      if (
        selectionRect &&
        selectionRect.pointerId === event.evt.pointerId
      ) {
        const stage = stageRef.current;
        const containerBounds = stage?.container().getBoundingClientRect();

        if (!containerBounds) {
          return;
        }

        setSelectionRect((current) =>
          current
            ? {
                ...current,
                current: {
                  x: event.evt.clientX - containerBounds.left,
                  y: event.evt.clientY - containerBounds.top,
                },
              }
            : current
        );
        return;
      }

      if (!panStateRef.current || panStateRef.current.pointerId !== event.evt.pointerId) {
        return;
      }

      onViewportChange({
        ...viewport,
        offsetX: event.evt.clientX - panStateRef.current.startX,
        offsetY: event.evt.clientY - panStateRef.current.startY,
      });
    };

    const handlePointerUp = (event: Konva.KonvaEventObject<PointerEvent>) => {
      if (
        selectionRect &&
        selectionRect.pointerId === event.evt.pointerId
      ) {
        const minX = Math.min(selectionRect.start.x, selectionRect.current.x);
        const maxX = Math.max(selectionRect.start.x, selectionRect.current.x);
        const minY = Math.min(selectionRect.start.y, selectionRect.current.y);
        const maxY = Math.max(selectionRect.start.y, selectionRect.current.y);
        const width = maxX - minX;
        const height = maxY - minY;

        setSelectionRect(null);

        if (width < 6 && height < 6) {
          onClearSelection();
          return;
        }

        const nextSelectedIds = renderedElements
          .filter((element) => {
            const node = nodeMapRef.current[element.id];

            if (!node) {
              return false;
            }

            const bounds = node.getClientRect({
              skipShadow: true,
              skipStroke: true,
            });

            return (
              bounds.x >= minX &&
              bounds.y >= minY &&
              bounds.x + bounds.width <= maxX &&
              bounds.y + bounds.height <= maxY
            );
          })
          .map((element) => element.id);

        onSetSelectedElements(nextSelectedIds);
        return;
      }

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
      (id: string, originPoint?: Point) => {
        clearLongPressTimer();

        const isElementDrag = id !== GROUP_DRAG_HANDLE_ID;
        const isSelected = selectedElementIds.includes(id);

        if (isElementDrag && !isSelected) {
          onSelectElement(id);
        }

        const draggedIds = isElementDrag
          ? isSelected
            ? selectedElementIds.length > 1
              ? selectedElementIds
              : [id]
            : [id]
          : selectedElementIds;

        if (!draggedIds.length) {
          groupDragStateRef.current = null;
          return;
        }

        const originNodes: Record<string, Point> = {};

        draggedIds.forEach((selectedId) => {
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
          originPoint:
            originPoint ??
            originNodes[id] ?? {
              x: 0,
              y: 0,
            },
          lockedAxis: null,
        };

        if (draggedIds.length > 1 && selectionBounds) {
          setGroupHandlePosition({
            x: -fitArtboard.width / 2 + selectionBounds.centerX * fitArtboard.width,
            y: -fitArtboard.height / 2 + selectionBounds.centerY * fitArtboard.height,
          });
        }
      },
      [
        clearLongPressTimer,
        fitArtboard.height,
        fitArtboard.width,
        onSelectElement,
        selectedElementIds,
        selectionBounds,
      ]
    );

    const handleDragMove = useCallback(
      (id: string, x: number, y: number, shiftKey: boolean) => {
        const groupDragState = groupDragStateRef.current;

        if (!groupDragState || groupDragState.draggedId !== id) {
          return;
        }

        const rawDeltaX = x - groupDragState.originPoint.x;
        const rawDeltaY = y - groupDragState.originPoint.y;

        if (!shiftKey) {
          groupDragState.lockedAxis = null;
        } else if (!groupDragState.lockedAxis) {
          if (Math.abs(rawDeltaX) > 2 || Math.abs(rawDeltaY) > 2) {
            groupDragState.lockedAxis =
              Math.abs(rawDeltaX) >= Math.abs(rawDeltaY) ? "x" : "y";
          }
        }

        const deltaX =
          groupDragState.lockedAxis === "y" ? 0 : rawDeltaX;
        const deltaY =
          groupDragState.lockedAxis === "x" ? 0 : rawDeltaY;

        Object.entries(groupDragState.originNodes).forEach(([selectedId, origin]) => {
          const node = nodeMapRef.current[selectedId];

          if (!node) {
            return;
          }

          node.position({
            x: origin.x + deltaX,
            y: origin.y + deltaY,
          });
        });

        if (selectedElementIds.length > 1 && selectionBounds) {
          setGroupHandlePosition({
            x: -fitArtboard.width / 2 + selectionBounds.centerX * fitArtboard.width + deltaX,
            y: -fitArtboard.height / 2 + selectionBounds.centerY * fitArtboard.height + deltaY,
          });
        }

        stageRef.current?.batchDraw();
      },
      [fitArtboard.height, fitArtboard.width, selectedElementIds.length, selectionBounds]
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
          setGroupHandlePosition(null);
          onUpdateElements(updates);
          return;
        }

        const normalized = getNormalizedPointInPlayground({ x, y });
        setGroupHandlePosition(null);
        setTransientElement(id, null);
        onUpdateElement(id, normalized);
      },
      [
        getNormalizedPointInPlayground,
        onUpdateElement,
        onUpdateElements,
        selectedElementIds,
        setGroupHandlePosition,
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

          const patch = getNodePatch(node);

          node.width(patch.width * fitArtboard.width);
          node.height(patch.height * fitArtboard.height);
          node.scaleX(patch.flipX ? -1 : 1);
          node.scaleY(patch.flipY ? -1 : 1);
          node.position({
            x: -fitArtboard.width / 2 + patch.x * fitArtboard.width,
            y: -fitArtboard.height / 2 + patch.y * fitArtboard.height,
          });

          return {
            id,
            patch,
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
    }, [
      fitArtboard.height,
      fitArtboard.width,
      getNodePatch,
      onUpdateElements,
      selectedElementIds,
      setTransientElement,
    ]);

    const handleTransform = useCallback(() => {
      // Let Konva own the live resize interaction so the opposite anchor stays fixed.
    }, []);

    const setCursor = useCallback((cursor: string) => {
      const container = stageRef.current?.container();

      if (container) {
        container.style.cursor = cursor;
      }
    }, []);

    const resetCursor = useCallback(() => {
      const container = stageRef.current?.container();

      if (container) {
        container.style.cursor = "";
      }
    }, []);

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
                      onDragStart={(id, x, y) => handleDragStart(id, { x, y })}
                      onDragMove={handleDragMove}
                      onDragEnd={handleDragEnd}
                      allowDrag
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

                {selectionBounds ? (
                  <Group
                    x={
                      groupHandlePosition?.x ??
                      (-fitArtboard.width / 2 + selectionBounds.centerX * fitArtboard.width)
                    }
                    y={
                      groupHandlePosition?.y ??
                      (-fitArtboard.height / 2 + selectionBounds.centerY * fitArtboard.height)
                    }
                    draggable
                    onDragStart={(event) =>
                      handleDragStart(GROUP_DRAG_HANDLE_ID, {
                        x: event.target.x(),
                        y: event.target.y(),
                      })
                    }
                    onDragMove={(event) =>
                      handleDragMove(
                        GROUP_DRAG_HANDLE_ID,
                        event.target.x(),
                        event.target.y(),
                        Boolean(event.evt.shiftKey)
                      )
                    }
                    onDragEnd={(event) => {
                      resetCursor();
                      handleDragEnd(
                        GROUP_DRAG_HANDLE_ID,
                        event.target.x(),
                        event.target.y()
                      );
                    }}
                    onMouseEnter={() => setCursor("move")}
                    onMouseLeave={resetCursor}
                  >
                    <Circle
                      radius={14}
                      fill="rgba(255,255,255,0.96)"
                      stroke="#0d6b72"
                      strokeWidth={1.4}
                      shadowColor="rgba(15,23,42,0.2)"
                      shadowBlur={12}
                      shadowOffsetY={4}
                      shadowOpacity={0.28}
                    />
                    <Line
                      points={[-5, -5, 5, 5]}
                      stroke="#0d6b72"
                      strokeWidth={1.8}
                      lineCap="round"
                      listening={false}
                    />
                    <Line
                      points={[5, -5, -5, 5]}
                      stroke="#0d6b72"
                      strokeWidth={1.8}
                      lineCap="round"
                      listening={false}
                    />
                  </Group>
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

              {selectionRect ? (
                <Rect
                  x={Math.min(selectionRect.start.x, selectionRect.current.x)}
                  y={Math.min(selectionRect.start.y, selectionRect.current.y)}
                  width={Math.abs(selectionRect.current.x - selectionRect.start.x)}
                  height={Math.abs(selectionRect.current.y - selectionRect.start.y)}
                  fill="rgba(13,107,114,0.08)"
                  stroke="rgba(13,107,114,0.72)"
                  strokeWidth={1}
                  dash={[6, 4]}
                  listening={false}
                />
              ) : null}
            </Layer>
          </Stage>
        ) : null}
      </div>
    );
  }
);
