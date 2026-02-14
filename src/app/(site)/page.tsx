import { GalleryExplorer } from "@/components/gallery/gallery-explorer";
import Link from "next/link";
import { getArtworks } from "@/lib/artworks";

export default async function HomePage() {
  const artworks = getArtworks().filter(
    (artwork) => artwork.collection === "decorations"
  );

  return (
    <div className="mx-auto w-full max-w-6xl space-y-12 px-4 py-12 sm:space-y-14 sm:px-6 lg:px-0">
      <section>
        <div className="mb-6 rounded-[var(--radius-lg)] border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/50 p-6">
          <p className="text-xs uppercase tracking-[0.35em] text-muted">Galerie</p>
          <h1 className="mt-3 font-display text-3xl leading-tight sm:text-4xl">
            Artă în sticlă semnată Nuțu Marcel Marius
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
            Imaginile din această galerie reprezintă lucrările lui și munca de o viață
            dedicată sticlei: formă, lumină și detaliu.
          </p>
        </div>
        <GalleryExplorer
          artworks={artworks}
          initialCollection="decorations"
          showFilters={false}
        />
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
