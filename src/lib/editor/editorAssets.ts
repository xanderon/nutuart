import type { SvgAssetDefinition, SvgAssetCategory } from "./editorTypes";

export const svgAssetCategoryLabels: Record<SvgAssetCategory, string> = {
  corners: "Colțuri",
  flowers: "Flori",
  geometric: "Geometric",
};

export const editorSvgAssets: SvgAssetDefinition[] = [
  {
    id: "corner-01",
    name: "Colț ornamental 01",
    category: "corners",
    src: "/editorsvgfiles/corners/Untitled-1.svg",
    naturalWidth: 589.22,
    naturalHeight: 587.5,
    defaultWidthRatio: 0.16,
  },
  {
    id: "corner-02",
    name: "Colț ornamental 02",
    category: "corners",
    src: "/editorsvgfiles/corners/Untitled-2.svg",
    naturalWidth: 416.24,
    naturalHeight: 417.2,
    defaultWidthRatio: 0.16,
  },
  {
    id: "corner-03",
    name: "Colț ornamental 03",
    category: "corners",
    src: "/editorsvgfiles/corners/Untitled-3.svg",
    naturalWidth: 273.35,
    naturalHeight: 273.35,
    defaultWidthRatio: 0.15,
  },
  {
    id: "corner-04",
    name: "Colț ornamental 04",
    category: "corners",
    src: "/editorsvgfiles/corners/Untitled-4.svg",
    naturalWidth: 606.22,
    naturalHeight: 607.05,
    defaultWidthRatio: 0.16,
  },
  {
    id: "flower-01",
    name: "Floare verticală 01",
    category: "flowers",
    src: "/editorsvgfiles/flowers/Untitled-f1.svg",
    naturalWidth: 560.72,
    naturalHeight: 792.48,
    defaultWidthRatio: 0.14,
  },
  {
    id: "flower-02",
    name: "Floare verticală 02",
    category: "flowers",
    src: "/editorsvgfiles/flowers/Untitled-f2.svg",
    naturalWidth: 318.88,
    naturalHeight: 572.42,
    defaultWidthRatio: 0.12,
  },
  {
    id: "flower-03",
    name: "Floare rotundă",
    category: "flowers",
    src: "/editorsvgfiles/flowers/Untitled-f3.svg",
    naturalWidth: 530.61,
    naturalHeight: 549.15,
    defaultWidthRatio: 0.16,
  },
  {
    id: "flower-04",
    name: "Bordură florală",
    category: "flowers",
    src: "/editorsvgfiles/flowers/Untitled-f4.svg",
    naturalWidth: 814.14,
    naturalHeight: 195.55,
    defaultWidthRatio: 0.24,
  },
  {
    id: "geometric-01",
    name: "Cadru geometric",
    category: "geometric",
    src: "/editorsvgfiles/shapes/Untitled-s1.svg",
    naturalWidth: 328.52,
    naturalHeight: 328.52,
    defaultWidthRatio: 0.2,
  },
  {
    id: "geometric-02",
    name: "Sigiliu geometric",
    category: "geometric",
    src: "/editorsvgfiles/shapes/Untitled-s2.svg",
    naturalWidth: 226.72,
    naturalHeight: 226.72,
    defaultWidthRatio: 0.2,
  },
];

export const editorAssetMap = Object.fromEntries(
  editorSvgAssets.map((asset) => [asset.id, asset])
) as Record<string, SvgAssetDefinition>;
