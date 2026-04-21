import Image from "next/image";
import { siteConfig } from "@/lib/site";

function EmailIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-10 w-10 fill-none stroke-current">
      <rect x="3.25" y="5.25" width="17.5" height="13.5" rx="2.5" strokeWidth="1.5" />
      <path d="M4.5 7l7.5 6 7.5-6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-10 w-10 fill-none stroke-current">
      <path
        d="M7.8 4.5h2.1c.45 0 .85.3.97.73l.68 2.45a1 1 0 0 1-.29.99l-1.38 1.27a13.58 13.58 0 0 0 4.2 4.2l1.27-1.38a1 1 0 0 1 .99-.29l2.45.68c.43.12.73.52.73.97v2.1c0 .77-.63 1.4-1.4 1.4h-.9C10.92 18.62 5.38 13.08 5.38 6.3v-.4c0-.77.63-1.4 1.42-1.4Z"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="h-10 w-10 fill-current">
      <path d="M12.02 3.2a8.74 8.74 0 0 0-7.54 13.18L3 21l4.8-1.43a8.82 8.82 0 0 0 4.22 1.08h.01a8.75 8.75 0 1 0 0-17.5Zm4.98 12.33c-.2.57-1.14 1.07-1.58 1.14-.41.07-.93.1-1.5-.08-.34-.1-.78-.25-1.35-.49-2.38-1.02-3.94-3.42-4.06-3.58-.12-.16-.96-1.27-.96-2.43 0-1.15.6-1.72.82-1.96.21-.24.47-.3.62-.3.16 0 .31 0 .45.01.15 0 .35-.06.55.42.2.47.67 1.63.73 1.75.06.11.1.25.02.41-.07.16-.11.25-.22.39-.1.12-.22.27-.31.36-.1.11-.21.23-.09.46.12.24.52.86 1.12 1.39.77.69 1.42.9 1.66 1 .24.1.38.08.52-.05.14-.15.58-.67.73-.9.15-.24.3-.2.5-.12.21.07 1.3.61 1.53.72.22.11.37.16.42.25.05.09.05.53-.15 1.1Z" />
    </svg>
  );
}

const contactActions = [
  {
    label: "Email",
    value: siteConfig.email,
    href: `mailto:${siteConfig.email}`,
    note: "Trimite schițe, poze sau detalii de proiect.",
    icon: EmailIcon,
    iconClassName: "text-[color:var(--color-accent)]",
  },
  {
    label: "Telefon",
    value: siteConfig.phoneDisplay,
    href: `tel:${siteConfig.phone}`,
    note: "Sună direct pentru o discuție scurtă.",
    icon: PhoneIcon,
    iconClassName: "text-foreground",
  },
  {
    label: "WhatsApp",
    value: "Mesaj direct",
    href: siteConfig.whatsappUrl,
    note: "Trimite poze, dimensiuni și primești răspuns direct pe WhatsApp.",
    icon: WhatsAppIcon,
    iconClassName: "text-[#25D366]",
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
            <div className="flex items-center gap-2.5">
              <span className={`inline-flex shrink-0 ${action.iconClassName}`}>
                <action.icon />
              </span>
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-muted">
                {action.label}
              </p>
            </div>
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
          src="/images/collections/artist-nutu-marcel/contact-artist.webp"
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
