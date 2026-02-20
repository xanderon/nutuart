"use client";

import { useMemo, useState } from "react";
import type { Artwork } from "@/data/artworks";
import { GalleryGrid } from "./gallery-grid";
import { GalleryFilters } from "./gallery-filters";

type GalleryExplorerProps = {
  artworks: Artwork[];
  initialCollection?: Artwork["collection"] | "toate";
  maxItems?: number;
  layout?: "masonry" | "uniform";
  showFilters?: boolean;
};

export function GalleryExplorer({
  artworks,
  initialCollection = "toate",
  maxItems,
  layout = "masonry",
  showFilters = true,
}: GalleryExplorerProps) {
  const [activeCollection, setActiveCollection] = useState<
    Artwork["collection"] | "toate"
  >(initialCollection);

  const filteredArtworks = useMemo(() => {
    const collectionFiltered =
      activeCollection === "toate"
        ? artworks
        : artworks.filter((artwork) => artwork.collection === activeCollection);

    if (maxItems) {
      return collectionFiltered.slice(0, maxItems);
    }

    return collectionFiltered;
  }, [artworks, activeCollection, maxItems]);

  return (
    <div className="space-y-5">
      {showFilters ? (
        <div className="sticky top-[68px] z-20 -mx-4 border-b border-[color:var(--color-outline)]/70 bg-[color:var(--page-bg)]/88 px-4 py-2 backdrop-blur sm:top-[78px] sm:px-0 sm:py-3 lg:top-[92px]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <GalleryFilters
              activeCollection={activeCollection}
              onChange={setActiveCollection}
            />
          </div>
        </div>
      ) : null}
      <GalleryGrid artworks={filteredArtworks} layout={layout} />
    </div>
  );
}
