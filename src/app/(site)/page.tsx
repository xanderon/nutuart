import { GalleryExplorer } from "@/components/gallery/gallery-explorer";
import Link from "next/link";
import { collectionLabels, type CollectionSlug } from "@/data/artworks";
import { getArtworks } from "@/lib/artworks";

type HomePageProps = {
  searchParams?: {
    collection?: string;
  };
};

const isCollectionSlug = (value: string): value is CollectionSlug =>
  Object.prototype.hasOwnProperty.call(collectionLabels, value);

export default async function HomePage({ searchParams }: HomePageProps) {
  const requestedCollection = searchParams?.collection ?? "toate";
  const initialCollection = isCollectionSlug(requestedCollection)
    ? requestedCollection
    : "toate";
  const artworks = getArtworks();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-12 px-4 py-12 sm:space-y-14 sm:px-6 lg:px-0">
      <section>
        <GalleryExplorer artworks={artworks} initialCollection={initialCollection} />
      </section>

      <section className="mx-auto w-full max-w-3xl">
        <Link
          href="/contact"
          className="block rounded-[var(--radius-lg)] border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/65 p-8 text-center transition hover:-translate-y-1 hover:bg-[color:var(--color-elevated)]"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-muted">
            Consultanță & colaborări
          </p>
          <p className="mt-3 text-lg text-foreground">
            Trimite schițe sau detalii de proiect și revenim rapid cu pașii următori.
          </p>
          <p className="mt-2 text-sm text-muted">
            Stabilim împreună ce livrăm: mostre, simulări, ofertă sau o discuție scurtă.
          </p>
        </Link>
      </section>
    </div>
  );
}
