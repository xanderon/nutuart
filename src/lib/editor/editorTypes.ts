export type ProductType = "mirror" | "glass";

export type EditorShape = "rectangle" | "oval" | "arch";

export type SvgAssetCategory = "corners" | "flowers" | "geometric";

export type EditorPanel = "library" | "shapeSize" | "element" | "export" | null;

export interface SvgAssetDefinition {
  id: string;
  name: string;
  category: SvgAssetCategory;
  src: string;
  naturalWidth: number;
  naturalHeight: number;
  defaultWidthRatio?: number;
}

export interface EditorElement {
  id: string;
  assetId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  flipX: boolean;
  flipY: boolean;
  zIndex: number;
}

export interface EditorDocument {
  version: number;
  productType: ProductType;
  projectName: string;
  shape: EditorShape;
  widthCm: number;
  heightCm: number;
  elements: EditorElement[];
}

export interface EditorViewport {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export interface Point {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}
