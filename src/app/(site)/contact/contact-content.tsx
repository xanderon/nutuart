import Image from "next/image";
import { siteConfig } from "@/lib/site";

const contactActions = [
  {
    label: "Email",
    value: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
    note: "Trimite schițe, poze sau detalii de proiect.",
  },
  {
    label: "Telefon",
    value: siteConfig.phoneDisplay,
    href: `tel:${siteConfig.phone}`,
    note: "Sună direct pentru o discuție scurtă.",
  },
  {
    label: "WhatsApp",
    value: "Mesaj direct",
    href: siteConfig.whatsappUrl,
    note: "Util dacă vrei să trimiți rapid imagini și măsurători.",
  },
] as const;

export function ContactContent() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 pb-8 pt-7 sm:space-y-7 sm:px-6 sm:pb-10 sm:pt-5 lg:px-8 lg:pt-6">
      <header className="space-y-3 text-center">
        <h1 className="font-display text-3xl leading-tight sm:text-5xl">Contact</h1>
        <p className="mx-auto max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
          Lucrări decorative pentru spații comerciale și rezidențiale. Trimite-ne
          dimensiuni, poze sau câteva detalii și revenim rapid cu pașii următori.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-3 sm:gap-4">
        {contactActions.map((action) => (
          <article
            key={action.label}
            className="rounded-[var(--radius-lg)] border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/55 p-4 sm:p-6"
          >
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-muted">
              {action.label}
            </p>
            <a
              href={action.href}
              target={action.label === "WhatsApp" ? "_blank" : undefined}
              rel={action.label === "WhatsApp" ? "noreferrer" : undefined}
              className="mt-2 block font-display text-xl font-semibold leading-tight text-foreground transition hover:text-[color:var(--color-accent)] sm:text-2xl"
            >
              {action.value}
            </a>
            <p className="mt-2 text-xs leading-relaxed text-muted">{action.note}</p>
          </article>
        ))}
      </section>

      <section className="overflow-hidden rounded-[calc(var(--radius-lg)*1.1)] border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/60 shadow-[var(--shadow-soft)]">
        <Image
          src="/images/collections/artist-nutu-marcel/ChatGPT Image Feb 14, 2026, 05_29_34 PM.png"
          alt="Nuțu Marcel Marius la lucru în atelier"
          width={1400}
          height={900}
          sizes="(max-width: 1024px) 100vw, 960px"
          className="h-auto w-full object-contain"
          priority
        />
      </section>
    </div>
  );
}
