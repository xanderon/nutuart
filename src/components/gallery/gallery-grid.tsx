import { type Artwork } from "@/data/artworks";
import Image from "next/image";
import { cn } from "@/lib/utils";

type GalleryGridProps = {
  artworks: Artwork[];
  layout?: "masonry" | "uniform";
};

export function GalleryGrid({ artworks, layout = "masonry" }: GalleryGridProps) {
  return (
    <div
      className={cn(
        "grid gap-5 sm:gap-7",
        layout === "masonry"
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      )}
    >
      {artworks.map((artwork, index) => {
        return (
          <div
            key={artwork.id}
            className={cn(
              "group relative aspect-square overflow-hidden rounded-[calc(var(--radius-lg)*1.25)] bg-[color:var(--color-elevated)]/15 shadow-[0_28px_70px_-38px_rgba(0,0,0,0.8)] transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_32px_90px_-42px_rgba(0,0,0,0.75)]"
            )}
          >
            <Image
              src={artwork.image}
              alt={artwork.title}
              fill
              className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={index === 0}
              loading={index === 0 ? undefined : "lazy"}
            />
          </div>
        );
      })}
    </div>
  );
}
