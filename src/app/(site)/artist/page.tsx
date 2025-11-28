import type { Metadata } from "next";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Artistul",
  description:
    "Despre Nuțu Marcel Marius: formare și lucrul cu sticla ca material principal.",
};

export default function ArtistPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-16 px-4 py-16 sm:px-6 lg:px-8">
      <header className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <span className="text-xs uppercase tracking-[0.35em] text-muted">
            Artistul
          </span>
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">
            Nuțu Marcel Marius, artist plastic specializat în sticlă.
          </h1>
          <p className="text-base leading-relaxed text-muted">
            Născut în București, a urmat Facultatea de Arte Plastice. Lucrează
            cu sticla ca material central, păstrând interesul pentru desen și
            culoare. Îmbină practica de atelier cu proiecte aplicate și lucrări
            personale.
          </p>
          <p className="text-sm leading-relaxed text-muted">
            Este posibil membru al uniunii artiștilor plastici (de confirmat),
            soț, tată și bunic. Vrea ca lucrările să fie clare și sincere, fără
            zgomot inutil.
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

      <section className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/60 p-6">
          <h2 className="font-display text-2xl">Manifest</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted">
            „Sticla e sinceră. Te obligă să negociezi cu lumină, reflexii și
            transparențe. Fiecare tăietură și gravură trebuie să aibă sens și
            răbdare.”
          </p>
        </div>
        <div className="space-y-4 text-sm leading-relaxed text-muted">
          <p>
            Începuturile: desen și pictură clasică, apoi experimente cu sticlă.
            Detalii de adăugat: an absolvire, profesori marcanti, tehnici preferate.
          </p>
          <p>
            Expoziții și lucrări: principalele apariții (oraș, an, titlu) de
            completat; lucrări instalate în spații publice și private.
          </p>
          <p>
            Întrebări deschise pentru completare: membre/afiliere la uniunea
            artiștilor plastici? Premii sau selecții notabile? Ce proiecte
            personale pregătește acum?
          </p>
        </div>
      </section>

      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-4 text-sm leading-relaxed text-muted">
          <h2 className="text-xs uppercase tracking-[0.35em] text-muted">
            Direcții și inspirație
          </h2>
          <p>
            Interes pentru materiale care prind sau filtrează lumina și pentru
            compoziții simple. Întrebări de completat: influențe artistice
            preferate? Ce colecții personale vrea să expună public?
          </p>
        </div>
        <div className="relative overflow-hidden rounded-[calc(var(--radius-lg)*1.05)] border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/60 shadow-[var(--shadow-soft)]">
          <Image
            src="/images/artist_nutu_marcel_marius_two.jpg"
            alt="Artistul și o lucrare de artă semnată Nuțu"
            width={960}
            height={720}
            className="h-full w-full object-cover"
          />
        </div>
      </section>
    </div>
  );
}
