import type { Metadata } from "next";
import Link from "next/link";

const services = [
  {
    title: "Autocolante corporate",
    description:
      "Branding pentru birouri, recepții și fațade, de la autocolante sablate la printuri UV cu decupaj personalizat.",
    deliverables: [
      "Consultanță grafică și story de brand",
      "Producție print & sablare în atelier",
      "Aplicare rapidă fără întreruperea activității",
    ],
  },
  {
    title: "Geamuri sablate",
    description:
      "Modele custom pentru geamuri și paravane; combinații de sablare, gravură și autocolant transparent pentru efecte multiple.",
    deliverables: [
      "Pattern-uri inspirate din identitatea spațiului",
      "Testare pe mostre și simulări digitale",
      "Montaj curat și protecție pe termen lung",
    ],
  },
  {
    title: "Vitralii & restaurare",
    description:
      "Vitralii realizate în tehnici Tiffany și cu plumb, restaurare pentru spații sacre și proiectare de panouri contemporane.",
    deliverables: [
      "Relevee și plan de restaurare",
      "Selecție de sticlă texturată și foiță metalică",
      "Structură metalică și montaj la locație",
    ],
  },
  {
    title: "Printuri outdoor",
    description:
      "Mesh, bannere și casete luminoase gândite pentru vizibilitate în trafic și rezistență la intemperii.",
    deliverables: [
      "Concept grafic și prepress",
      "Producție pe suporturi premium",
      "Sisteme de prindere și montaj în siguranță",
    ],
  },
  {
    title: "Trofee personalizate",
    description:
      "Trofee din sticlă șlefuită și gravură laser, combinate cu lemn sau metal pentru gale corporate și culturale.",
    deliverables: [
      "Design dedicat evenimentului tău",
      "Prototipare și finisaje manuale",
      "Packaging și livrare protejată",
    ],
  },
];

export const metadata: Metadata = {
  title: "Atelier & Servicii",
  description:
    "Serviciile NutuArt: autocolante corporate, geamuri sablate, vitralii, printuri outdoor și trofee personalizate realizate de Nuțu Marcel Marius.",
};

export default function ServicesPage() {
  return (
    <div className="mx-auto w-full max-w-6xl space-y-16 px-4 py-16 sm:px-6 lg:px-8">
      <header className="space-y-6">
        <span className="text-xs uppercase tracking-[0.35em] text-muted">
          Atelier & Proces
        </span>
        <h1 className="font-display text-4xl leading-tight sm:text-5xl">
          Soluții integrate: autocolante, sablare, vitralii, printuri, trofee.
        </h1>
        <p className="max-w-3xl text-base leading-relaxed text-muted">
          Gândim și producem în atelier, astfel încât fiecare proiect – de la
          branding interior la vitralii monumentale – să primească aceeași grijă
          pentru detalii și durabilitate.
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
            Lucrăm alături de studiouri de arhitectură, branduri și instituții
            culturale. Putem integra proiectele în fluxul tău, de la măsurători la
            montaj, cu echipe dedicate fiecărei etape.
          </p>
        </div>
        <div className="space-y-4 rounded-[var(--radius-lg)] border border-[color:var(--color-outline)] bg-[color:var(--color-background)]/60 p-6">
          <p className="text-xs uppercase tracking-[0.3em] text-muted">
            Pasul următor
          </p>
          <p className="text-sm text-muted">
            Trimite-ne un moodboard sau planșe pentru a porni discuția despre
            următorul tău proiect.
          </p>
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
