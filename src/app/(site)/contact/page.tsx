import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { buildPageMetadata, siteConfig } from "@/lib/site";
import { ContactContent } from "./contact-content";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact",
  description:
    "Contact NutuArt pentru autocolante, geamuri sablate, lucrări pentru biserici și trofee personalizate. Email, telefon și WhatsApp direct.",
  path: "/contact",
  imagePath: "/images/collections/artist-nutu-marcel/contact-artist.webp",
});

export default function ContactPage() {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact NutuArt",
    url: `${siteConfig.url}/contact`,
    mainEntity: {
      "@type": "ProfessionalService",
      name: siteConfig.name,
      email: siteConfig.email,
      telephone: siteConfig.phone,
      address: {
        "@type": "PostalAddress",
        addressLocality: "București",
        addressCountry: "RO",
      },
    },
  };

  return (
    <>
      <JsonLd data={structuredData} />
      <ContactContent />
    </>
  );
}
