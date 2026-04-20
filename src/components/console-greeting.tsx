"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    __nutuArtConsoleGreetingShown?: boolean;
  }
}

export function ConsoleGreeting() {
  useEffect(() => {
    if (window.__nutuArtConsoleGreetingShown) {
      return;
    }

    window.__nutuArtConsoleGreetingShown = true;

    console.log(
      "%cArtist Nuțu Marcel Marius",
      "background:#101827;color:#f6d28e;padding:6px 10px;border-radius:999px;font-weight:700;letter-spacing:0.04em;"
    );
    console.log(
      "%cSticlă decorativă, vitralii și proiecte custom pentru spații care trebuie să rămână în minte.",
      "color:#8aa0a8;font-weight:500;"
    );
    console.log(
      "%cDacă ai ajuns aici, probabil îți plac și ție detaliile bine făcute.",
      "color:#4f6365;font-style:italic;"
    );
  }, []);

  return null;
}
