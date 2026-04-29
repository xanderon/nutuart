import type {
  EditorDocument,
  EditorElement,
  EditorShape,
  Point,
  Size,
  SvgAssetDefinition,
} from "./editorTypes";
import { MAX_DIMENSION_CM, MIN_DIMENSION_CM } from "./editorDefaults";

export const ELEMENT_POSITION_MIN = -8;
export const ELEMENT_POSITION_MAX = 9;

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

export function getDefaultElementSize(
  asset: SvgAssetDefinition,
  artboardAspectRatio = 1
): Size {
  const aspect = asset.naturalWidth / asset.naturalHeight || 1;
  let width = asset.defaultWidthRatio ?? 0.18;
  let height = (width * artboardAspectRatio) / aspect;
  const maxSide = 0.24;
  const minSide = 0.09;
  const getVisibleRatios = () => ({
    width,
    height: height / Math.max(artboardAspectRatio, 0.001),
  });

  const initialVisible = getVisibleRatios();

  if (initialVisible.width > maxSide || initialVisible.height > maxSide) {
    const scale =
      maxSide / Math.max(initialVisible.width, initialVisible.height);
    width *= scale;
    height *= scale;
  }

  const adjustedVisible = getVisibleRatios();

  if (adjustedVisible.width < minSide && aspect >= 1) {
    const scale = minSide / adjustedVisible.width;
    width *= scale;
    height *= scale;
  }

  const finalVisible = getVisibleRatios();

  if (finalVisible.height < minSide && aspect < 1) {
    const scale = minSide / finalVisible.height;
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

export function getElementBoundaryPoints(element: EditorElement): Point[] {
  const halfWidth = element.width / 2;
  const halfHeight = element.height / 2;
  const radians = (element.rotation * Math.PI) / 180;
  const cos = Math.cos(radians);
  const sin = Math.sin(radians);
  const offsets = [
    { x: -halfWidth, y: -halfHeight },
    { x: 0, y: -halfHeight },
    { x: halfWidth, y: -halfHeight },
    { x: halfWidth, y: 0 },
    { x: halfWidth, y: halfHeight },
    { x: 0, y: halfHeight },
    { x: -halfWidth, y: halfHeight },
    { x: -halfWidth, y: 0 },
  ];

  return offsets.map((offset) => ({
    x: element.x + offset.x * cos - offset.y * sin,
    y: element.y + offset.x * sin + offset.y * cos,
  }));
}

export function getElementsBoundingBox(elements: EditorElement[]) {
  if (!elements.length) {
    return null;
  }

  const points = elements.flatMap((element) => getElementBoundaryPoints(element));
  const xs = points.map((point) => point.x);
  const ys = points.map((point) => point.y);

  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys),
    centerX: (Math.min(...xs) + Math.max(...xs)) / 2,
    centerY: (Math.min(...ys) + Math.max(...ys)) / 2,
  };
}

function getArchHeightRatio(aspectRatio = 1) {
  return Math.min(0.42, Math.max(0.24, aspectRatio / 2));
}

function pointInArch(point: Point, aspectRatio = 1) {
  const archHeight = getArchHeightRatio(aspectRatio);

  if (point.x < 0 || point.x > 1 || point.y < 0 || point.y > 1) {
    return false;
  }

  if (point.y >= archHeight) {
    return true;
  }

  const normalizedX = (point.x - 0.5) / 0.5;
  const normalizedY = (point.y - archHeight) / archHeight;
  return normalizedX ** 2 + normalizedY ** 2 <= 1;
}

function pointInShape(point: Point, shape: EditorShape, aspectRatio = 1) {
  if (shape === "rectangle") {
    return point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1;
  }

  if (shape === "oval") {
    const normalizedX = (point.x - 0.5) / 0.5;
    const normalizedY = (point.y - 0.5) / 0.5;
    return normalizedX ** 2 + normalizedY ** 2 <= 1;
  }

  return pointInArch(point, aspectRatio);
}

export function isElementOutOfBounds(
  element: EditorElement,
  shape: EditorShape = "rectangle",
  aspectRatio = 1
) {
  return getElementBoundaryPoints(element).some(
    (point) => !pointInShape(point, shape, aspectRatio)
  );
}

export function duplicateElement(element: EditorElement): EditorElement {
  return {
    ...element,
    id: createEditorId("element"),
    x: clamp(
      roundTo(element.x + 0.04),
      ELEMENT_POSITION_MIN,
      ELEMENT_POSITION_MAX
    ),
    y: clamp(
      roundTo(element.y + 0.04),
      ELEMENT_POSITION_MIN,
      ELEMENT_POSITION_MAX
    ),
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
    isOutOfBounds: isElementOutOfBounds(
      element,
      document.shape,
      getAspectRatio(document.widthCm, document.heightCm)
    ),
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
  roundRect: (
    x: number,
    y: number,
    width: number,
    height: number,
    radii: number | number[]
  ) => void;
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
  bezierCurveTo: (
    cp1x: number,
    cp1y: number,
    cp2x: number,
    cp2y: number,
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
    context.roundRect(x, y, width, height, 12);
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

  const archHeight = height * getArchHeightRatio(width / height);
  const shoulderY = y + archHeight;

  context.moveTo(x, y + height);
  context.lineTo(x, shoulderY);
  context.ellipse(
    x + width / 2,
    shoulderY,
    width / 2,
    archHeight,
    0,
    Math.PI,
    0
  );
  context.lineTo(x + width, y + height);
  context.closePath();
}

export function getNormalizedPoint(
  point: Point,
  artboard: Size,
  offset: Point,
  min = 0,
  max = 1
): Point {
  return {
    x: roundTo(clamp((point.x - offset.x) / artboard.width, min, max)),
    y: roundTo(clamp((point.y - offset.y) / artboard.height, min, max)),
  };
}
