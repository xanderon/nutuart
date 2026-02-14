import fs from "node:fs";
import path from "node:path";
import { artworks as baseArtworks, collectionLabels, type Artwork } from "@/data/artworks";

const collectionSlugs = Object.keys(collectionLabels) as Array<Artwork["collection"]>;

const mediumByCollection: Record<Artwork["collection"], string> = {
  decorations: "Artă în sticlă",
  autocolante: "Autocolant / grafică aplicată",
  "geamuri-sablate": "Sticlă sablată",
  vitralii: "Sticlă colorată",
  printuri: "Print",
  trofee: "Obiect premiu",
};

const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif"]);

function toTitleFromFilename(filename: string) {
  const name = path.parse(filename).name;
  return name
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function getArtworks(): Artwork[] {
  const root = path.join(process.cwd(), "public", "images", "collections");

  const discovered: Artwork[] = [];

  for (const slug of collectionSlugs) {
    const dir = path.join(root, slug);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir);
    for (const file of files) {
      const ext = path.extname(file).toLowerCase();
      if (!imageExtensions.has(ext)) continue;

      const imagePath = `/images/collections/${slug}/${file}`;
      const alreadyExists = baseArtworks.some((art) => art.image === imagePath);
      if (alreadyExists) continue;

      const title = toTitleFromFilename(file);
      discovered.push({
        id: `${slug}-${title.toLowerCase().replace(/\s+/g, "-")}`,
        title: title || "Lucrare nouă",
        medium: mediumByCollection[slug] || "Sticlă",
        year: "",
        dimensions: "",
        image: imagePath,
        description: "",
        collection: slug,
      });
    }
  }

  return [...baseArtworks, ...discovered];
}
