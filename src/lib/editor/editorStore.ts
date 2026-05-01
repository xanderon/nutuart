"use client";

import { create } from "zustand";
import { defaultEditorDocument, defaultViewport } from "./editorDefaults";
import { editorAssetMap } from "./editorAssets";
import { getEditorArtboardInsets, getFitArtboardSize } from "./viewportUtils";
import {
  clamp,
  createEditorId,
  duplicateElement,
  getElementBoundingBox,
  ELEMENT_POSITION_MAX,
  ELEMENT_POSITION_MIN,
  getDefaultElementSize,
  getElementsBoundingBox,
  orderElements,
  roundTo,
  sanitizeDimension,
} from "./geometryUtils";
import type {
  EditorDocument,
  EditorElement,
  EditorPanel,
  EditorShape,
  EditorViewport,
  Size,
  ProductType,
} from "./editorTypes";

type EditorStore = {
  isStarted: boolean;
  activePanel: EditorPanel;
  document: EditorDocument;
  past: EditorDocument[];
  future: EditorDocument[];
  selectedElementId: string | null;
  selectedElementIds: string[];
  viewport: EditorViewport;
  canvasSize: Size;
  startEditing: () => void;
  goToSetup: () => void;
  setActivePanel: (panel: EditorPanel) => void;
  setProjectName: (name: string) => void;
  setProductType: (productType: ProductType) => void;
  setShape: (shape: EditorShape) => void;
  setDimensions: (widthCm: number, heightCm: number) => void;
  setCanvasSize: (size: Size) => void;
  setViewport: (viewport: EditorViewport) => void;
  resetViewport: () => void;
  centerViewport: () => void;
  undo: () => void;
  redo: () => void;
  loadDocument: (document: EditorDocument) => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  selectElement: (id: string | null) => void;
  addElementToSelection: (id: string) => void;
  clearSelection: () => void;
  addElement: (assetId: string) => void;
  updateElement: (
    id: string,
    next:
      | Partial<EditorElement>
      | ((current: EditorElement) => Partial<EditorElement> | EditorElement)
  ) => void;
  updateElements: (
    updates: Array<{
      id: string;
      patch:
        | Partial<EditorElement>
        | ((current: EditorElement) => Partial<EditorElement> | EditorElement);
    }>
  ) => void;
  deleteSelectedElement: () => void;
  duplicateSelectedElement: () => void;
  flipSelectedElement: (axis: "x" | "y") => void;
  alignSelectedElements: (
    alignment: "top" | "left" | "centerX" | "right" | "middle" | "bottom"
  ) => void;
  pasteClipboardElements: (elements: EditorElement[]) => EditorElement[];
};

function patchDocument(
  document: EditorDocument,
  patch: Partial<EditorDocument>
): EditorDocument {
  return {
    ...document,
    ...patch,
  };
}

function ensureSelection(
  document: EditorDocument,
  selectedElementId: string | null
) {
  if (!selectedElementId) {
    return null;
  }

  return document.elements.some((element) => element.id === selectedElementId)
    ? selectedElementId
    : null;
}

function ensureSelectionIds(
  document: EditorDocument,
  selectedElementIds: string[]
) {
  const validIds = new Set(document.elements.map((element) => element.id));
  return selectedElementIds.filter((id) => validIds.has(id));
}

const HISTORY_LIMIT = 80;

export const useEditorStore = create<EditorStore>((set, get) => ({
  isStarted: false,
  activePanel: null,
  document: defaultEditorDocument,
  past: [],
  future: [],
  selectedElementId: null,
  selectedElementIds: [],
  viewport: defaultViewport,
  canvasSize: { width: 0, height: 0 },
  startEditing: () =>
    set({
      isStarted: true,
      activePanel: "library",
    }),
  goToSetup: () =>
    set({
      isStarted: false,
      activePanel: null,
      past: [],
      future: [],
      selectedElementId: null,
      selectedElementIds: [],
      viewport: defaultViewport,
    }),
  setActivePanel: (activePanel) => set({ activePanel }),
  setProjectName: (projectName) =>
    set((state) => {
      const nextDocument = patchDocument(state.document, {
        projectName: projectName || defaultEditorDocument.projectName,
      });

      return {
        document: nextDocument,
        past: [...state.past, state.document].slice(-HISTORY_LIMIT),
        future: [],
      };
    }),
  setProductType: (productType) =>
    set((state) => {
      const nextDocument = patchDocument(state.document, { productType });

      return {
        document: nextDocument,
        past: [...state.past, state.document].slice(-HISTORY_LIMIT),
        future: [],
      };
    }),
  setShape: (shape) =>
    set((state) => {
      const nextDocument = patchDocument(state.document, { shape });

      return {
        document: nextDocument,
        past: [...state.past, state.document].slice(-HISTORY_LIMIT),
        future: [],
      };
    }),
  setDimensions: (widthCm, heightCm) =>
    set((state) => {
      const previousWidthCm = state.document.widthCm;
      const previousHeightCm = state.document.heightCm;
      const nextWidthCm = sanitizeDimension(widthCm);
      const nextHeightCm = sanitizeDimension(heightCm);
      const safeCanvas = {
        width: state.canvasSize.width > 0 ? state.canvasSize.width : 360,
        height: state.canvasSize.height > 0 ? state.canvasSize.height : 560,
      };
      const previousFit = getFitArtboardSize(
        safeCanvas,
        previousWidthCm / previousHeightCm,
        getEditorArtboardInsets(safeCanvas)
      );
      const nextFit = getFitArtboardSize(
        safeCanvas,
        nextWidthCm / nextHeightCm,
        getEditorArtboardInsets(safeCanvas)
      );
      const nextDocument = patchDocument(state.document, {
        widthCm: nextWidthCm,
        heightCm: nextHeightCm,
        elements: state.document.elements.map((element) => {
          const previousCenterX =
            -previousFit.width / 2 + element.x * previousFit.width;
          const previousCenterY =
            -previousFit.height / 2 + element.y * previousFit.height;
          const previousPixelWidth = element.width * previousFit.width;
          const previousPixelHeight = element.height * previousFit.height;

          return {
            ...element,
            x: roundTo((previousCenterX + nextFit.width / 2) / nextFit.width),
            y: roundTo((previousCenterY + nextFit.height / 2) / nextFit.height),
            width: roundTo(Math.max(0.04, previousPixelWidth / nextFit.width)),
            height: roundTo(
              Math.max(0.04, previousPixelHeight / nextFit.height)
            ),
          };
        }),
      });

      return {
        document: nextDocument,
        past: [...state.past, state.document].slice(-HISTORY_LIMIT),
        future: [],
      };
    }),
  setCanvasSize: (canvasSize) => set({ canvasSize }),
  setViewport: (viewport) => set({ viewport }),
  resetViewport: () => set({ viewport: defaultViewport }),
  centerViewport: () =>
    set((state) => ({
      viewport: {
        ...state.viewport,
        offsetX: 0,
        offsetY: 0,
      },
    })),
  undo: () =>
    set((state) => {
      const previous = state.past.at(-1);

      if (!previous) {
        return state;
      }

      const past = state.past.slice(0, -1);

      return {
        document: previous,
        past,
        future: [state.document, ...state.future].slice(0, HISTORY_LIMIT),
        selectedElementId: ensureSelection(previous, state.selectedElementId),
        selectedElementIds: ensureSelectionIds(
          previous,
          state.selectedElementIds
        ),
      };
    }),
  redo: () =>
    set((state) => {
      const [next, ...future] = state.future;

      if (!next) {
        return state;
      }

      return {
        document: next,
        past: [...state.past, state.document].slice(-HISTORY_LIMIT),
        future,
        selectedElementId: ensureSelection(next, state.selectedElementId),
        selectedElementIds: ensureSelectionIds(next, state.selectedElementIds),
      };
    }),
  loadDocument: (document) =>
    set({
      isStarted: true,
      activePanel: null,
      past: [],
      future: [],
      document: patchDocument(defaultEditorDocument, {
        ...document,
        elements: orderElements(document.elements).map((element, index) => ({
          ...element,
          zIndex: index + 1,
        })),
      }),
      selectedElementId: null,
      selectedElementIds: [],
      viewport: defaultViewport,
    }),
  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
  selectElement: (selectedElementId) =>
    set({
      selectedElementId,
      selectedElementIds: selectedElementId ? [selectedElementId] : [],
    }),
  addElementToSelection: (id) =>
    set((state) => {
      if (!state.document.elements.some((element) => element.id === id)) {
        return state;
      }

      if (state.selectedElementIds.includes(id)) {
        return {
          selectedElementId: id,
        };
      }

      return {
        selectedElementId: id,
        selectedElementIds: [...state.selectedElementIds, id],
      };
    }),
  clearSelection: () =>
    set({
      selectedElementId: null,
      selectedElementIds: [],
    }),
  addElement: (assetId) => {
    const asset = editorAssetMap[assetId];

    if (!asset) {
      return;
    }

    const state = get();
    const size = getDefaultElementSize(
      asset,
      state.document.widthCm / state.document.heightCm
    );
    const maxZIndex = state.document.elements.reduce(
      (highest, element) => Math.max(highest, element.zIndex),
      0
    );
    const nextElement: EditorElement = {
      id: createEditorId("element"),
      assetId,
      x: 0.5,
      y: 0.5,
      width: size.width,
      height: size.height,
      rotation: 0,
      flipX: false,
      flipY: false,
      zIndex: maxZIndex + 1,
    };

    set({
      document: patchDocument(state.document, {
        elements: orderElements([...state.document.elements, nextElement]),
      }),
      past: [...state.past, state.document].slice(-HISTORY_LIMIT),
      future: [],
      selectedElementId: nextElement.id,
      selectedElementIds: [nextElement.id],
      activePanel: "element",
    });
  },
  updateElement: (id, next) =>
    set((state) => {
      const nextDocument = patchDocument(state.document, {
        elements: state.document.elements.map((element) => {
          if (element.id !== id) {
            return element;
          }

          const patch = typeof next === "function" ? next(element) : next;
          const merged = {
            ...element,
            ...patch,
          };

          return {
            ...merged,
            x: roundTo(
              clamp(merged.x, ELEMENT_POSITION_MIN, ELEMENT_POSITION_MAX)
            ),
            y: roundTo(
              clamp(merged.y, ELEMENT_POSITION_MIN, ELEMENT_POSITION_MAX)
            ),
            width: roundTo(clamp(merged.width, 0.04, 1)),
            height: roundTo(clamp(merged.height, 0.04, 1)),
            rotation: roundTo(merged.rotation, 2),
          };
        }),
      });

      return {
        document: nextDocument,
        past: [...state.past, state.document].slice(-HISTORY_LIMIT),
        future: [],
      };
    }),
  updateElements: (updates) =>
    set((state) => {
      if (!updates.length) {
        return state;
      }

      const updatesById = new Map(updates.map((update) => [update.id, update.patch]));
      const nextDocument = patchDocument(state.document, {
        elements: state.document.elements.map((element) => {
          const next = updatesById.get(element.id);

          if (!next) {
            return element;
          }

          const patch = typeof next === "function" ? next(element) : next;
          const merged = {
            ...element,
            ...patch,
          };

          return {
            ...merged,
            x: roundTo(
              clamp(merged.x, ELEMENT_POSITION_MIN, ELEMENT_POSITION_MAX)
            ),
            y: roundTo(
              clamp(merged.y, ELEMENT_POSITION_MIN, ELEMENT_POSITION_MAX)
            ),
            width: roundTo(clamp(merged.width, 0.04, 1)),
            height: roundTo(clamp(merged.height, 0.04, 1)),
            rotation: roundTo(merged.rotation, 2),
          };
        }),
      });

      return {
        document: nextDocument,
        past: [...state.past, state.document].slice(-HISTORY_LIMIT),
        future: [],
      };
    }),
  deleteSelectedElement: () => {
    const { document, selectedElementIds, selectedElementId } = get();
    const idsToDelete = selectedElementIds.length
      ? selectedElementIds
      : selectedElementId
        ? [selectedElementId]
        : [];

    if (!idsToDelete.length) {
      return;
    }

    set({
      document: patchDocument(document, {
        elements: document.elements.filter((item) => !idsToDelete.includes(item.id)),
      }),
      past: [...get().past, document].slice(-HISTORY_LIMIT),
      future: [],
      selectedElementId: null,
      selectedElementIds: [],
    });
  },
  duplicateSelectedElement: () => {
    const { document, selectedElementIds, selectedElementId } = get();
    const idsToDuplicate = selectedElementIds.length
      ? selectedElementIds
      : selectedElementId
        ? [selectedElementId]
        : [];

    if (!idsToDuplicate.length) {
      return;
    }

    const selected = document.elements.filter((item) =>
      idsToDuplicate.includes(item.id)
    );

    if (!selected.length) {
      return;
    }

    const clones = selected
      .sort((left, right) => left.zIndex - right.zIndex)
      .map((element) => duplicateElement(element));
    const nextElements = orderElements(
      [...document.elements, ...clones].map((element, index) => ({
        ...element,
        zIndex: index + 1,
      }))
    );

    set({
      document: patchDocument(document, {
        elements: nextElements,
      }),
      past: [...get().past, document].slice(-HISTORY_LIMIT),
      future: [],
      selectedElementId: clones.at(-1)?.id ?? null,
      selectedElementIds: clones.map((clone) => clone.id),
    });
  },
  flipSelectedElement: (axis) => {
    const { selectedElementIds, selectedElementId, document } = get();
    const idsToFlip = selectedElementIds.length
      ? selectedElementIds
      : selectedElementId
        ? [selectedElementId]
        : [];

    if (!idsToFlip.length) {
      return;
    }

    const selected = document.elements.filter((element) =>
      idsToFlip.includes(element.id)
    );

    const selectionBounds =
      idsToFlip.length > 1 ? getElementsBoundingBox(selected) : null;

    get().updateElements(
      idsToFlip.map((id) => ({
        id,
        patch: (element) =>
          axis === "x"
            ? {
                x: selectionBounds
                  ? roundTo(selectionBounds.centerX - (element.x - selectionBounds.centerX))
                  : element.x,
                flipX: !element.flipX,
              }
            : {
                y: selectionBounds
                  ? roundTo(selectionBounds.centerY - (element.y - selectionBounds.centerY))
                  : element.y,
                flipY: !element.flipY,
              },
      }))
    );
  },
  alignSelectedElements: (alignment) => {
    const { selectedElementIds, document } = get();

    if (selectedElementIds.length < 2) {
      return;
    }

    const selected = document.elements.filter((element) =>
      selectedElementIds.includes(element.id)
    );
    const selectionBounds = getElementsBoundingBox(selected);

    if (!selectionBounds) {
      return;
    }

    get().updateElements(
      selected.map((element) => ({
        id: element.id,
        patch: () => {
          const elementBounds = getElementBoundingBox(element);

          if (!elementBounds) {
            return {};
          }

          if (alignment === "left") {
            return {
              x: roundTo(element.x + (selectionBounds.minX - elementBounds.minX)),
            };
          }

          if (alignment === "right") {
            return {
              x: roundTo(element.x + (selectionBounds.maxX - elementBounds.maxX)),
            };
          }

          if (alignment === "top") {
            return {
              y: roundTo(element.y + (selectionBounds.minY - elementBounds.minY)),
            };
          }

          if (alignment === "bottom") {
            return {
              y: roundTo(element.y + (selectionBounds.maxY - elementBounds.maxY)),
            };
          }

          if (alignment === "centerX") {
            return {
              x: roundTo(element.x + (selectionBounds.centerX - elementBounds.centerX)),
            };
          }

          return {
            y: roundTo(element.y + (selectionBounds.centerY - elementBounds.centerY)),
          };
        },
      }))
    );
  },
  pasteClipboardElements: (elements) => {
    if (!elements.length) {
      return [];
    }

    const { document, past } = get();
    const clones = elements
      .slice()
      .sort((left, right) => left.zIndex - right.zIndex)
      .map((element) => duplicateElement(element));
    const nextElements = orderElements(
      [...document.elements, ...clones].map((element, index) => ({
        ...element,
        zIndex: index + 1,
      }))
    );

    set({
      document: patchDocument(document, {
        elements: nextElements,
      }),
      past: [...past, document].slice(-HISTORY_LIMIT),
      future: [],
      selectedElementId: clones.at(-1)?.id ?? null,
      selectedElementIds: clones.map((clone) => clone.id),
    });

    return clones;
  },
}));
