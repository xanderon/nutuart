import type { Artwork, CollectionSlug } from "@/data/artworks";
import { collectionLabels } from "@/data/artworks";
import { cn } from "@/lib/utils";

const entries = Object.entries(collectionLabels) as Array<
  [CollectionSlug, string]
>;

type GalleryFiltersProps = {
  activeCollection: Artwork["collection"] | "toate";
  onChange: (collection: Artwork["collection"] | "toate") => void;
};

export function GalleryFilters({
  activeCollection,
  onChange,
}: GalleryFiltersProps) {
  return (
    <div
      data-gallery-scroll=""
      className="flex w-full flex-wrap items-center justify-center gap-1.5 overflow-x-auto overflow-y-visible pb-1 pr-1 text-center sm:flex-nowrap sm:gap-2"
    >
      <button
        type="button"
        aria-pressed={activeCollection === "toate"}
        className={cn(
          "rounded-md border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/70 px-3 py-2 text-[10px] uppercase tracking-[0.32em] text-[color:var(--color-muted)] transition duration-150 hover:border-[color:var(--color-accent)]/60 hover:bg-[color:var(--color-elevated)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]/50",
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
            "rounded-md border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/70 px-3 py-2 text-[10px] uppercase tracking-[0.32em] text-[color:var(--color-muted)] transition duration-150 hover:border-[color:var(--color-accent)]/60 hover:bg-[color:var(--color-elevated)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-accent)]/50",
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
