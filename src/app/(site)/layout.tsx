import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SnowOverlay } from "@/components/seasonal/snow-overlay";
import { isChristmasSeason } from "@/lib/seasonal";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative flex min-h-screen flex-col bg-[var(--page-bg)] text-foreground">
      {isChristmasSeason ? <SnowOverlay /> : null}
      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader />
        <main className="flex-1 pt-10 sm:pt-14 lg:pt-18">{children}</main>
        <SiteFooter />
      </div>
    </div>
  );
}
