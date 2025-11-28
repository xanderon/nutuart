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
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 auto-rows-[minmax(220px,_1fr)] sm:auto-rows-[minmax(260px,_1fr)]"
          : "grid-cols-2 md:grid-cols-3 lg:grid-cols-4 auto-rows-[minmax(220px,_1fr)]"
      )}
    >
      {artworks.map((artwork, index) => {
        const spanClass =
          layout === "masonry"
            ? index % 5 === 0
              ? "sm:row-span-2"
              : index % 3 === 0
                ? "lg:row-span-2"
                : "row-span-1"
            : "row-span-1";

        return (
          <div
            key={artwork.id}
            className={cn(
              "group relative flex overflow-hidden rounded-[calc(var(--radius-lg)*1.25)] bg-[color:var(--color-elevated)]/15 shadow-[0_28px_70px_-38px_rgba(0,0,0,0.8)] transition duration-500 hover:-translate-y-1.5 hover:shadow-[0_32px_90px_-42px_rgba(0,0,0,0.75)]",
              spanClass
            )}
          >
            <Image
              src={artwork.image}
              alt={artwork.title}
              fill
              className="object-cover transition duration-700 ease-out group-hover:scale-[1.04]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={index < 3}
            />
          </div>
        );
      })}
    </div>
  );
}
