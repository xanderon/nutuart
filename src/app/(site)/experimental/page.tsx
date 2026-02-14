import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import Image from "next/image";

export const metadata: Metadata = {
  title: "Experimental",
  description:
    "Galerie decorations cu două portrete ale artistului integrate în header și footer.",
};

const topPortrait =
  "/images/collections/artist-nutu-marcel/ChatGPT Image Feb 14, 2026, 11_34_59 AM.png";

const portraitEdgeMask =
  "linear-gradient(to right, transparent 0%, black 16%, black 84%, transparent 100%), linear-gradient(to bottom, transparent 0%, black 14%, black 86%, transparent 100%)";

function getDecorationImages() {
  const dir = path.join(process.cwd(), "public", "images", "collections", "decorations");
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => /\.(png|jpe?g|webp|avif)$/i.test(file))
    .sort((a, b) => a.localeCompare(b))
    .map((file) => `/images/collections/decorations/${file}`);
}

export default function ExperimentalPage() {
  const decorationImages = getDecorationImages();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-14 pt-14 sm:px-6 sm:pt-16 lg:px-8">
      <section className="py-0.5">
        <div className="grid items-center gap-3 md:grid-cols-[1.25fr_0.75fr]">
          <div className="space-y-2.5 lg:pr-2">
            <p className="text-[0.58rem] uppercase tracking-[0.3em] text-muted">
              NutuArt / Experimental
            </p>
            <h1 className="text-2xl leading-tight sm:text-4xl">Nutu Marcel Marius</h1>
            <p className="text-base leading-tight text-muted sm:text-lg">
              Artist în sticlă / Glass Artist
            </p>
            <p className="max-w-xl text-sm leading-relaxed text-muted">
              Creații din sticlă realizate manual. Artă, lumină și detaliu în fiecare piesă.
            </p>
          </div>
          <div className="relative ml-0 h-[180px] w-[180px] justify-self-start overflow-hidden rounded-[0.95rem] border border-[color:var(--color-outline)] bg-[radial-gradient(circle_at_30%_22%,rgba(244,197,108,0.14),transparent_55%)] p-1 sm:h-[220px] sm:w-[220px] md:justify-self-end">
            <Image
              src={topPortrait}
              alt="Nutu Marcel Marius"
              fill
              className="object-contain p-2 drop-shadow-[0_16px_28px_rgba(0,0,0,0.28)]"
              style={{ WebkitMaskImage: portraitEdgeMask, maskImage: portraitEdgeMask }}
              sizes="(min-width: 640px) 220px, 180px"
              priority
            />
          </div>
        </div>
      </section>

      <section className="mt-3">
        <p className="mb-4 text-[0.62rem] uppercase tracking-[0.34em] text-muted">Decorations Gallery</p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {decorationImages.map((src, index) => (
            <figure
              key={src}
              className="overflow-hidden rounded-3xl border border-[color:var(--color-outline)] bg-[radial-gradient(circle_at_20%_20%,rgba(244,197,108,0.09),transparent_55%),var(--color-elevated)]/80"
            >
              <div className="relative aspect-[4/5]">
                <Image
                  src={src}
                  alt={`Decorative glass artwork ${index + 1}`}
                  fill
                  className="object-contain p-4"
                  sizes="(min-width: 1024px) 30vw, (min-width: 640px) 46vw, 100vw"
                />
              </div>
            </figure>
          ))}
        </div>
      </section>

    </div>
  );
}
