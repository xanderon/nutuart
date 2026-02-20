import type { Metadata } from "next";
import fs from "node:fs";
import path from "node:path";
import Image from "next/image";
import { SilhouetteImage } from "@/components/gallery/silhouette-image";

export const metadata: Metadata = {
  title: "Artă",
  description:
    "Pagina de artă a artistului, cu selecții decorative și portretul lui Nuțu Marcel Marius.",
};

const topPortrait =
  "/images/collections/artist-nutu-marcel/ChatGPT Image Feb 14, 2026, 11_34_59 AM.png";

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
    <div className="mx-auto w-full max-w-7xl px-4 pb-14 pt-0 sm:px-6 sm:pt-1 lg:px-8">
      <section className="py-0">
        <div className="grid items-center gap-1 md:grid-cols-[1fr_1fr]">
          <div className="relative ml-0 h-[338px] w-[338px] justify-self-start sm:h-[378px] sm:w-[378px]">
            <Image
              src={topPortrait}
              alt="Nutu Marcel Marius"
              fill
              className="-scale-x-100 object-contain"
              sizes="(min-width: 640px) 378px, 338px"
              priority
            />
          </div>
          <div className="space-y-1 lg:pr-2">
            <h1 className="text-[2rem] leading-tight sm:text-[4rem]">Nutu Marcel Marius</h1>
            <p className="text-lg leading-tight text-muted sm:text-xl">
              Artist în sticlă / Glass Artist
            </p>
          </div>
        </div>
      </section>

      <section className="mt-[-12px]">
        <p className="mb-1 text-[0.62rem] uppercase tracking-[0.34em] text-muted">Artă de autor</p>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {decorationImages.map((src, index) => (
            <figure
              key={src}
              className="overflow-hidden rounded-3xl border border-[color:var(--color-outline)] bg-[radial-gradient(circle_at_20%_20%,rgba(244,197,108,0.09),transparent_55%),var(--color-elevated)]/80"
            >
              <div className="relative aspect-[4/5]">
                <div className="absolute inset-4 overflow-hidden rounded-[22px] p-1">
                  <SilhouetteImage
                    src={src}
                    alt={`Decorative glass artwork ${index + 1}`}
                    className="h-full w-full rounded-[20px] object-contain"
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
