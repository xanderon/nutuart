import type { EditorViewport, Point, Size } from "./editorTypes";

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 5;

export function clampZoom(scale: number) {
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale));
}

export function getFitArtboardSize(
  container: Size,
  aspectRatio: number,
  padding: number
): Size {
  const safeWidth = Math.max(container.width - padding * 2, 120);
  const safeHeight = Math.max(container.height - padding * 2, 120);

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
