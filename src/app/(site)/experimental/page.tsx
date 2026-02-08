"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { artworks, collectionLabels, type Artwork } from "@/data/artworks";

type PeriodDefinition = {
  id: string;
  title: string;
  timeframe: string;
  note: string;
  match: (artwork: Artwork) => boolean;
};

type PeriodSection = Omit<PeriodDefinition, "match"> & {
  items: Artwork[];
};

const getYear = (value: string) => Number.parseInt(value, 10);

const periodDefinitions: PeriodDefinition[] = [
  {
    id: "atelier-foundation",
    title: "Atelier Foundations",
    timeframe: "Early period",
    note: "Primele lucrari de impact pentru spatii comerciale si proiecte vizuale de identitate.",
    match: (artwork) =>
      getYear(artwork.year) <= 2014 &&
      (artwork.collection === "autocolante" || artwork.collection === "printuri"),
  },
  {
    id: "glass-architecture",
    title: "Glass Architecture",
    timeframe: "Middle period",
    note: "Seria orientata pe sticla si lumina, cu compozitii pentru interior si spatii functionale.",
    match: (artwork) => artwork.collection === "geamuri-sablate",
  },
  {
    id: "light-compositions",
    title: "Light Compositions",
    timeframe: "Later period",
    note: "Lucrari mature in vitralii, unde culoarea si reflexia devin element central.",
    match: (artwork) => artwork.collection === "vitralii",
  },
  {
    id: "symbolic-objects",
    title: "Symbolic Objects",
    timeframe: "Signature pieces",
    note: "Obiecte-premiu si piese de final de parcurs, cu accent pe detaliu si prezenta.",
    match: (artwork) => artwork.collection === "trofee",
  },
];

export default function ExperimentalPage() {
  const periodSections = useMemo(() => {
    const used = new Set<string>();

    const sections: PeriodSection[] = periodDefinitions
      .map((definition) => {
        const { match, ...meta } = definition;
        const items = artworks.filter(
          (artwork) => !used.has(artwork.id) && match(artwork)
        );
        items.forEach((artwork) => used.add(artwork.id));
        return { ...meta, items };
      })
      .filter((section) => section.items.length > 0);

    const remaining = artworks.filter((artwork) => !used.has(artwork.id));
    if (remaining.length > 0) {
      sections.push({
        id: "archive-select",
        title: "Archive Select",
        timeframe: "Cross period",
        note: "Lucrari care completeaza traseul si se pot muta ulterior in perioade dedicate.",
        items: remaining,
      });
    }

    return sections;
  }, []);

  const [activeSection, setActiveSection] = useState(periodSections[0]?.id ?? "");

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>("[data-period-section]")
    );
    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const firstVisible = entries.find((entry) => entry.isIntersecting);
        if (!firstVisible) {
          return;
        }
        const periodId = (firstVisible.target as HTMLElement).dataset.periodId;
        if (periodId) {
          setActiveSection(periodId);
        }
      },
      {
        rootMargin: "-40% 0px -45% 0px",
        threshold: 0,
      }
    );

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [periodSections]);

  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_8%,rgba(252,135,105,0.15),transparent_34%),radial-gradient(circle_at_82%_14%,rgba(251,191,73,0.16),transparent_34%),radial-gradient(circle_at_55%_90%,rgba(118,132,255,0.14),transparent_34%)]" />

      <div className="relative z-10 mx-auto w-full max-w-6xl space-y-8 px-4 py-14 sm:space-y-10 sm:px-6 lg:px-8">
        <section className="rounded-[2rem] bg-black/35 p-6 backdrop-blur-xl sm:p-10">
          <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--color-accent)]">
            Experimental Feed
          </p>
          <h1 className="mt-4 max-w-4xl text-3xl leading-tight text-white sm:text-5xl">
            Muzeu digital cu vibe instagram, dar curatorial.
          </h1>
          <p className="mt-4 text-sm uppercase tracking-[0.24em] text-white/65">
            Less text. More art.
          </p>
        </section>

        <nav className="sticky top-20 z-30 -mx-1 overflow-x-auto px-1 lg:hidden" data-gallery-scroll>
          <div className="inline-flex gap-2 rounded-2xl bg-black/65 p-2 backdrop-blur">
            {periodSections.map((section) => (
              <a
                key={`mobile-${section.id}`}
                href={`#period-${section.id}`}
                className={`rounded-full px-3 py-2 text-[0.65rem] uppercase tracking-[0.2em] transition ${
                  activeSection === section.id
                    ? "bg-white text-black"
                    : "bg-white/10 text-white/70"
                }`}
              >
                {section.timeframe}
              </a>
            ))}
          </div>
        </nav>

        <section className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
          <aside className="hidden lg:block">
            <div className="sticky top-28 rounded-3xl bg-black/35 p-5 backdrop-blur">
              <p className="mb-5 text-xs uppercase tracking-[0.28em] text-white/45">
                Timeframe
              </p>
              <ol className="space-y-3">
                {periodSections.map((section) => (
                  <li key={`desktop-${section.id}`}>
                    <a
                      href={`#period-${section.id}`}
                      className={`block rounded-2xl px-3 py-3 transition ${
                        activeSection === section.id
                          ? "bg-white text-black"
                          : "bg-white/5 text-white/75 hover:bg-white/10"
                      }`}
                    >
                      <p className="text-[0.62rem] uppercase tracking-[0.24em]">
                        {section.timeframe}
                      </p>
                      <p className="mt-1 text-sm">{section.title}</p>
                    </a>
                  </li>
                ))}
              </ol>
            </div>
          </aside>

          <div className="space-y-8">
            {periodSections.map((section) => (
              <article
                key={section.id}
                id={`period-${section.id}`}
                data-period-section
                data-period-id={section.id}
                className="scroll-mt-28 rounded-[2rem] bg-black/22 p-4 sm:p-6"
              >
                <header className="mb-4 space-y-1 pb-1">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                    {section.timeframe}
                  </p>
                  <h2 className="text-2xl text-white sm:text-3xl">{section.title}</h2>
                </header>

                <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {section.items.map((artwork) => (
                    <figure
                      key={artwork.id}
                      className="overflow-hidden rounded-2xl bg-[color:var(--color-surface)]/85"
                    >
                      <figcaption className="flex items-center justify-between gap-3 px-3 py-2">
                        <div className="min-w-0">
                          <p className="truncate text-xs uppercase tracking-[0.18em] text-white/70">
                            nutuart atelier
                          </p>
                          <p className="truncate text-[0.7rem] uppercase tracking-[0.14em] text-white/45">
                            {collectionLabels[artwork.collection]}
                          </p>
                        </div>
                        <span className="rounded-full bg-white/10 px-2 py-1 text-[0.62rem] uppercase tracking-[0.16em] text-white/60">
                          {artwork.year}
                        </span>
                      </figcaption>
                      <div className="relative aspect-square">
                        <Image
                          src={artwork.image}
                          alt={artwork.title}
                          fill
                          className="object-cover"
                          sizes="(min-width: 1280px) 30vw, (min-width: 640px) 44vw, 92vw"
                        />
                      </div>
                      <figcaption className="space-y-1 px-3 py-2">
                        <p className="text-sm leading-tight text-white">{artwork.title}</p>
                        <p className="text-xs uppercase tracking-[0.16em] text-white/55">
                          {artwork.medium}
                        </p>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-3xl bg-black/30 p-6 text-center sm:p-8">
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="rounded-full bg-white/10 px-5 py-3 text-xs uppercase tracking-[0.28em] text-white transition hover:bg-white/20"
            >
              Inapoi la galerie
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-transparent bg-white px-5 py-3 text-xs uppercase tracking-[0.28em] text-black transition hover:bg-white/85"
            >
              Stabilim perioadele
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
