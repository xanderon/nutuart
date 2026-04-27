import type {
  EditorDocument,
  EditorShape,
  EditorViewport,
  ProductType,
} from "./editorTypes";

export const MIN_DIMENSION_CM = 20;
export const MAX_DIMENSION_CM = 320;

export const productOptions: Array<{ value: ProductType; label: string }> = [
  { value: "mirror", label: "Oglindă" },
  { value: "glass", label: "Sticlă" },
];

export const shapeOptions: Array<{
  value: EditorShape;
  label: string;
  description: string;
}> = [
  {
    value: "rectangle",
    label: "Dreptunghi",
    description: "Suprafață clasică, simplă.",
  },
  {
    value: "oval",
    label: "Oval",
    description: "Muchii moi pentru compoziții decorative.",
  },
  {
    value: "arch",
    label: "Arcadă",
    description: "Formă cu vârf rotunjit pentru oglinzi verticale.",
  },
];

export const defaultViewport: EditorViewport = {
  scale: 1,
  offsetX: 0,
  offsetY: 0,
};

export const defaultEditorDocument: EditorDocument = {
  version: 1,
  productType: "mirror",
  projectName: "Design nou",
  shape: "arch",
  widthCm: 80,
  heightCm: 140,
  elements: [],
};
