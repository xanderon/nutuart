"use client";

import { useEffect, useRef } from "react";
import { Transformer } from "react-konva";
import type Konva from "konva";
import type { MutableRefObject } from "react";

type TransformHandlesProps = {
  selectedElementIds: string[];
  nodeMapRef: MutableRefObject<Record<string, Konva.Image | null>>;
  artboardWidth: number;
  artboardHeight: number;
  showRotateHandle: boolean;
  onTransform: () => void;
  onTransformEnd: () => void;
};

export function TransformHandles({
  selectedElementIds,
  nodeMapRef,
  artboardWidth,
  artboardHeight,
  showRotateHandle,
  onTransform,
  onTransformEnd,
}: TransformHandlesProps) {
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (!transformerRef.current) {
      return;
    }

    const nodes = selectedElementIds
      .map((id) => nodeMapRef.current[id])
      .filter((node): node is Konva.Image => Boolean(node));
    transformerRef.current.nodes(nodes);
    transformerRef.current.getLayer()?.batchDraw();
  }, [nodeMapRef, selectedElementIds]);

  return (
    <Transformer
      ref={transformerRef}
      onTransform={onTransform}
      onTransformEnd={onTransformEnd}
      padding={10}
      enabledAnchors={[
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
      ]}
      rotateEnabled={showRotateHandle}
      rotateAnchorOffset={34}
      borderStroke="#0d6b72"
      borderStrokeWidth={1.2}
      borderDash={[6, 4]}
      anchorSize={20}
      anchorStroke="#0d6b72"
      anchorFill="#ffffff"
      anchorCornerRadius={14}
      keepRatio={false}
      flipEnabled={false}
      ignoreStroke
      boundBoxFunc={(oldBox, nextBox) => {
        const minWidth = Math.max(28, artboardWidth * 0.04);
        const minHeight = Math.max(28, artboardHeight * 0.04);
        const width = Math.min(
          artboardWidth,
          Math.max(minWidth, Math.abs(nextBox.width))
        );
        const height = Math.min(
          artboardHeight,
          Math.max(minHeight, Math.abs(nextBox.height))
        );

        if (!Number.isFinite(width) || !Number.isFinite(height)) {
          return oldBox;
        }

        return {
          ...nextBox,
          width: nextBox.width < 0 ? -width : width,
          height: nextBox.height < 0 ? -height : height,
        };
      }}
    />
  );
}
