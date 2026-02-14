import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Artistul",
  description:
    "Despre Nuțu Marcel Marius: formare și lucrul cu sticla ca material principal.",
};

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
            src="/images/artist_nutu_marcel_marius_at_work.jpg"
            alt="Nuțu Marcel Marius în atelier"
            width={960}
            height={960}
            className="h-full w-full object-cover"
            priority
          />
        </div>
      </header>

      <section className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div className="relative overflow-hidden rounded-[calc(var(--radius-lg)*1.1)] border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/60 shadow-[var(--shadow-soft)]">
          <Image
            src="/images/artist_nutu_marcel_marius_two.jpg"
            alt="Nuțu Marcel Marius, portret"
            width={960}
            height={720}
            className="h-full w-full object-cover"
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
