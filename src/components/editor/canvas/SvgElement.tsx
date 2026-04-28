"use client";

import { memo } from "react";
import type Konva from "konva";
import { Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import { editorAssetMap } from "@/lib/editor/editorAssets";
import type { EditorElement } from "@/lib/editor/editorTypes";

type SvgElementProps = {
  element: EditorElement;
  isSelected: boolean;
  artboardWidth: number;
  artboardHeight: number;
  onSelect: (id: string) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
  registerNode?: (id: string, node: Konva.Image | null) => void;
  interactive?: boolean;
  opacity?: number;
};

function SvgElementComponent({
  element,
  isSelected,
  artboardWidth,
  artboardHeight,
  onSelect,
  onDragEnd,
  registerNode,
  interactive = true,
  opacity = 1,
}: SvgElementProps) {
  const asset = editorAssetMap[element.assetId];
  const [image] = useImage(asset?.src ?? "", "anonymous");

  if (!asset) {
    return null;
  }

  const width = element.width * artboardWidth;
  const height = element.height * artboardHeight;
  const x = -artboardWidth / 2 + element.x * artboardWidth;
  const y = -artboardHeight / 2 + element.y * artboardHeight;

  return (
    <KonvaImage
      ref={(node) => registerNode?.(element.id, node)}
      image={image}
      x={x}
      y={y}
      width={width}
      height={height}
      offsetX={width / 2}
      offsetY={height / 2}
      rotation={element.rotation}
      scaleX={element.flipX ? -1 : 1}
      scaleY={element.flipY ? -1 : 1}
      opacity={opacity}
      listening={interactive}
      draggable={interactive && isSelected}
      perfectDrawEnabled={false}
      onClick={interactive ? () => onSelect(element.id) : undefined}
      onTap={interactive ? () => onSelect(element.id) : undefined}
      onDragEnd={
        interactive
          ? (event) => onDragEnd(element.id, event.target.x(), event.target.y())
          : undefined
      }
    />
  );
}

export const SvgElement = memo(SvgElementComponent);
