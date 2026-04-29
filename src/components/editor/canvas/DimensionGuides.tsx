"use client";

import { Group, Line, Rect, Text } from "react-konva";

type DimensionGuidesProps = {
  width: number;
  height: number;
  widthCm: number;
  heightCm: number;
};

const GUIDE_COLOR = "rgba(28, 39, 47, 0.62)";
const LABEL_BG = "rgba(253, 252, 248, 0.94)";

function ArrowLine({
  points,
}: {
  points: number[];
}) {
  return (
    <Line
      points={points}
      stroke={GUIDE_COLOR}
      strokeWidth={1.4}
      dash={[4, 4]}
      listening={false}
    />
  );
}

export function DimensionGuides({
  width,
  height,
  widthCm,
  heightCm,
}: DimensionGuidesProps) {
  const left = -width / 2;
  const right = width / 2;
  const top = -height / 2;
  const bottom = height / 2;
  const horizontalGuideY = top - 34;
  const verticalGuideX = left - 36;
  const widthLabel = `${widthCm} cm`;
  const heightLabel = `${heightCm} cm`;

  return (
    <Group listening={false}>
      <ArrowLine points={[left, top - 10, left, horizontalGuideY]} />
      <ArrowLine points={[right, top - 10, right, horizontalGuideY]} />
      <Line
        points={[left, horizontalGuideY, right, horizontalGuideY]}
        stroke={GUIDE_COLOR}
        strokeWidth={1.4}
        listening={false}
      />
      <Line
        points={[left, horizontalGuideY, left + 9, horizontalGuideY - 5, left + 9, horizontalGuideY + 5]}
        stroke={GUIDE_COLOR}
        strokeWidth={1.4}
        lineCap="round"
        lineJoin="round"
        listening={false}
      />
      <Line
        points={[right, horizontalGuideY, right - 9, horizontalGuideY - 5, right - 9, horizontalGuideY + 5]}
        stroke={GUIDE_COLOR}
        strokeWidth={1.4}
        lineCap="round"
        lineJoin="round"
        listening={false}
      />
      <Rect
        x={-38}
        y={horizontalGuideY - 14}
        width={76}
        height={22}
        cornerRadius={999}
        fill={LABEL_BG}
        stroke="rgba(28, 39, 47, 0.08)"
        strokeWidth={1}
        listening={false}
      />
      <Text
        x={-38}
        y={horizontalGuideY - 8}
        width={76}
        align="center"
        text={widthLabel}
        fontSize={11}
        fontStyle="600"
        fill="#1c272f"
        listening={false}
      />

      <ArrowLine points={[left - 10, top, verticalGuideX, top]} />
      <ArrowLine points={[left - 10, bottom, verticalGuideX, bottom]} />
      <Line
        points={[verticalGuideX, top, verticalGuideX, bottom]}
        stroke={GUIDE_COLOR}
        strokeWidth={1.4}
        listening={false}
      />
      <Line
        points={[verticalGuideX, top, verticalGuideX - 5, top + 9, verticalGuideX + 5, top + 9]}
        stroke={GUIDE_COLOR}
        strokeWidth={1.4}
        lineCap="round"
        lineJoin="round"
        listening={false}
      />
      <Line
        points={[verticalGuideX, bottom, verticalGuideX - 5, bottom - 9, verticalGuideX + 5, bottom - 9]}
        stroke={GUIDE_COLOR}
        strokeWidth={1.4}
        lineCap="round"
        lineJoin="round"
        listening={false}
      />
      <Rect
        x={verticalGuideX - 12}
        y={-38}
        width={24}
        height={76}
        cornerRadius={999}
        fill={LABEL_BG}
        stroke="rgba(28, 39, 47, 0.08)"
        strokeWidth={1}
        listening={false}
      />
      <Text
        x={verticalGuideX - 12}
        y={-38}
        width={24}
        height={76}
        align="center"
        verticalAlign="middle"
        text={heightLabel}
        fontSize={11}
        fontStyle="600"
        fill="#1c272f"
        rotation={-90}
        offsetX={12}
        offsetY={38}
        listening={false}
      />
    </Group>
  );
}
