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

function getElementBoundaryPoints(element: EditorElement): Point[] {
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

function pointInPolygon(point: Point, polygon: Point[]) {
  let inside = false;

  for (let index = 0, previous = polygon.length - 1; index < polygon.length; previous = index++) {
    const currentPoint = polygon[index];
    const previousPoint = polygon[previous];

    if (!currentPoint || !previousPoint) {
      continue;
    }

    const intersects =
      currentPoint.y > point.y !== previousPoint.y > point.y &&
      point.x <
        ((previousPoint.x - currentPoint.x) * (point.y - currentPoint.y)) /
          (previousPoint.y - currentPoint.y) +
          currentPoint.x;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

function cubicBezierPoint(
  start: Point,
  cp1: Point,
  cp2: Point,
  end: Point,
  t: number
) {
  const oneMinusT = 1 - t;

  return {
    x:
      oneMinusT ** 3 * start.x +
      3 * oneMinusT ** 2 * t * cp1.x +
      3 * oneMinusT * t ** 2 * cp2.x +
      t ** 3 * end.x,
    y:
      oneMinusT ** 3 * start.y +
      3 * oneMinusT ** 2 * t * cp1.y +
      3 * oneMinusT * t ** 2 * cp2.y +
      t ** 3 * end.y,
  };
}

function pointInArch(point: Point) {
  const archHeight = 0.42;
  const shoulderY = archHeight;
  const cpOffsetX = 0.18;
  const cpTopY = -archHeight * 0.08;
  const leftCurveStart = { x: 0, y: shoulderY };
  const leftCurveCp1 = { x: 0, y: archHeight * 0.28 };
  const leftCurveCp2 = { x: cpOffsetX, y: cpTopY };
  const topCenter = { x: 0.5, y: 0 };
  const rightCurveCp1 = { x: 1 - cpOffsetX, y: cpTopY };
  const rightCurveCp2 = { x: 1, y: archHeight * 0.28 };
  const rightCurveEnd = { x: 1, y: shoulderY };
  const curveSamples = Array.from({ length: 13 }, (_, index) => index / 12);
  const polygon: Point[] = [{ x: 0, y: 1 }, leftCurveStart];

  curveSamples.slice(1).forEach((t) => {
    polygon.push(
      cubicBezierPoint(leftCurveStart, leftCurveCp1, leftCurveCp2, topCenter, t)
    );
  });

  curveSamples.slice(1).forEach((t) => {
    polygon.push(
      cubicBezierPoint(topCenter, rightCurveCp1, rightCurveCp2, rightCurveEnd, t)
    );
  });

  polygon.push({ x: 1, y: 1 });

  return pointInPolygon(point, polygon);
}

function pointInShape(point: Point, shape: EditorShape) {
  if (shape === "rectangle") {
    return point.x >= 0 && point.x <= 1 && point.y >= 0 && point.y <= 1;
  }

  if (shape === "oval") {
    const normalizedX = (point.x - 0.5) / 0.5;
    const normalizedY = (point.y - 0.5) / 0.5;
    return normalizedX ** 2 + normalizedY ** 2 <= 1;
  }

  return pointInArch(point);
}

export function isElementOutOfBounds(
  element: EditorElement,
  shape: EditorShape = "rectangle"
) {
  return getElementBoundaryPoints(element).some(
    (point) => !pointInShape(point, shape)
  );
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
    isOutOfBounds: isElementOutOfBounds(element, document.shape),
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

  const archHeight = Math.min(height * 0.42, width * 0.5);
  const shoulderY = y + archHeight;
  const cpOffsetX = width * 0.18;
  const cpTopY = y - archHeight * 0.08;

  context.moveTo(x, y + height);
  context.lineTo(x, shoulderY);
  context.bezierCurveTo(
    x,
    y + archHeight * 0.28,
    x + cpOffsetX,
    cpTopY,
    x + width / 2,
    y
  );
  context.bezierCurveTo(
    x + width - cpOffsetX,
    cpTopY,
    x + width,
    y + archHeight * 0.28,
    x + width,
    shoulderY
  );
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
