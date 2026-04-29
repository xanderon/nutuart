"use client";

import { create } from "zustand";
import { defaultEditorDocument, defaultViewport } from "./editorDefaults";
import { editorAssetMap } from "./editorAssets";
import { getFitArtboardSize } from "./viewportUtils";
import {
  clamp,
  createEditorId,
  duplicateElement,
  ELEMENT_POSITION_MAX,
  ELEMENT_POSITION_MIN,
  getDefaultElementSize,
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
  addElement: (assetId: string) => void;
  updateElement: (
    id: string,
    next:
      | Partial<EditorElement>
      | ((current: EditorElement) => Partial<EditorElement> | EditorElement)
  ) => void;
  deleteSelectedElement: () => void;
  duplicateSelectedElement: () => void;
  flipSelectedElement: (axis: "x" | "y") => void;
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

const HISTORY_LIMIT = 80;

export const useEditorStore = create<EditorStore>((set, get) => ({
  isStarted: false,
  activePanel: null,
  document: defaultEditorDocument,
  past: [],
  future: [],
  selectedElementId: null,
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
        width: Math.max(state.canvasSize.width, 320),
        height: Math.max(state.canvasSize.height, 320),
      };
      const padding =
        safeCanvas.width >= 1024 ? 42 : safeCanvas.width >= 768 ? 32 : 20;
      const previousFit = getFitArtboardSize(
        safeCanvas,
        previousWidthCm / previousHeightCm,
        padding
      );
      const nextFit = getFitArtboardSize(
        safeCanvas,
        nextWidthCm / nextHeightCm,
        padding
      );
      const nextDocument = patchDocument(state.document, {
        widthCm: nextWidthCm,
        heightCm: nextHeightCm,
        elements: state.document.elements.map((element) => {
          const previousPixelX = element.x * previousFit.width;
          const previousPixelY = element.y * previousFit.height;
          const previousPixelWidth = element.width * previousFit.width;
          const previousPixelHeight = element.height * previousFit.height;

          return {
            ...element,
            x: roundTo(previousPixelX / nextFit.width),
            y: roundTo(previousPixelY / nextFit.height),
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
      viewport: defaultViewport,
    }),
  canUndo: () => get().past.length > 0,
  canRedo: () => get().future.length > 0,
  selectElement: (selectedElementId) => set({ selectedElementId }),
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
  deleteSelectedElement: () => {
    const { document, selectedElementId } = get();

    if (!selectedElementId) {
      return;
    }

    set({
      document: patchDocument(document, {
        elements: document.elements.filter((item) => item.id !== selectedElementId),
      }),
      past: [...get().past, document].slice(-HISTORY_LIMIT),
      future: [],
      selectedElementId: null,
    });
  },
  duplicateSelectedElement: () => {
    const { document, selectedElementId } = get();

    if (!selectedElementId) {
      return;
    }

    const selected = document.elements.find((item) => item.id === selectedElementId);

    if (!selected) {
      return;
    }

    const clone = duplicateElement(selected);

    set({
      document: patchDocument(document, {
        elements: orderElements(
          [...document.elements, clone].map((element, index) => ({
            ...element,
            zIndex: index + 1,
          }))
        ),
      }),
      past: [...get().past, document].slice(-HISTORY_LIMIT),
      future: [],
      selectedElementId: clone.id,
    });
  },
  flipSelectedElement: (axis) => {
    const { selectedElementId } = get();

    if (!selectedElementId) {
      return;
    }

    get().updateElement(selectedElementId, (element) =>
      axis === "x"
        ? { flipX: !element.flipX }
        : { flipY: !element.flipY }
    );
  },
}));
