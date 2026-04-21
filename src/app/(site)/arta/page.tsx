import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { buildPageMetadata } from "@/lib/site";

const topPortrait =
  "/images/collections/artist-nutu-marcel/artist-top-portrait.webp";

export const metadata: Metadata = buildPageMetadata({
  title: "Artă decorativă",
  description:
    "Colecție de obiecte decorative pe sticlă și piese de autor realizate de Nuțu Marcel Marius.",
  path: "/arta",
  imagePath: topPortrait,
});

function getDecorationImages() {
  const dir = path.join(
    process.cwd(),
    "public",
    "images",
    "collections",
    "decorations"
  );
  if (!fs.existsSync(dir)) return [];

  return fs
    .readdirSync(dir)
    .filter((file) => /\.(png|jpe?g|webp|avif)$/i.test(file))
    .sort((a, b) => a.localeCompare(b))
    .reduce<string[]>((acc, file) => {
      const ext = path.extname(file).toLowerCase();
      const name = path.parse(file).name.replace(/\.(png|jpe?g)$/i, "");
      const existingIndex = acc.findIndex(
        (entry) => path.parse(entry).name === name
      );

      const nextPath = `/images/collections/decorations/${file}`;
      if (existingIndex === -1) {
        acc.push(nextPath);
        return acc;
      }

      const existing = acc[existingIndex];
      const existingExt = path.extname(existing).toLowerCase();
      const preferCurrent =
        (ext === ".webp" || ext === ".avif") &&
        existingExt !== ".webp" &&
        existingExt !== ".avif";

      if (preferCurrent) {
        acc[existingIndex] = nextPath;
      }

      return acc;
    }, []);
}

export default function ArtPage() {
  const decorationImages = getDecorationImages();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-14 pt-0 sm:px-6 sm:pt-1 lg:px-8">
      <section className="py-0">
        <div className="grid items-center gap-1 md:grid-cols-[1fr_1fr]">
          <div className="relative ml-0 h-[338px] w-[338px] justify-self-start sm:h-[378px] sm:w-[378px]">
            <Image
              src={topPortrait}
              alt="Nuțu Marcel Marius"
              fill
              className="-scale-x-100 object-contain"
              sizes="(min-width: 640px) 378px, 338px"
              priority
            />
          </div>
          <div className="space-y-2 lg:pr-2">
            <p className="text-xs uppercase tracking-[0.35em] text-muted">Artist</p>
            <h1 className="text-[2rem] leading-tight sm:text-[4rem]">Nutu Marcel Marius</h1>
            <p className="max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
              O selecție din colecția personală de artă.
            </p>
          </div>
        </div>
      </section>

      <section className="mt-3 sm:mt-0">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {decorationImages.map((src, index) => (
            <figure
              key={src}
              className="overflow-hidden rounded-3xl border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/82 shadow-[0_18px_45px_rgba(0,0,0,0.12)]"
            >
              <div className="p-4 sm:p-5">
                <div className="relative aspect-[4/5] overflow-hidden rounded-[22px]">
                  <Image
                    src={src}
                    alt={`Lucrare decorativă ${index + 1}`}
                    fill
                    className="object-contain"
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                    loading="lazy"
                    unoptimized
                  />
                </div>
              </div>
            </figure>
          ))}
        </div>
      </section>
    </div>
  );
}
