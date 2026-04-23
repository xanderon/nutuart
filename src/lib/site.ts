import type { Metadata } from "next";

export const siteConfig = {
  name: "NutuArt",
  ownerName: "Nuțu Marcel Marius",
  title: "NutuArt - Nuțu Marcel Marius",
  socialTitle: "Artist Nuțu Marcel Marius - Lucrări decorative pe sticlă",
  previewLabel: "Artist Nuțu Marcel Marius",
  description:
    "Autocolante, geamuri sablate, lucrări pentru biserici și trofee personalizate pentru spații comerciale și rezidențiale. Realizate la comandă în București.",
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
  socialTitle?: string;
};

export function buildPageMetadata({
  title,
  description,
  path = "/",
  keywords = [],
  imagePath = siteConfig.ogImagePath,
  absoluteTitle = false,
  socialTitle,
}: BuildPageMetadataInput): Metadata {
  const canonicalUrl = absoluteUrl(path);
  const imageUrl = absoluteUrl(imagePath);
  const effectiveSocialTitle =
    socialTitle || (title === siteConfig.title ? siteConfig.socialTitle : `${title} - ${siteConfig.name}`);

  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: effectiveSocialTitle,
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
          alt: effectiveSocialTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: effectiveSocialTitle,
      description,
      images: [imageUrl],
    },
  };
}
