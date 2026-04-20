import type { Metadata } from "next";
import { GalleryExplorer } from "@/components/gallery/gallery-explorer";
import { JsonLd } from "@/components/seo/json-ld";
import Link from "next/link";
import { getArtworks } from "@/lib/artworks";
import { buildPageMetadata, siteConfig } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: siteConfig.title,
  description: siteConfig.description,
  path: "/",
  absoluteTitle: true,
  keywords: [
    "geamuri sablate",
    "vitralii",
    "autocolante decorative",
    "decor pe sticlă",
    "Nuțu Marcel Marius",
    "NutuArt",
  ],
});

export default async function HomePage() {
  const artworks = getArtworks().filter(
    (artwork) => artwork.collection !== "decorations"
  );
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    areaServed: "România",
    telephone: siteConfig.phone,
    email: siteConfig.email,
    address: {
      "@type": "PostalAddress",
      addressLocality: "București",
      addressCountry: "RO",
    },
    founder: {
      "@type": "Person",
      name: siteConfig.ownerName,
    },
  };

  return (
    <div className="mx-auto w-full max-w-6xl space-y-12 px-4 py-12 sm:space-y-14 sm:px-6 lg:px-0">
      <JsonLd data={structuredData} />
      <section>
        <div className="mb-5 rounded-[var(--radius-lg)] border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/50 p-6">
          <h1 className="font-display text-3xl leading-tight sm:text-4xl">
            Lucrări decorative pentru spații comerciale și rezidențiale.
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted sm:text-base">
            Atelierul NutuArt realizează geamuri sablate, vitralii, autocolante și
            proiecte pe sticlă adaptate spațiului, luminii și identității vizuale.
          </p>
        </div>
        <GalleryExplorer artworks={artworks} />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Link
          href="/services"
          className="rounded-[var(--radius-lg)] border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/60 p-7 transition duration-200 hover:-translate-y-1"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-muted">Servicii</p>
          <h2 className="mt-3 font-display text-2xl">Vezi ce putem realiza pentru proiectul tău</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Branding pe sticlă, vitralii, sablare, printuri outdoor și trofee
            personalizate.
          </p>
        </Link>
        <Link
          href="/artist"
          className="rounded-[var(--radius-lg)] border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/45 p-7 transition duration-200 hover:-translate-y-1"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-muted">Artist</p>
          <h2 className="mt-3 font-display text-2xl">Află mai multe despre Nuțu Marcel Marius</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Parcursul artistic, atelierul și modul în care sunt dezvoltate lucrările.
          </p>
        </Link>
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
