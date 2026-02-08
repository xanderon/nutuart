import Image from "next/image";
import Link from "next/link";
import {
  artworks,
  collectionLabels,
  type CollectionSlug,
} from "@/data/artworks";

const heroArtworks = artworks.slice(0, 5);
const heroLayout = [
  "md:col-span-6 md:row-span-3",
  "md:col-span-3 md:row-span-2",
  "md:col-span-3 md:row-span-2",
  "md:col-span-4 md:row-span-2",
  "md:col-span-8 md:row-span-2",
];

const stageBlueprint: Array<{
  id: string;
  title: string;
  subtitle: string;
  description: string;
  collections: CollectionSlug[];
}> = [
  {
    id: "origini",
    title: "Origini & Semn",
    subtitle: "Primele gesturi vizuale",
    description:
      "Un început orientat spre simbol și compoziții care definesc semnătura artistului.",
    collections: ["vitralii"],
  },
  {
    id: "transparente",
    title: "Transparențe Structurate",
    subtitle: "Lumină și intimitate",
    description:
      "Lucrări pe sticlă în care modelul devine arhitectură vizuală pentru spații reale.",
    collections: ["geamuri-sablate"],
  },
  {
    id: "identitate",
    title: "Identitate în Spațiu",
    subtitle: "Grafică aplicată",
    description:
      "Intervenții vizuale care transformă suprafețe utilitare în spații cu personalitate.",
    collections: ["autocolante"],
  },
  {
    id: "scala-publica",
    title: "Scală Publică",
    subtitle: "Mesaj la distanță",
    description:
      "Piese gândite pentru impact urban, lizibilitate și prezență în context exterior.",
    collections: ["printuri"],
  },
  {
    id: "obiecte-simbol",
    title: "Obiecte Simbol",
    subtitle: "Finaluri memorabile",
    description:
      "Trofee și obiecte-premiu în care forma, textura și reflexia exprimă valoare.",
    collections: ["trofee"],
  },
];

const timelineStages = stageBlueprint.map((stage) => ({
  ...stage,
  items: artworks.filter((artwork) => stage.collections.includes(artwork.collection)),
}));

const collectionPalette: Record<CollectionSlug, string> = {
  vitralii: "bg-emerald-300/20 text-emerald-100 border-emerald-300/30",
  "geamuri-sablate": "bg-cyan-300/20 text-cyan-100 border-cyan-300/30",
  autocolante: "bg-fuchsia-300/20 text-fuchsia-100 border-fuchsia-300/30",
  printuri: "bg-amber-300/20 text-amber-100 border-amber-300/30",
  trofee: "bg-orange-300/20 text-orange-100 border-orange-300/30",
};

export default function ExperimentalPage() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_10%,rgba(234,191,117,0.2),transparent_36%),radial-gradient(circle_at_84%_14%,rgba(101,148,255,0.16),transparent_32%),radial-gradient(circle_at_48%_88%,rgba(255,126,96,0.16),transparent_34%)]" />

      <div className="relative z-10 mx-auto w-full max-w-6xl space-y-10 px-4 py-14 sm:space-y-16 sm:px-6 lg:px-8">
        <section className="space-y-7 rounded-[2rem] border border-white/10 bg-black/35 p-6 backdrop-blur-xl sm:p-10">
          <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--color-accent)]">
            Experimental Wing
          </p>
          <h1 className="max-w-4xl text-3xl leading-tight text-white sm:text-5xl">
            Muzeu digital pentru lucrările artistului Nuțu Marcel Marius.
          </h1>
          <p className="max-w-3xl text-sm leading-relaxed text-white/75 sm:text-base">
            Simulare de tur real: introducere, sală principală și apoi un
            timeline curatorial construit pe etape artistice.
          </p>
          <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.25em] text-white/70">
            <span className="rounded-full border border-white/20 px-3 py-2">
              Tur Curatorial
            </span>
            <span className="rounded-full border border-white/20 px-3 py-2">
              Timeline pe etape
            </span>
            <span className="rounded-full border border-white/20 px-3 py-2">
              Fără scroll lateral
            </span>
          </div>
        </section>

        <section className="space-y-5">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.32em] text-white/60">
              Sala Principală
            </p>
            <p className="text-xs uppercase tracking-[0.28em] text-white/40">
              selecție curatoriată
            </p>
          </div>
          <div className="grid auto-rows-[110px] grid-cols-1 gap-4 md:grid-cols-12 md:auto-rows-[130px]">
            {heroArtworks.map((artwork, index) => (
              <article
                key={`hero-${artwork.id}`}
                className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-black/40 ${heroLayout[index % heroLayout.length]}`}
              >
                <Image
                  src={artwork.image}
                  alt={artwork.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                  sizes="(min-width: 768px) 50vw, 100vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <p className="text-[0.62rem] uppercase tracking-[0.26em] text-white/60">
                    {collectionLabels[artwork.collection]}
                  </p>
                  <h2 className="mt-1 text-xl leading-tight text-white">
                    {artwork.title}
                  </h2>
                  <p className="text-sm text-white/70">{artwork.medium}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="space-y-3 rounded-3xl border border-white/10 bg-black/25 p-5 sm:p-6">
            <p className="text-xs uppercase tracking-[0.32em] text-white/55">
              Parcurs curatorial
            </p>
            <p className="max-w-3xl text-sm leading-relaxed text-white/72 sm:text-base">
              Timeline-ul din stânga ghidează vizitatorul prin capitolele
              expoziției, iar în dreapta sunt lucrările. Focusul rămâne pe
              imagine și atmosferă, nu pe frecvența din anii de producție.
            </p>
          </div>
          <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
            <aside className="hidden lg:block">
              <div className="sticky top-28 rounded-3xl border border-white/10 bg-black/28 p-5">
                <p className="mb-4 text-xs uppercase tracking-[0.28em] text-white/45">
                  Timeline
                </p>
                <ol className="relative space-y-4 border-l border-white/20 pl-4">
                  {timelineStages.map((stage, index) => (
                    <li key={stage.id} className="space-y-1">
                      <span className="absolute -ml-[1.12rem] mt-1.5 h-2.5 w-2.5 rounded-full border border-white/40 bg-black" />
                      <p className="text-[0.62rem] uppercase tracking-[0.26em] text-white/40">
                        Capitol {String(index + 1).padStart(2, "0")}
                      </p>
                      <a
                        href={`#stage-${stage.id}`}
                        className="block text-sm text-white/80 transition hover:text-white"
                      >
                        {stage.title}
                      </a>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>

            <div className="space-y-8">
              {timelineStages.map((stage, index) => (
                <article
                  id={`stage-${stage.id}`}
                  key={stage.id}
                  className="scroll-mt-28 rounded-[2rem] border border-white/10 bg-black/28 p-5 sm:p-7"
                >
                  <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-white/10 pb-4">
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-[0.3em] text-white/55">
                        Capitol {String(index + 1).padStart(2, "0")}
                      </p>
                      <h2 className="text-3xl text-white sm:text-4xl">
                        {stage.title}
                      </h2>
                      <p className="text-sm uppercase tracking-[0.24em] text-white/45">
                        {stage.subtitle}
                      </p>
                    </div>
                    <p className="max-w-xl text-sm leading-relaxed text-white/68">
                      {stage.description}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                    {stage.items.map((artwork) => (
                      <figure
                        key={artwork.id}
                        className="group space-y-3 rounded-3xl border border-white/10 bg-black/30 p-3"
                      >
                        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                          <Image
                            src={artwork.image}
                            alt={artwork.title}
                            fill
                            className="object-cover transition duration-500 group-hover:scale-105"
                            sizes="(min-width: 1280px) 30vw, (min-width: 640px) 45vw, 92vw"
                          />
                        </div>
                        <figcaption className="space-y-1 px-1 pb-1">
                          <p
                            className={`inline-flex rounded-full border px-2 py-1 text-[0.62rem] uppercase tracking-[0.2em] ${collectionPalette[artwork.collection]}`}
                          >
                            {collectionLabels[artwork.collection]}
                          </p>
                          <h3 className="text-base leading-tight text-white">
                            {artwork.title}
                          </h3>
                          <p className="text-xs uppercase tracking-[0.2em] text-white/55">
                            {artwork.medium}
                          </p>
                          <p className="text-sm text-white/65">
                            {artwork.description}
                          </p>
                        </figcaption>
                      </figure>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/30 p-6 text-center sm:p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-white/55">
            Pentru varianta finală
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
            Dacă îți place direcția, păstrăm timeline-ul curatorial și adăugăm
            direct toată arhiva, apoi marcăm discret perioadele reale.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="rounded-full border border-white/25 px-5 py-3 text-xs uppercase tracking-[0.28em] text-white transition hover:bg-white/10"
            >
              Înapoi la galerie
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-transparent bg-white px-5 py-3 text-xs uppercase tracking-[0.28em] text-black transition hover:bg-white/85"
            >
              Programăm selecția
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
