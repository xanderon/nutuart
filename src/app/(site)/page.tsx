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
  socialTitle: siteConfig.socialTitle,
  keywords: [
    "geamuri sablate",
    "biserici",
    "autocolante",
    "trofee personalizate",
    "Nuțu Marcel Marius",
    "NutuArt",
  ],
});

export default async function HomePage() {
  const artworks = getArtworks();
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
    <div className="mx-auto w-full max-w-6xl space-y-8 px-4 pb-12 pt-0 sm:space-y-10 sm:px-6 sm:pb-14 sm:pt-2 lg:px-0">
      <JsonLd data={structuredData} />
      <section className="space-y-2 sm:space-y-3">
        <div className="px-2 py-1 text-center sm:px-8 sm:py-2">
          <h1 className="font-display text-2xl leading-tight sm:text-4xl">
            Lucrări decorative pentru spații comerciale și rezidențiale.
          </h1>
          <p className="mx-auto mt-2 max-w-3xl text-pretty text-[13px] leading-relaxed text-muted sm:mt-3 sm:text-base">
            Atelierul artistului Nuțu Marcel realizează autocolante, geamuri
            sablate, lucrări pentru biserici{" "}
            <span className="whitespace-nowrap">și trofee personalizate</span>{" "}
            pentru case, birouri și spații comerciale.
          </p>
        </div>
        <GalleryExplorer artworks={artworks} />
      </section>

      <section className="grid gap-5 lg:grid-cols-2">
        <Link
          href="/services"
          prefetch={false}
          className="rounded-[var(--radius-lg)] border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/60 p-7 transition duration-200 hover:-translate-y-1"
        >
          <p className="text-xs uppercase tracking-[0.35em] text-muted">Servicii</p>
          <h2 className="mt-3 font-display text-2xl">Vezi ce putem realiza pentru proiectul tău</h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Autocolante, sablare pe sticlă, lucrări pentru biserici și{" "}
            <span className="whitespace-nowrap">trofee personalizate</span>.
          </p>
        </Link>
        <Link
          href="/artist"
          prefetch={false}
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
          prefetch={false}
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
