import type { Metadata } from "next";
import { ContactContent } from "./contact-content";

export const metadata: Metadata = {
  title: "Contact",
  description: "Scrie-ne câteva detalii și revenim rapid.",
};

export default function ContactPage() {
  return <ContactContent />;
}
