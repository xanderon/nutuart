import type { Metadata } from "next";

export const siteConfig = {
  name: "NutuArt",
  ownerName: "Nuțu Marcel Marius",
  title: "NutuArt — Nuțu Marcel Marius",
  description:
    "Lucrări decorative pe sticlă, geamuri sablate, vitralii, autocolante și proiecte personalizate realizate de Nuțu Marcel Marius pentru spații comerciale și rezidențiale.",
  url: "https://marcelnutu.art",
  locale: "ro_RO",
  language: "ro-RO",
  location: "București, România",
  email: "marcelnutu@yahoo.com",
  phone: "+40721383668",
  phoneDisplay: "+40 721 383 668",
  whatsappUrl: "https://wa.me/40721383668",
  ogImagePath: "/opengraph-image",
} as const;

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}

type BuildPageMetadataInput = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  imagePath?: string;
  absoluteTitle?: boolean;
};

export function buildPageMetadata({
  title,
  description,
  path = "/",
  keywords = [],
  imagePath = siteConfig.ogImagePath,
  absoluteTitle = false,
}: BuildPageMetadataInput): Metadata {
  const canonicalUrl = absoluteUrl(path);
  const imageUrl = absoluteUrl(imagePath);
  const socialTitle = title === siteConfig.title ? title : `${title} · ${siteConfig.name}`;

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: socialTitle,
      description,
      url: canonicalUrl,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: socialTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [imageUrl],
    },
  };
}
