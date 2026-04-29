import type { EditorViewport, Point, Size } from "./editorTypes";

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 5;

export type EdgeInsets = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export function clampZoom(scale: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale));
}

export function getEditorArtboardInsets(container: Size): EdgeInsets {
  const compact = container.width < 768;
  const shortViewport = container.height < 620;

  if (compact) {
    return {
      top: shortViewport ? 22 : 18,
      right: shortViewport ? 14 : 12,
      bottom: shortViewport ? 24 : 16,
      left: shortViewport ? 20 : 18,
    };
  }

  if (container.width < 1024) {
    return {
      top: shortViewport ? 26 : 20,
      right: shortViewport ? 18 : 16,
      bottom: shortViewport ? 24 : 18,
      left: shortViewport ? 24 : 22,
    };
  }

  return {
    top: shortViewport ? 30 : 24,
    right: shortViewport ? 20 : 18,
    bottom: shortViewport ? 26 : 20,
    left: shortViewport ? 28 : 24,
  };
}

function normalizeInsets(padding: number | EdgeInsets): EdgeInsets {
  if (typeof padding === "number") {
    return {
      top: padding,
      right: padding,
      bottom: padding,
      left: padding,
    };
  }

  return padding;
}

export function getFitArtboardSize(
  container: Size,
  aspectRatio: number,
  padding: number | EdgeInsets
): Size {
  const insets = normalizeInsets(padding);
  const safeWidth = Math.max(container.width - insets.left - insets.right, 120);
  const safeHeight = Math.max(container.height - insets.top - insets.bottom, 120);

  const widthDrivenHeight = safeWidth / aspectRatio;

  if (widthDrivenHeight <= safeHeight) {
    return {
      width: safeWidth,
      height: widthDrivenHeight,
    };
  }

  return {
    width: safeHeight * aspectRatio,
    height: safeHeight,
  };
}

export function zoomAroundPoint(
  viewport: EditorViewport,
  nextScale: number,
  focus: Point,
  container: Size
): EditorViewport {
  const scale = clampZoom(nextScale);
  const center = {
    x: container.width / 2,
    y: container.height / 2,
  };

  const localX = (focus.x - center.x - viewport.offsetX) / viewport.scale;
  const localY = (focus.y - center.y - viewport.offsetY) / viewport.scale;

  return {
    scale,
    offsetX: focus.x - center.x - localX * scale,
    offsetY: focus.y - center.y - localY * scale,
  };
}

export function getStepZoom(
  viewport: EditorViewport,
  delta: number,
  container: Size
) {
  const focus = {
    x: container.width / 2,
    y: container.height / 2,
  };

  return zoomAroundPoint(viewport, viewport.scale + delta, focus, container);
}

export function getTouchDistance(touches: TouchList) {
  if (touches.length < 2) {
    return 0;
  }

  const [first, second] = [touches[0], touches[1]];
  return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
}

export function getTouchCenter(touches: TouchList): Point {
  const [first, second] = [touches[0], touches[1]];
  return {
    x: (first.clientX + second.clientX) / 2,
    y: (first.clientY + second.clientY) / 2,
  };
}
