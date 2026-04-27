"use client";

import { Ellipse, Rect, Shape } from "react-konva";
import { drawArtboardPath } from "@/lib/editor/geometryUtils";
import type { EditorShape } from "@/lib/editor/editorTypes";

type ArtboardShapeProps = {
  shape: EditorShape;
  width: number;
  height: number;
};

export function ArtboardShape({ shape, width, height }: ArtboardShapeProps) {
  const left = -width / 2;
  const top = -height / 2;

  if (shape === "rectangle") {
    return (
      <Rect
        x={left}
        y={top}
        width={width}
        height={height}
        cornerRadius={28}
        fill="#fdfcf8"
        stroke="rgba(24, 23, 18, 0.2)"
        strokeWidth={2}
        shadowColor="rgba(11, 19, 27, 0.25)"
        shadowBlur={24}
        shadowOffsetY={12}
      />
    );
  }

  if (shape === "oval") {
    return (
      <Ellipse
        x={0}
        y={0}
        radiusX={width / 2}
        radiusY={height / 2}
        fill="#fdfcf8"
        stroke="rgba(24, 23, 18, 0.2)"
        strokeWidth={2}
        shadowColor="rgba(11, 19, 27, 0.25)"
        shadowBlur={24}
        shadowOffsetY={12}
      />
    );
  }

  return (
    <Shape
      fill="#fdfcf8"
      stroke="rgba(24, 23, 18, 0.2)"
      strokeWidth={2}
      shadowColor="rgba(11, 19, 27, 0.25)"
      shadowBlur={24}
      shadowOffsetY={12}
      sceneFunc={(context, shapeNode) => {
        context.beginPath();
        drawArtboardPath(context, shape, left, top, width, height);
        context.closePath();
        context.fillStrokeShape(shapeNode);
      }}
    />
  );
}
