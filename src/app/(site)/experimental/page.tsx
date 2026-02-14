import type { Metadata } from "next";
import Image from "next/image";
import { getArtworks } from "@/lib/artworks";
import { collectionLabels } from "@/data/artworks";

export const metadata: Metadata = {
  title: "Experimental",
  description:
    "Galerie completă cu lucrările artistului Nuțu Marcel Marius, între două portrete de prezentare.",
};

const topPortrait =
  "/images/collections/artist-nutu-marcel/ChatGPT Image Feb 14, 2026, 11_30_33 AM.png";
const bottomPortrait =
  "/images/collections/artist-nutu-marcel/ChatGPT Image Feb 14, 2026, 11_34_59 AM.png";

export default function ExperimentalPage() {
  const artworks = getArtworks();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/70 p-6 shadow-[var(--shadow-soft)] sm:p-8">
        <p className="text-[0.62rem] uppercase tracking-[0.34em] text-muted">
          Artist
        </p>
        <h1 className="mt-3 text-3xl leading-tight sm:text-5xl">
          Nutu Marcel Marius
        </h1>
        <p className="mt-3 text-base text-muted sm:text-lg">Pui Artist de sticla</p>
      </section>

      <section className="mt-8 overflow-hidden rounded-[2rem] border border-[color:var(--color-outline)] bg-[radial-gradient(circle_at_20%_20%,rgba(244,197,108,0.13),transparent_55%),var(--color-surface)]/65">
        <div className="relative aspect-[16/9] sm:aspect-[16/7]">
          <Image
            src={topPortrait}
            alt="Portret artist Nutu Marcel Marius"
            fill
            className="object-contain"
            sizes="(min-width: 1024px) 80vw, 100vw"
            priority
          />
        </div>
      </section>

      <section className="mt-10">
        <p className="mb-4 text-[0.62rem] uppercase tracking-[0.34em] text-muted">
          Galerie completa
        </p>
        <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
          {artworks.map((artwork) => (
            <figure
              key={artwork.id}
              className="mb-5 break-inside-avoid overflow-hidden rounded-3xl border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/70"
            >
              <div className="relative">
                <Image
                  src={artwork.image}
                  alt={artwork.title}
                  width={1200}
                  height={900}
                  className="h-auto w-full object-cover"
                  sizes="(min-width: 1024px) 32vw, (min-width: 640px) 48vw, 100vw"
                />
              </div>
              <figcaption className="space-y-1 px-4 py-4">
                <h2 className="text-lg leading-tight">{artwork.title}</h2>
                <p className="text-sm text-muted">
                  {collectionLabels[artwork.collection]}
                  {artwork.year ? ` • ${artwork.year}` : ""}
                </p>
                {artwork.dimensions ? (
                  <p className="text-sm text-muted">{artwork.dimensions}</p>
                ) : null}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      <section className="mt-10 overflow-hidden rounded-[2rem] border border-[color:var(--color-outline)] bg-[radial-gradient(circle_at_80%_30%,rgba(244,197,108,0.13),transparent_55%),var(--color-surface)]/65">
        <div className="relative aspect-[16/9] sm:aspect-[16/7]">
          <Image
            src={bottomPortrait}
            alt="Portret artist in atelier"
            fill
            className="object-contain"
            sizes="(min-width: 1024px) 80vw, 100vw"
          />
        </div>
      </section>
    </div>
  );
}
