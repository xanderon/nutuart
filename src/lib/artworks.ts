import fs from "node:fs";
import path from "node:path";
import {
  collectionLabels,
  collectionMediums,
  collectionTitlePrefixes,
  type Artwork,
  type CollectionSlug,
} from "@/data/artworks";

const collectionSlugs = Object.keys(collectionLabels) as CollectionSlug[];
const imageExtensions = [".webp", ".avif", ".jpg", ".jpeg", ".png"];

function getPreferredImages(dir: string) {
  const files = fs.readdirSync(dir);
  const preferredFiles = new Map<string, string>();

  for (const file of files) {
    const ext = path.extname(file).toLowerCase();
    if (!imageExtensions.includes(ext)) continue;

    const baseName = path.parse(file).name.toLowerCase();
    const current = preferredFiles.get(baseName);
    if (!current) {
      preferredFiles.set(baseName, file);
      continue;
    }

    const currentExt = path.extname(current).toLowerCase();
    if (imageExtensions.indexOf(ext) < imageExtensions.indexOf(currentExt)) {
      preferredFiles.set(baseName, file);
    }
  }

  return Array.from(preferredFiles.values()).sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" })
  );
}

export function getArtworks() {
  const root = path.join(process.cwd(), "public", "images", "collections");
  const artworks: Artwork[] = [];

  for (const slug of collectionSlugs) {
    const dir = path.join(root, slug);
    if (!fs.existsSync(dir)) continue;

    const files = getPreferredImages(dir);

    files.forEach((file, index) => {
      const sequence = String(index + 1).padStart(2, "0");

      artworks.push({
        id: `${slug}-${sequence}`,
        title: `${collectionTitlePrefixes[slug]} ${sequence}`,
        medium: collectionMediums[slug],
        year: "",
        dimensions: "",
        image: `/images/collections/${slug}/${file}`,
        description: collectionLabels[slug],
        collection: slug,
      });
    });
  }

  return artworks;
}
