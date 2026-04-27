"use client";

import { useEffect, useRef } from "react";
import { Transformer } from "react-konva";
import type Konva from "konva";
import type { MutableRefObject } from "react";

type TransformHandlesProps = {
  selectedElementId: string | null;
  nodeMapRef: MutableRefObject<Record<string, Konva.Image | null>>;
  artboardWidth: number;
  artboardHeight: number;
  onTransformEnd: () => void;
};

export function TransformHandles({
  selectedElementId,
  nodeMapRef,
  artboardWidth,
  artboardHeight,
  onTransformEnd,
}: TransformHandlesProps) {
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (!transformerRef.current) {
      return;
    }

    const node = selectedElementId ? nodeMapRef.current[selectedElementId] : null;
    transformerRef.current.nodes(node ? [node] : []);
    transformerRef.current.getLayer()?.batchDraw();
  }, [nodeMapRef, selectedElementId]);

  return (
    <Transformer
      ref={transformerRef}
      onTransformEnd={onTransformEnd}
      enabledAnchors={[
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
      ]}
      rotateEnabled
      rotateAnchorOffset={26}
      borderStroke="#0d6b72"
      borderStrokeWidth={1.2}
      borderDash={[6, 4]}
      anchorSize={14}
      anchorStroke="#0d6b72"
      anchorFill="#ffffff"
      anchorCornerRadius={10}
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
