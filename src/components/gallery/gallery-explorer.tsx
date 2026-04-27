"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  collectionDisplayOrder,
  type Artwork,
  type CollectionSlug,
} from "@/data/artworks";
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
  const explorerTopRef = useRef<HTMLDivElement>(null);
  const [activeCollection, setActiveCollection] = useState<
    Artwork["collection"] | "toate"
  >(initialCollection);
  const [compactFilters, setCompactFilters] = useState(false);

  const availableCollections = useMemo(() => {
    const unique = new Set<CollectionSlug>();
    artworks.forEach((artwork) => {
      unique.add(artwork.collection);
    });

    return Array.from(unique).sort(
      (left, right) =>
        collectionDisplayOrder.indexOf(left) - collectionDisplayOrder.indexOf(right)
    );
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

  const handleCollectionChange = (collection: Artwork["collection"] | "toate") => {
    setActiveCollection(collection);
    scrollToExplorerTop();
  };

  const scrollToExplorerTop = () => {
    const explorerTop = explorerTopRef.current;
    if (!explorerTop) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    explorerTop.scrollIntoView({
      behavior: prefersReducedMotion ? "auto" : "smooth",
      block: "start",
    });
  };

  return (
    <div
      ref={explorerTopRef}
      className="space-y-2 scroll-mt-[84px] sm:space-y-3 sm:scroll-mt-[108px] lg:scroll-mt-[124px]"
    >
      {showFilters ? (
        <div
          className={
            "sticky top-[64px] z-20 -mx-4 bg-[color:var(--page-bg)]/88 px-4 backdrop-blur transition-[padding] duration-200 sm:top-[84px] sm:px-0 lg:top-[96px] " +
            (compactFilters ? "py-0.5" : "py-0.5 sm:py-1")
          }
        >
          <GalleryFilters
            activeCollection={effectiveActiveCollection}
            onChange={handleCollectionChange}
            collections={availableCollections}
            compact={compactFilters}
          />
        </div>
      ) : null}
      <GalleryGrid artworks={filteredArtworks} layout={layout} />
    </div>
  );
}
