import type {
  EditorDocument,
  EditorElement,
  EditorShape,
  Point,
  Size,
  SvgAssetDefinition,
} from "./editorTypes";
import { MAX_DIMENSION_CM, MIN_DIMENSION_CM } from "./editorDefaults";

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function roundTo(value: number, digits = 4) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

export function sanitizeDimension(value: number) {
  if (!Number.isFinite(value)) {
    return MIN_DIMENSION_CM;
  }

  return clamp(Math.round(value), MIN_DIMENSION_CM, MAX_DIMENSION_CM);
}

export function getAspectRatio(widthCm: number, heightCm: number) {
  return sanitizeDimension(widthCm) / sanitizeDimension(heightCm);
}

export function getDefaultElementSize(asset: SvgAssetDefinition): Size {
  const aspect = asset.naturalWidth / asset.naturalHeight || 1;
  let width = asset.defaultWidthRatio ?? 0.18;
  let height = width / aspect;
  const maxSide = 0.24;
  const minSide = 0.09;

  if (width > maxSide || height > maxSide) {
    const scale = maxSide / Math.max(width, height);
    width *= scale;
    height *= scale;
  }

  if (width < minSide && aspect >= 1) {
    const scale = minSide / width;
    width *= scale;
    height *= scale;
  }

  if (height < minSide && aspect < 1) {
    const scale = minSide / height;
    width *= scale;
    height *= scale;
  }

  return {
    width: roundTo(width),
    height: roundTo(height),
  };
}

export function getDisplayDimensions(widthCm: number, heightCm: number) {
  return `${sanitizeDimension(widthCm)} × ${sanitizeDimension(heightCm)} cm`;
}

export function isElementOutOfBounds(element: EditorElement) {
  const left = element.x - element.width / 2;
  const right = element.x + element.width / 2;
  const top = element.y - element.height / 2;
  const bottom = element.y + element.height / 2;

  return left < 0 || right > 1 || top < 0 || bottom > 1;
}

export function duplicateElement(element: EditorElement): EditorElement {
  return {
    ...element,
    id: createEditorId("element"),
    x: clamp(roundTo(element.x + 0.04), 0.1, 0.9),
    y: clamp(roundTo(element.y + 0.04), 0.1, 0.9),
    zIndex: element.zIndex + 1,
  };
}

export function orderElements(elements: EditorElement[]) {
  return [...elements].sort((left, right) => left.zIndex - right.zIndex);
}

export function getSelectionStatus(
  document: EditorDocument,
  selectedElementId: string | null
) {
  if (!selectedElementId) {
    return null;
  }

  const element = document.elements.find((item) => item.id === selectedElementId);

  if (!element) {
    return null;
  }

  return {
    element,
    isOutOfBounds: isElementOutOfBounds(element),
  };
}

export function createEditorId(prefix: string) {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

type PathContext = {
  rect: (x: number, y: number, width: number, height: number) => void;
  ellipse: (
    x: number,
    y: number,
    radiusX: number,
    radiusY: number,
    rotation: number,
    startAngle: number,
    endAngle: number
  ) => void;
  moveTo: (x: number, y: number) => void;
  lineTo: (x: number, y: number) => void;
  quadraticCurveTo: (
    cpx: number,
    cpy: number,
    x: number,
    y: number
  ) => void;
  closePath: () => void;
};

export function drawArtboardPath(
  context: PathContext,
  shape: EditorShape,
  x: number,
  y: number,
  width: number,
  height: number
) {
  if (shape === "rectangle") {
    context.rect(x, y, width, height);
    return;
  }

  if (shape === "oval") {
    context.ellipse(
      x + width / 2,
      y + height / 2,
      width / 2,
      height / 2,
      0,
      0,
      Math.PI * 2
    );
    return;
  }

  const archHeight = Math.min(height * 0.36, width * 0.45);
  context.moveTo(x, y + height);
  context.lineTo(x, y + archHeight);
  context.quadraticCurveTo(x + width / 2, y - archHeight * 0.22, x + width, y + archHeight);
  context.lineTo(x + width, y + height);
  context.closePath();
}

export function getNormalizedPoint(
  point: Point,
  artboard: Size,
  offset: Point
): Point {
  return {
    x: roundTo(clamp((point.x - offset.x) / artboard.width, 0, 1)),
    y: roundTo(clamp((point.y - offset.y) / artboard.height, 0, 1)),
  };
}
