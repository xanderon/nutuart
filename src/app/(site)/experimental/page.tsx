import Image from "next/image";
import Link from "next/link";

const mockSources = [
  "/images/collections/decorations/vaza-alba-baza.png",
  "/images/collections/decorations/vaza-alba-baza-2.png",
];

const feedShapeClasses = [
  "aspect-[4/5]",
  "aspect-[5/4]",
  "aspect-[4/5]",
  "aspect-square",
  "aspect-[5/4]",
  "aspect-[4/5]",
];

export default function ExperimentalPage() {
  const mockFeed = Array.from({ length: 20 }, (_, index) => ({
    id: `mock-${index + 1}`,
    src: mockSources[index % mockSources.length],
    alt: `Decor glass concept ${index + 1}`,
  }));

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

        <section className="mb-8 overflow-hidden rounded-[2rem] border border-black/5 bg-white">
          <div className="relative aspect-[16/11] sm:aspect-[16/9]">
            <Image
              src="/images/collections/decorations/vaza-alba-baza.png"
              alt="Compozitie decorativa din sticla pe fundal alb"
              fill
              className="object-cover object-center"
              sizes="(min-width: 1024px) 75vw, 100vw"
              priority
            />
          </div>
        </section>

        <section className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
          {mockFeed.map((item, index) => (
            <figure key={item.id} className="group">
              <div
                className={`relative overflow-hidden rounded-2xl ${feedShapeClasses[index % feedShapeClasses.length]}`}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  className="object-cover object-center transition duration-500 group-hover:scale-[1.02]"
                  sizes="(min-width: 1024px) 31vw, (min-width: 640px) 48vw, 50vw"
                />
              </div>
            </figure>
          ))}
        </section>

        <section className="relative mt-12 overflow-hidden rounded-[2rem] bg-transparent">
          <div className="relative aspect-[16/7] sm:aspect-[16/6]">
            <Image
              src="/images/collections/decorations/vaza-alba-baza.png"
              alt="Compozitie decorativa din sticla pe fundal alb"
              fill
              className="object-cover object-center"
              sizes="(min-width: 1024px) 75vw, 100vw"
            />
          </div>
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#fcfcfd_0%,transparent_7%,transparent_93%,#fcfcfd_100%),linear-gradient(to_bottom,#fcfcfd_0%,transparent_4%,transparent_96%,#fcfcfd_100%)]" />
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
