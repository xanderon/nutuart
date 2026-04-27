import type { Metadata } from "next";
import Link from "next/link";
import { buildPageMetadata } from "@/lib/site";

const services = [
  {
    title: "Autocolante corporate",
    description:
      "Branding pentru birouri, recepții și fațade, cu producție și montaj adaptate spațiului.",
    deliverables: [
      "Consultanță pe partea vizuală",
      "Producție în atelier",
      "Montaj rapid, fără să încurcăm activitatea",
    ],
  },
  {
    title: "Geamuri sablate",
    description:
      "Modele personalizate pentru geamuri și paravane. Putem combina sablare, gravură și folii pentru efecte diferite.",
    deliverables: [
      "Pattern-uri adaptate spațiului",
      "Testăm variante înainte de execuție",
      "Montaj curat și durabil",
    ],
  },
  {
    title: "Lucrări pentru biserici",
    description:
      "Execuții decorative și intervenții vizuale pentru spații religioase, cu atenție la context și detaliu.",
    deliverables: [
      "Design personalizat",
      "Alegerea materialelor potrivite",
      "Montaj și integrare la locație",
    ],
  },
  {
    title: "Trofee personalizate",
    description:
      "Trofee din sticlă șlefuită, cu sablare și finisaje manuale.",
    deliverables: [
      "Design pentru eveniment",
      "Prototip și ajustări",
      "Ambalare și livrare ok",
    ],
  },
];

export const metadata: Metadata = buildPageMetadata({
  title: "Atelier & Servicii",
  description:
    "Soluții integrate NutuArt: autocolante, geamuri sablate, lucrări pentru biserici și trofee personalizate.",
  path: "/services",
});

export default function ServicesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-10 px-4 pb-12 pt-5 sm:space-y-12 sm:px-6 sm:pb-14 sm:pt-6 lg:px-0">
      <header className="space-y-3 text-center sm:space-y-4">
        <h1 className="font-display text-3xl leading-tight sm:text-4xl">
          Soluții integrate: autocolante, sablare, biserici, trofee
        </h1>
        <p className="mx-auto max-w-4xl text-pretty text-sm leading-relaxed text-muted sm:text-base">
          Gândim și producem în atelier, cap-coadă. Fie că e branding pentru un
          spațiu sau un proiect mai complex, ne uităm la detalii și vrem să iasă
          bine și să țină în timp.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-3">
        {services.map((service) => (
          <article
            key={service.title}
            className="flex flex-col rounded-[var(--radius-lg)] border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/55 p-6 shadow-[var(--shadow-soft)]"
          >
            <h2 className="font-display text-2xl text-foreground">
              {service.title}
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted">
              {service.description}
            </p>
            <ul className="mt-6 space-y-2 text-sm text-muted">
              {service.deliverables.map((item) => (
                <li key={item} className="flex gap-3">
                  <span className="mt-1 h-2 w-2 flex-none rounded-full bg-[color:var(--color-accent)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/45 p-7 sm:p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-muted">
            Parteneriate creative
          </p>
          <h2 className="mt-3 font-display text-2xl sm:text-[2rem]">
            Intrăm în proiect când ai nevoie să iasă bine.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">
            De la idee la execuție, lucrăm clar, fără complicații. Fie că
            pornești de la zero sau ai deja o direcție, o ducem mai departe cum
            trebuie.
          </p>
          <div className="mt-6 flex flex-wrap gap-2.5 text-xs uppercase tracking-[0.28em] text-muted">
            <span className="rounded-full border border-[color:var(--color-outline)] px-3 py-2">
              Branding
            </span>
            <span className="rounded-full border border-[color:var(--color-outline)] px-3 py-2">
              Prototip
            </span>
            <span className="rounded-full border border-[color:var(--color-outline)] px-3 py-2">
              Execuție
            </span>
            <span className="rounded-full border border-[color:var(--color-outline)] px-3 py-2">
              Montaj
            </span>
          </div>
        </div>

        <div className="rounded-[var(--radius-lg)] border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/6 p-7 sm:p-8">
          <p className="text-xs uppercase tracking-[0.35em] text-muted">
            Pasul următor
          </p>
          <h2 className="mt-3 font-display text-2xl">Trimite ideea. Ne ocupăm noi de restul.</h2>
          <p className="mt-4 text-sm leading-relaxed text-muted sm:text-base">
            Ai un moodboard sau doar o idee vagă? E suficient. O transformăm
            într-un rezultat concret.
          </p>
          <div className="mt-6 space-y-2 text-sm text-muted">
            <p>NutuArt</p>
            <p>București</p>
            <p>Autocolante, sticlă sablată, lucrări personalizate</p>
          </div>
          <Link
            href="/contact"
            className="mt-7 inline-flex items-center justify-center rounded-full bg-[color:var(--color-accent-strong)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-background)] transition duration-200 hover:-translate-y-0.5"
          >
            Contact rapid
          </Link>
        </div>
      </section>
    </div>
  );
}
