import Image from "next/image";
import Link from "next/link";
import {
  artworks,
  collectionLabels,
  type CollectionSlug,
} from "@/data/artworks";

const collectionOrder: CollectionSlug[] = [
  "vitralii",
  "geamuri-sablate",
  "autocolante",
  "printuri",
  "trofee",
];

const roomNotes: Record<CollectionSlug, string> = {
  vitralii:
    "Compoziții în care lumina devine material principal, cu ritm cromatic și detalii de atelier.",
  "geamuri-sablate":
    "Intervenții pe sticlă pentru intimitate și personalitate arhitecturală, cu desen fin și contrast controlat.",
  autocolante:
    "Lucrări grafice aplicate în spațiu real: branding, zonare și identitate vizuală cu impact imediat.",
  printuri:
    "Piese de comunicare vizuală la scară mare, gândite pentru claritate, distanță și rezistență.",
  trofee:
    "Obiecte-premiu lucrate ca sculpturi mici, unde forma și reflexia transmit valoare simbolică.",
};

const heroArtworks = artworks.slice(0, 5);
const collectionRooms = collectionOrder.map((collection) => ({
  collection,
  items: artworks.filter((artwork) => artwork.collection === collection),
}));

const heroLayout = [
  "md:col-span-6 md:row-span-3",
  "md:col-span-3 md:row-span-2",
  "md:col-span-3 md:row-span-2",
  "md:col-span-4 md:row-span-2",
  "md:col-span-8 md:row-span-2",
];

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
            Intrare curatorială, săli tematice și ritm vizual de expoziție.
            Scopul este să facem din fiecare lucrare o piesă cu prezență, nu un
            simplu thumbnail într-un grid generic.
          </p>
          <div className="flex flex-wrap gap-3 text-xs uppercase tracking-[0.25em] text-white/70">
            <span className="rounded-full border border-white/20 px-3 py-2">
              Tur Curatorial
            </span>
            <span className="rounded-full border border-white/20 px-3 py-2">
              Săli tematice
            </span>
            <span className="rounded-full border border-white/20 px-3 py-2">
              100+ lucrări ready
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
          {collectionRooms.map((room) => (
            <article
              key={room.collection}
              className="rounded-[2rem] border border-white/10 bg-black/28 p-5 sm:p-7"
            >
              <div className="mb-5 grid gap-4 md:grid-cols-[1.1fr_0.9fr] md:items-end">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/55">
                    Sala
                  </p>
                  <h2 className="text-2xl text-white sm:text-3xl">
                    {collectionLabels[room.collection]}
                  </h2>
                </div>
                <p className="max-w-xl text-sm leading-relaxed text-white/70">
                  {roomNotes[room.collection]}
                </p>
              </div>

              <div className="flex gap-4 overflow-x-auto pb-2" data-gallery-scroll>
                {room.items.map((artwork) => (
                  <figure
                    key={artwork.id}
                    className="group w-[74vw] shrink-0 space-y-3 rounded-3xl border border-white/10 bg-black/30 p-3 sm:w-[360px]"
                  >
                    <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
                      <Image
                        src={artwork.image}
                        alt={artwork.title}
                        fill
                        className="object-cover transition duration-500 group-hover:scale-105"
                        sizes="(min-width: 640px) 360px, 74vw"
                      />
                    </div>
                    <figcaption className="space-y-1 px-1 pb-1">
                      <h3 className="text-base leading-tight text-white">
                        {artwork.title}
                      </h3>
                      <p className="text-xs uppercase tracking-[0.2em] text-white/55">
                        {artwork.year} • {artwork.medium}
                      </p>
                      <p className="line-clamp-2 text-sm text-white/65">
                        {artwork.description}
                      </p>
                    </figcaption>
                  </figure>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="rounded-3xl border border-white/10 bg-black/30 p-6 text-center sm:p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-white/55">
            Pentru varianta finală
          </p>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-white/75 sm:text-base">
            Putem integra acum toată arhiva (50-100+ imagini), cu filtrare pe
            ani și colecții, plus un lightbox cinematic pentru vizionare
            fullscreen.
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
