"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

type Language = "ro" | "en";
type Theme = "dark" | "light";

const portraitImages = [
  "/images/collections/artist-nutu-marcel/ChatGPT Image Feb 14, 2026, 11_30_33 AM.png",
  "/images/collections/artist-nutu-marcel/ChatGPT Image Feb 14, 2026, 11_34_59 AM.png",
  "/images/collections/artist-nutu-marcel/ChatGPT Image Feb 14, 2026, 11_52_16 AM.png",
  "/images/collections/artist-nutu-marcel/ChatGPT Image Feb 14, 2026, 11_55_39 AM.png",
  "/images/collections/artist-nutu-marcel/ChatGPT Image Feb 14, 2026, 11_57_40 AM.png",
  "/images/collections/artist-nutu-marcel/ChatGPT Image Feb 14, 2026, 11_58_41 AM.png",
];

const copy = {
  ro: {
    navGallery: "Gallery",
    navAbout: "About",
    navContact: "Contact",
    badge: "Pui Artist de sticla",
    intro:
      "Portrete si prezente din atelier, intr-o compozitie curata care pune accent pe artist.",
    rowTop: "Sus",
    rowMiddle: "Mijloc",
    rowBottom: "Jos",
    modeLabel: "Light/Dark",
    langLabel: "EN/RO",
  },
  en: {
    navGallery: "Gallery",
    navAbout: "About",
    navContact: "Contact",
    badge: "Glass Artist",
    intro:
      "Portraits and studio presence in a clean composition focused on the artist.",
    rowTop: "Top",
    rowMiddle: "Middle",
    rowBottom: "Bottom",
    modeLabel: "Light/Dark",
    langLabel: "EN/RO",
  },
} as const;

export default function ExperimentalTwoPage() {
  const [theme, setTheme] = useState<Theme>("dark");
  const [language, setLanguage] = useState<Language>("ro");
  const text = copy[language];

  const rowLabels = useMemo(
    () => [text.rowTop, text.rowMiddle, text.rowBottom],
    [text.rowBottom, text.rowMiddle, text.rowTop]
  );

  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen ${
        isDark
          ? "bg-[radial-gradient(circle_at_10%_20%,#2a2d3f_0%,#11131d_45%,#08090f_100%)] text-[#f5f5f8]"
          : "bg-[radial-gradient(circle_at_15%_12%,#fffaf0_0%,#f4f1eb_50%,#ebe7df_100%)] text-[#1a1a1f]"
      }`}
    >
      <div className="mx-auto w-full max-w-7xl px-4 pb-14 pt-8 sm:px-6 lg:px-10">
        <header
          className={`rounded-[2rem] border px-5 py-5 backdrop-blur sm:px-7 ${
            isDark
              ? "border-white/10 bg-[#141723]/75 shadow-[0_35px_90px_-60px_rgba(0,0,0,0.75)]"
              : "border-black/10 bg-[#fffcf6]/75 shadow-[0_35px_90px_-60px_rgba(60,40,10,0.35)]"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p
                className={`text-[0.64rem] uppercase tracking-[0.34em] ${
                  isDark ? "text-white/70" : "text-black/55"
                }`}
              >
                Artist
              </p>
              <h1 className="mt-1 font-display text-2xl leading-tight sm:text-4xl">
                Nutu Marcel Marius
              </h1>
            </div>

            <nav className="flex items-center gap-4 text-sm sm:gap-7 sm:text-base">
              <Link href="/gallery">{text.navGallery}</Link>
              <Link href="/artist">{text.navAbout}</Link>
              <Link href="/contact">{text.navContact}</Link>
            </nav>

            <div className="flex flex-wrap items-center gap-3">
              <Toggle
                label={text.modeLabel}
                enabled={!isDark}
                onClick={() => setTheme(isDark ? "light" : "dark")}
              />
              <Toggle
                label={text.langLabel}
                enabled={language === "en"}
                onClick={() => setLanguage(language === "ro" ? "en" : "ro")}
              />
            </div>
          </div>

          <p
            className={`mt-5 text-sm sm:text-base ${
              isDark ? "text-white/78" : "text-black/70"
            }`}
          >
            {text.badge}
          </p>
          <p
            className={`mt-2 max-w-3xl text-sm sm:text-base ${
              isDark ? "text-white/60" : "text-black/55"
            }`}
          >
            {text.intro}
          </p>
        </header>

        <section className="mt-9 space-y-7">
          {[0, 1, 2].map((row) => {
            const pair = portraitImages.slice(row * 2, row * 2 + 2);

            return (
              <div key={row} className="space-y-3">
                <p
                  className={`text-[0.62rem] uppercase tracking-[0.32em] ${
                    isDark ? "text-white/55" : "text-black/45"
                  }`}
                >
                  {rowLabels[row]}
                </p>
                <div className="grid gap-5 md:grid-cols-2">
                  {pair.map((src, index) => (
                    <figure
                      key={src}
                      className={`group relative overflow-hidden rounded-[1.8rem] border ${
                        isDark
                          ? "border-white/12 bg-[linear-gradient(140deg,rgba(240,173,94,0.08),rgba(102,117,255,0.05))]"
                          : "border-black/10 bg-[linear-gradient(140deg,rgba(255,211,130,0.32),rgba(255,255,255,0.92))]"
                      }`}
                    >
                      <div className="relative aspect-[5/4]">
                        <Image
                          src={src}
                          alt={`Artist portrait ${row * 2 + index + 1}`}
                          fill
                          className="object-contain p-5 transition duration-500 group-hover:scale-[1.03]"
                          sizes="(min-width: 768px) 45vw, 100vw"
                          priority={row === 0}
                        />
                      </div>
                    </figure>
                  ))}
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </div>
  );
}

function Toggle({
  label,
  enabled,
  onClick,
}: {
  label: string;
  enabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-full border border-current/25 px-3 py-1.5 text-xs"
    >
      <span className="tracking-[0.12em]">{label}</span>
      <span
        className={`flex h-5 w-9 items-center rounded-full p-0.5 transition ${
          enabled ? "bg-[#4b8bff]" : "bg-black/30"
        }`}
      >
        <span
          className={`h-4 w-4 rounded-full bg-white transition ${
            enabled ? "translate-x-4" : "translate-x-0"
          }`}
        />
      </span>
    </button>
  );
}
