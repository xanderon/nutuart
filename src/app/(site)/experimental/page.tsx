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
    <div className="mx-auto w-full max-w-7xl px-4 pb-14 pt-3 sm:px-6 lg:px-8">
      <section className="rounded-[1.8rem] border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/75 p-4 shadow-[var(--shadow-soft)] sm:p-5">
        <div className="grid items-center gap-4 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-3 lg:pr-3">
            <h1 className="text-3xl leading-tight sm:text-5xl">Nutu Marcel Marius</h1>
            <p className="text-lg leading-tight text-muted">Artist în sticlă / Glass Artist</p>
            <p className="max-w-xl text-sm leading-relaxed text-muted sm:text-base">
              Creații din sticlă realizate manual. Artă, lumină și detaliu în fiecare piesă.
            </p>
          </div>
          <div className="relative ml-0 aspect-[10/9] overflow-hidden rounded-[1rem] border border-[color:var(--color-outline)] bg-[radial-gradient(circle_at_30%_22%,rgba(244,197,108,0.18),transparent_55%),var(--color-surface)]/55 p-1.5">
            <Image
              src={topPortrait}
              alt="Nutu Marcel Marius"
              fill
              className="object-contain p-2.5 drop-shadow-[0_18px_36px_rgba(0,0,0,0.3)]"
              style={{ WebkitMaskImage: portraitEdgeMask, maskImage: portraitEdgeMask }}
              sizes="(min-width: 1024px) 30vw, 100vw"
              priority
            />
          </div>
        </div>
      </section>

      <section className="mt-4">
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
