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
  onPointerDown?: (id: string, event: Konva.KonvaEventObject<PointerEvent>) => void;
  onPointerUp?: (id: string) => void;
  onDragStart?: (id: string, x: number, y: number) => void;
  onDragMove?: (id: string, x: number, y: number) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
  registerNode?: (id: string, node: Konva.Image | null) => void;
  interactive?: boolean;
  allowDrag?: boolean;
  opacity?: number;
};

function SvgElementComponent({
  element,
  isSelected,
  artboardWidth,
  artboardHeight,
  onSelect,
  onPointerDown,
  onPointerUp,
  onDragStart,
  onDragMove,
  onDragEnd,
  registerNode,
  interactive = true,
  allowDrag,
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
      draggable={allowDrag ?? (interactive && isSelected)}
      perfectDrawEnabled={false}
      onClick={interactive ? () => onSelect(element.id) : undefined}
      onTap={interactive ? () => onSelect(element.id) : undefined}
      onMouseEnter={
        interactive
          ? (event) => {
              const container = event.target.getStage()?.container();

              if (container) {
                container.style.cursor = allowDrag ?? isSelected ? "move" : "pointer";
              }
            }
          : undefined
      }
      onMouseLeave={
        interactive
          ? (event) => {
              const container = event.target.getStage()?.container();

              if (container) {
                container.style.cursor = "";
              }
            }
          : undefined
      }
      onPointerDown={
        interactive && onPointerDown
          ? (event) => onPointerDown(element.id, event)
          : undefined
      }
      onPointerUp={interactive ? () => onPointerUp?.(element.id) : undefined}
      onPointerLeave={interactive ? () => onPointerUp?.(element.id) : undefined}
      onDragStart={
        interactive && onDragStart
          ? (event) => onDragStart(element.id, event.target.x(), event.target.y())
          : undefined
      }
      onDragMove={
        interactive && onDragMove
          ? (event) => onDragMove(element.id, event.target.x(), event.target.y())
          : undefined
      }
      onDragEnd={
        interactive
          ? (event) => onDragEnd(element.id, event.target.x(), event.target.y())
          : undefined
      }
    />
  );
}

export const SvgElement = memo(SvgElementComponent);
