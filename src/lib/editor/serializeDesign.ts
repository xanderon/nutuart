import { defaultEditorDocument } from "./editorDefaults";
import { editorAssetMap } from "./editorAssets";
import { clamp, orderElements, roundTo, sanitizeDimension } from "./geometryUtils";
import type { EditorDocument, EditorElement } from "./editorTypes";

function sanitizeElement(input: Partial<EditorElement>, index: number): EditorElement | null {
  if (!input.id || !input.assetId || !editorAssetMap[input.assetId]) {
    return null;
  }

  const width = clamp(Number(input.width ?? 0.18), 0.04, 1);
  const height = clamp(Number(input.height ?? 0.18), 0.04, 1);

  return {
    id: input.id,
    assetId: input.assetId,
    x: roundTo(clamp(Number(input.x ?? 0.5), 0, 1)),
    y: roundTo(clamp(Number(input.y ?? 0.5), 0, 1)),
    width: roundTo(width),
    height: roundTo(height),
    rotation: roundTo(Number(input.rotation ?? 0), 2),
    flipX: Boolean(input.flipX),
    flipY: Boolean(input.flipY),
    zIndex: Number.isFinite(input.zIndex) ? Number(input.zIndex) : index + 1,
  };
}

export function serializeDesign(document: EditorDocument) {
  return JSON.stringify(
    {
      ...document,
      elements: orderElements(document.elements),
    },
    null,
    2
  );
}

export function parseSerializedDesign(raw: string): EditorDocument {
  const input = JSON.parse(raw) as Partial<EditorDocument>;
  const version = Number(input.version ?? 1);
  const elements = Array.isArray(input.elements)
    ? input.elements
        .map((element, index) => sanitizeElement(element, index))
        .filter((element): element is EditorElement => Boolean(element))
    : [];

  return {
    version,
    productType:
      input.productType === "glass" || input.productType === "mirror"
        ? input.productType
        : defaultEditorDocument.productType,
    projectName:
      typeof input.projectName === "string" && input.projectName.trim()
        ? input.projectName.trim()
        : defaultEditorDocument.projectName,
    shape:
      input.shape === "rectangle" || input.shape === "oval" || input.shape === "arch"
        ? input.shape
        : defaultEditorDocument.shape,
    widthCm: sanitizeDimension(Number(input.widthCm ?? defaultEditorDocument.widthCm)),
    heightCm: sanitizeDimension(Number(input.heightCm ?? defaultEditorDocument.heightCm)),
    elements: orderElements(elements).map((element, index) => ({
      ...element,
      zIndex: index + 1,
    })),
  };
}
