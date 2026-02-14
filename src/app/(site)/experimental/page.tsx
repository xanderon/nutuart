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
  "/images/artist_nutu_marcel_marius_at_work.jpg";
const bottomPortrait =
  "/images/collections/artist-nutu-marcel/ChatGPT Image Feb 14, 2026, 11_30_33 AM.png";

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
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/75 p-6 shadow-[var(--shadow-soft)] sm:p-8">
        <div className="grid items-center gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-6 lg:pr-6">
            <h1 className="text-4xl leading-tight sm:text-6xl">Nutu Marcel Marius</h1>
            <p className="text-xl leading-tight text-muted">Artist în sticlă / Glass Artist</p>
            <p className="max-w-xl text-lg leading-relaxed text-muted">
              Creații din sticlă realizate manual. Artă, lumină și detaliu în fiecare piesă.
            </p>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href="/gallery"
                className="rounded-full border border-[color:var(--color-accent)] bg-[color:var(--color-accent)] px-6 py-3 text-sm font-semibold text-black transition hover:opacity-90"
              >
                Vezi lucrările
              </a>
              <a
                href="/artist"
                className="rounded-full border border-[color:var(--color-outline)] px-6 py-3 text-sm font-semibold transition hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]"
              >
                Despre artist
              </a>
            </div>
          </div>
          <div className="relative aspect-[5/4] overflow-hidden rounded-[1.4rem] border border-[color:var(--color-outline)] bg-[color:var(--color-surface)]/55">
            <Image
              src={topPortrait}
              alt="Nutu Marcel Marius in atelier"
              fill
              className="object-cover"
              sizes="(min-width: 1024px) 44vw, 100vw"
              priority
            />
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.38),rgba(0,0,0,0.06))]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(255,255,255,0.2),transparent_42%)]" />
          </div>
        </div>
      </section>

      <section className="mt-10">
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

      <section className="mt-10 rounded-[2rem] border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/75 p-6 shadow-[var(--shadow-soft)] sm:p-8">
        <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-4 lg:pl-2">
            <p className="text-[0.62rem] uppercase tracking-[0.34em] text-muted">Footer</p>
            <h2 className="text-2xl leading-tight sm:text-4xl">Final de pagină</h2>
            <p className="text-base leading-relaxed text-muted sm:text-lg">
              În partea de jos, textul rămâne în stânga iar portretul PNG în dreapta, pentru un final echilibrat al compoziției.
            </p>
          </div>
          <div className="relative aspect-[5/4] rounded-[1.4rem] bg-[radial-gradient(circle_at_75%_24%,rgba(244,197,108,0.16),transparent_55%),var(--color-surface)]/55 p-4">
            <Image
              src={bottomPortrait}
              alt="Portret artist in zona footer"
              fill
              className="object-contain p-4 drop-shadow-[0_20px_45px_rgba(0,0,0,0.32)]"
              style={{ WebkitMaskImage: portraitEdgeMask, maskImage: portraitEdgeMask }}
              sizes="(min-width: 1024px) 34vw, 100vw"
            />
          </div>
        </div>
      </section>
    </div>
  );
}
