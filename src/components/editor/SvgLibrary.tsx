import Image from "next/image";
import { editorSvgAssets, svgAssetCategoryLabels } from "@/lib/editor/editorAssets";
import { cn } from "@/lib/utils";
import type { SvgAssetCategory } from "@/lib/editor/editorTypes";

type SvgLibraryProps = {
  activeCategory: SvgAssetCategory;
  onCategoryChange: (category: SvgAssetCategory) => void;
  onAddAsset: (assetId: string) => void;
};

export function SvgLibrary({
  activeCategory,
  onCategoryChange,
  onAddAsset,
}: SvgLibraryProps) {
  const assets = editorSvgAssets.filter((asset) => asset.category === activeCategory);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1" data-editor-scroll>
        {(Object.keys(svgAssetCategoryLabels) as SvgAssetCategory[]).map((category) => {
          const isActive = category === activeCategory;

          return (
            <button
              key={category}
              type="button"
              onClick={() => onCategoryChange(category)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition",
                isActive
                  ? "bg-[var(--editor-ink)] text-white"
                  : "bg-black/5 text-[var(--editor-muted)] hover:bg-black/8"
              )}
            >
              {svgAssetCategoryLabels[category]}
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {assets.map((asset) => (
          <button
            key={asset.id}
            type="button"
            onClick={() => onAddAsset(asset.id)}
            className="group overflow-hidden rounded-[1.05rem] border border-[var(--editor-line)] bg-white/90 text-left transition duration-150 hover:-translate-y-0.5 hover:border-[var(--editor-line-strong)]"
          >
            <div className="editor-grid-bg relative flex aspect-square items-center justify-center bg-[linear-gradient(180deg,rgba(255,255,255,0.85),rgba(240,236,228,0.65))] p-3">
              <Image
                src={asset.src}
                alt={asset.name}
                fill
                sizes="(max-width: 767px) 40vw, 120px"
                className="object-contain p-3 transition duration-150 group-hover:scale-[1.04]"
              />
            </div>
            <div className="px-3 py-2">
              <p className="text-sm font-medium text-[var(--editor-ink)]">{asset.name}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
