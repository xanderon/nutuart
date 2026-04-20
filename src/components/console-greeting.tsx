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
      "%cNutuArt%c Salut, curiosule. Daca ai deschis consola, inseamna ca avem gusturi similare.",
      "background:#101827;color:#f6d28e;padding:6px 10px;border-radius:999px;font-weight:700;",
      "color:#8aa0a8;font-weight:500;"
    );
  }, []);

  return null;
}
