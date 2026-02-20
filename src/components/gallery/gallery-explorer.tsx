"use client";

import { useEffect, useMemo, useState } from "react";
import type { Artwork, CollectionSlug } from "@/data/artworks";
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
  const [compactFilters, setCompactFilters] = useState(false);

  const availableCollections = useMemo(() => {
    const unique = new Set<CollectionSlug>();
    artworks.forEach((artwork) => {
      if (artwork.collection !== "decorations") {
        unique.add(artwork.collection);
      }
    });
    return Array.from(unique);
  }, [artworks]);

  const effectiveActiveCollection =
    activeCollection === "toate" || availableCollections.includes(activeCollection)
      ? activeCollection
      : "toate";

  useEffect(() => {
    if (typeof window === "undefined") return;

    const onScroll = () => {
      setCompactFilters(window.scrollY > 140);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const filteredArtworks = useMemo(() => {
    const collectionFiltered =
      effectiveActiveCollection === "toate"
        ? artworks
        : artworks.filter(
            (artwork) => artwork.collection === effectiveActiveCollection
          );

    if (maxItems) {
      return collectionFiltered.slice(0, maxItems);
    }

    return collectionFiltered;
  }, [artworks, effectiveActiveCollection, maxItems]);

  return (
    <div className="space-y-5">
      {showFilters ? (
        <div
          className={
            "sticky top-[60px] z-20 -mx-4 border-b border-[color:var(--color-outline)]/70 bg-[color:var(--page-bg)]/88 px-4 backdrop-blur transition-[padding] duration-200 sm:top-[78px] sm:px-0 lg:top-[92px] " +
            (compactFilters ? "py-1 sm:py-2" : "py-2 sm:py-3")
          }
        >
          <div className="flex">
            <GalleryFilters
              activeCollection={effectiveActiveCollection}
              onChange={setActiveCollection}
              collections={availableCollections}
              compact={compactFilters}
            />
          </div>
        </div>
      ) : null}
      <GalleryGrid artworks={filteredArtworks} layout={layout} />
    </div>
  );
}
