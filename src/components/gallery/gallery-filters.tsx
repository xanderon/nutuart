import type { Artwork, CollectionSlug } from "@/data/artworks";
import { collectionLabels } from "@/data/artworks";
import { cn } from "@/lib/utils";

type GalleryFiltersProps = {
  activeCollection: Artwork["collection"] | "toate";
  onChange: (collection: Artwork["collection"] | "toate") => void;
  collections: CollectionSlug[];
  compact?: boolean;
};

export function GalleryFilters({
  activeCollection,
  onChange,
  collections,
  compact = false,
}: GalleryFiltersProps) {
  const entries = collections.map((collection) => [
    collection,
    collectionLabels[collection],
  ]) as Array<[CollectionSlug, string]>;

  return (
    <div
      data-gallery-scroll=""
      className={cn(
        "flex w-full items-center gap-1.5 overflow-x-auto overflow-y-visible pr-1 text-left sm:justify-center sm:text-center",
        compact ? "sm:gap-1.5" : "sm:gap-2"
      )}
    >
      <button
        type="button"
        aria-pressed={activeCollection === "toate"}
        className={cn(
          "shrink-0 rounded-md border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/70 uppercase tracking-[0.28em] text-[color:var(--color-muted)] transition duration-150 hover:border-[color:var(--color-accent)]/60 hover:bg-[color:var(--color-elevated)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]/50",
          compact ? "px-2.5 py-1.5 text-[9px]" : "px-3 py-1.5 text-[10px]",
          activeCollection === "toate" &&
            "border-[color:var(--color-accent-strong)]/80 bg-[color:var(--color-accent-strong)]/15 text-foreground shadow-[0_24px_50px_-32px_rgba(0,0,0,0.65)]"
        )}
        onClick={() => onChange("toate")}
      >
        Toate
      </button>
      {entries.map(([value, label]) => (
        <button
          key={value}
          type="button"
          aria-pressed={activeCollection === value}
          className={cn(
            "shrink-0 rounded-md border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/70 uppercase tracking-[0.28em] text-[color:var(--color-muted)] transition duration-150 hover:border-[color:var(--color-accent)]/60 hover:bg-[color:var(--color-elevated)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]/50",
            compact ? "px-2.5 py-1.5 text-[9px]" : "px-3 py-1.5 text-[10px]",
            activeCollection === value &&
              "border-[color:var(--color-accent-strong)]/80 bg-[color:var(--color-accent-strong)]/15 text-foreground shadow-[0_24px_50px_-32px_rgba(0,0,0,0.65)]"
          )}
          onClick={() => onChange(value)}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
