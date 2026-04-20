import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { buildPageMetadata, siteConfig } from "@/lib/site";
import { ContactContent } from "./contact-content";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact",
  description:
    "Contact NutuArt pentru geamuri sablate, vitralii, autocolante decorative și proiecte personalizate. Email, telefon și WhatsApp direct.",
  path: "/contact",
  imagePath: "/images/collections/artist-nutu-marcel/ChatGPT Image Feb 14, 2026, 05_29_34 PM.png",
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
