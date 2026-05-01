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
  interactive?: boolean;
  onTransform: () => void;
  onTransformEnd: () => void;
};

export function TransformHandles({
  selectedElementIds,
  nodeMapRef,
  artboardWidth,
  artboardHeight,
  interactive = true,
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

  useEffect(() => {
    if (interactive) {
      return;
    }

    transformerRef.current?.stopTransform();
  }, [interactive]);

  return (
    <Transformer
      ref={transformerRef}
      onTransform={onTransform}
      onTransformEnd={onTransformEnd}
      padding={0}
      enabledAnchors={[
        "top-left",
        "top-center",
        "top-right",
        "middle-left",
        "middle-right",
        "bottom-left",
        "bottom-center",
        "bottom-right",
      ]}
      rotateEnabled
      rotateAnchorCursor="grab"
      rotateAnchorOffset={28}
      borderStroke="#0d6b72"
      borderStrokeWidth={1}
      borderDash={[6, 4]}
      listening={interactive}
      anchorSize={16}
      anchorStroke="#0d6b72"
      anchorFill="#ffffff"
      anchorCornerRadius={14}
      anchorStyleFunc={(anchor) => {
        if (anchor.hasName("rotater")) {
          anchor.fill("#0d6b72");
          anchor.stroke("#ffffff");
          anchor.strokeWidth(2);
          anchor.cornerRadius(anchor.width() / 2);
          return;
        }

        if (anchor.hasName("top-center") || anchor.hasName("bottom-center")) {
          anchor.width(18);
          anchor.height(6);
          anchor.offsetX(9);
          anchor.offsetY(3);
          anchor.cornerRadius(999);
        } else if (
          anchor.hasName("middle-left") ||
          anchor.hasName("middle-right")
        ) {
          anchor.width(6);
          anchor.height(18);
          anchor.offsetX(3);
          anchor.offsetY(9);
          anchor.cornerRadius(999);
        } else {
          anchor.width(12);
          anchor.height(12);
          anchor.offsetX(6);
          anchor.offsetY(6);
          anchor.cornerRadius(999);
        }

        anchor.fill("rgba(255,255,255,0.94)");
        anchor.stroke("rgba(13,107,114,0.9)");
        anchor.strokeWidth(1.2);
      }}
      keepRatio
      centeredScaling={false}
      flipEnabled={false}
      ignoreStroke
      boundBoxFunc={(oldBox, nextBox) => {
        if (nextBox.width <= 0 || nextBox.height <= 0) {
          return oldBox;
        }

        const minWidth = Math.max(28, artboardWidth * 0.04);
        const minHeight = Math.max(28, artboardHeight * 0.04);
        const width = Math.min(artboardWidth, Math.max(minWidth, nextBox.width));
        const height = Math.min(
          artboardHeight,
          Math.max(minHeight, nextBox.height)
        );

        if (!Number.isFinite(width) || !Number.isFinite(height)) {
          return oldBox;
        }

        return {
          ...nextBox,
          width,
          height,
        };
      }}
    />
  );
}
