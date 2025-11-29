"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { ThemeSwitcher } from "./theme-switcher";

const navLinks = [
  { href: "/", label: "Galerie" },
  { href: "/artist", label: "Artist" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed top-6 z-50 w-full px-4">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between rounded-full border border-white/10 bg-black/40 px-4 py-3 text-xs uppercase tracking-[0.35em] text-white/70 backdrop-blur">
        <Link href="/" className="font-display text-sm tracking-tight text-white">
          NutuArt
        </Link>
        <nav className="hidden items-center gap-4 md:flex">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "transition duration-150",
                  isActive ? "text-white" : "text-white/60 hover:text-white"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-full border border-white/30 md:hidden"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          <span className="sr-only">Meniu</span>
          <span className="h-0.5 w-4 bg-white" />
        </button>
        <div className="hidden items-center gap-3 md:flex">
          <ThemeSwitcher />
        </div>
      </div>
      {mobileOpen && (
        <div className="mt-4 space-y-4 rounded-3xl border border-white/10 bg-black/70 p-6 text-center text-sm uppercase tracking-[0.35em] text-white/70 md:hidden">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.href ||
              (link.href !== "/" && pathname.startsWith(link.href));
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block py-3",
                  isActive ? "text-white" : "text-white/60"
                )}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="flex justify-center">
            <ThemeSwitcher />
          </div>
        </div>
      )}
    </header>
  );
}
