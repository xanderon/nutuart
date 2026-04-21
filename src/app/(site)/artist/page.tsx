import type { Metadata } from "next";
import Image from "next/image";
import { buildPageMetadata } from "@/lib/site";

export const metadata: Metadata = buildPageMetadata({
  title: "Artistul",
  description:
    "Despre Nuțu Marcel Marius, artist plastic specializat în lucrul cu sticla, geamuri sablate, vitralii și proiecte decorative personalizate.",
  path: "/artist",
  imagePath: "/images/artist_nutu_marcel_marius_at_work.webp",
});

export default function ArtistPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-4 py-16 sm:px-6 lg:px-8">
      <header className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
        <div className="space-y-6">
          <span className="text-xs uppercase tracking-[0.35em] text-muted">
            Artistul
          </span>
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">
            Nuțu Marcel Marius
          </h1>
          <p className="text-base leading-relaxed text-muted">
            Nuțu Marcel Marius este artist plastic specializat în lucrul cu
            sticla. Născut în București, a absolvit Facultatea de Arte
            Plastice, iar experiența practică din atelier, inclusiv lucrul la
            cuptorul de sticlărie, i-a format o relație directă cu materialul.
          </p>
          <p className="text-base leading-relaxed text-muted">
            Realizează geamuri sablate, design-uri pentru autocolant aplicat pe
            suprafețe vitrate și proiecte de vitralii, fiecare lucrare fiind
            adaptată spațiului și luminii existente.
          </p>
        </div>
        <div className="relative overflow-hidden rounded-[calc(var(--radius-lg)*1.1)] border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/60 shadow-[var(--shadow-soft)]">
          <Image
            src="/images/artist_nutu_marcel_marius_at_work.webp"
            alt="Nuțu Marcel Marius în atelier"
            width={1600}
            height={1067}
            className="h-full w-full object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 92vw, 48vw"
            priority
          />
        </div>
      </header>

      <section className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="relative overflow-hidden rounded-[calc(var(--radius-lg)*1.1)] border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/60 shadow-[var(--shadow-soft)]">
          <Image
            src="/images/artist_nutu_marcel_marius_two.webp"
            alt="Nuțu Marcel Marius, portret"
            width={960}
            height={1439}
            className="h-full w-full object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 92vw, 48vw"
          />
        </div>
        <div className="space-y-4">
          <p className="text-base leading-relaxed text-muted">
            Lucrează atât pentru locuințe, cât și pentru birouri sau spații
            comerciale, realizând piese personalizate, cu atenție la detalii și
            execuție.
          </p>
        </div>
      </section>
    </div>
  );
}
