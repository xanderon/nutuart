import Image from "next/image";
import Link from "next/link";
import { artworks } from "@/data/artworks";

const feedShapeClasses = [
  "aspect-[4/5]",
  "aspect-[5/4]",
  "aspect-[4/5]",
  "aspect-square",
  "aspect-[4/5]",
  "aspect-[5/4]",
];

export default function ExperimentalPage() {
  const glassCollections = new Set(["geamuri-sablate", "vitralii", "trofee"]);
  const allGlassItems = artworks
    .filter((artwork) => glassCollections.has(artwork.collection))
    .sort((a, b) => Number(b.year) - Number(a.year));
  const featuredItems = allGlassItems.slice(0, 3);
  const feedItems = allGlassItems.slice(3);

  return (
    <div className="bg-[#fcfcfd] text-[#111827]">
      <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
        <section className="mb-8 rounded-[2rem] border border-black/5 bg-white px-5 py-7 shadow-[0_30px_80px_-60px_rgba(14,24,39,0.35)] sm:px-8">
          <p className="text-[0.62rem] uppercase tracking-[0.34em] text-[#64748b]">
            Experimental Feed
          </p>
          <h1 className="mt-3 max-w-xl text-3xl leading-tight text-[#0f172a] sm:text-5xl">
            Sticla. Lumina. Cadru curat.
          </h1>
        </section>

        <section className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
          {featuredItems.map((artwork, index) => (
            <div
              key={`hero-${artwork.id}`}
              className={`relative overflow-hidden rounded-2xl ${
                index === 0 ? "col-span-2 sm:col-span-2" : "col-span-1"
              } ${index === 0 ? "aspect-[16/10]" : "aspect-[4/5]"}`}
            >
              <Image
                src={artwork.image}
                alt={artwork.title}
                fill
                className="object-cover"
                sizes="(min-width: 640px) 33vw, 50vw"
                priority={index === 0}
              />
            </div>
          ))}
        </section>

        <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
          {feedItems.map((artwork, index) => (
            <figure key={artwork.id} className="group">
              <div
                className={`relative overflow-hidden rounded-2xl ${feedShapeClasses[index % feedShapeClasses.length]}`}
              >
                <Image
                  src={artwork.image}
                  alt={artwork.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                  sizes="(min-width: 1024px) 31vw, (min-width: 640px) 48vw, 50vw"
                />
              </div>
              <figcaption className="mt-2 flex items-center justify-between px-0.5">
                <p className="truncate text-[0.66rem] uppercase tracking-[0.22em] text-[#334155]">
                  {artwork.title}
                </p>
                <span className="text-[0.66rem] uppercase tracking-[0.2em] text-[#94a3b8]">
                  {artwork.year}
                </span>
              </figcaption>
            </figure>
          ))}
        </section>

        <section className="mt-12 overflow-hidden rounded-[2rem] border border-black/6 bg-white shadow-[0_36px_90px_-70px_rgba(15,23,42,0.45)]">
          <div className="relative aspect-[16/7] sm:aspect-[16/6]">
            <Image
              src="/images/collections/decorations/vaza-alba-baza.png"
              alt="Compozitie decorativa din sticla pe fundal alb"
              fill
              className="object-cover object-center"
              sizes="(min-width: 1024px) 75vw, 100vw"
            />
          </div>
        </section>

        <section className="mt-10 border-t border-black/6 pt-6">
          <div className="flex flex-wrap items-center gap-3">
            <Link
              href="/"
              className="rounded-full border border-black/10 bg-white px-5 py-3 text-[0.65rem] uppercase tracking-[0.26em] text-[#0f172a] transition hover:bg-black hover:text-white"
            >
              Inapoi la galerie
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-black/10 px-5 py-3 text-[0.65rem] uppercase tracking-[0.26em] text-[#0f172a] transition hover:border-black"
            >
              Contact
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
