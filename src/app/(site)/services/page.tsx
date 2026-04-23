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
    <div className="mx-auto w-full max-w-6xl space-y-16 px-4 py-16 sm:px-6 lg:px-8">
      <header className="space-y-6">
        <span className="text-xs uppercase tracking-[0.35em] text-muted">
          Atelier & Proces
        </span>
        <h1 className="font-display text-4xl leading-tight sm:text-5xl">
          Soluții integrate: autocolante, sablare, biserici, trofee
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted">
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

      <div className="grid gap-6 rounded-[var(--radius-lg)] border border-[color:var(--color-outline)] bg-[color:var(--color-elevated)]/60 p-6 sm:grid-cols-[1.2fr_0.8fr] sm:p-10">
        <div className="space-y-4">
          <h2 className="font-display text-2xl">Parteneriate creative</h2>
          <p className="text-sm leading-relaxed text-muted">
            Lucrăm cu arhitecți, branduri și echipe creative. Putem intra în
            proiect de la început sau pe parcurs, în funcție de nevoie.
          </p>
        </div>
        <div className="space-y-4 rounded-[var(--radius-lg)] border border-[color:var(--color-outline)] bg-[color:var(--color-background)]/60 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Pasul următor
          </p>
          <p className="text-sm text-muted">
            Dacă ai un moodboard sau niște idei, trimite-le și vedem cum le
            ducem mai departe.
          </p>
          <div className="space-y-2 border-t border-[color:var(--color-outline)] pt-4">
            <p className="text-xs uppercase tracking-[0.3em] text-muted">
              Contact rapid
            </p>
            <p className="font-display text-xl text-foreground">NutuArt</p>
            <p className="text-sm leading-relaxed text-muted">
              Autocolante, geamuri sablate, lucrări pentru biserici și trofee
              personalizate. Proiecte pentru case și spații comerciale.
            </p>
            <p className="text-sm text-muted">București, România</p>
          </div>
          <Link
            href="/contact"
            className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-accent-strong)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-[color:var(--color-background)] transition duration-200 hover:-translate-y-0.5"
          >
            Contact rapid
          </Link>
        </div>
      </div>
    </div>
  );
}
