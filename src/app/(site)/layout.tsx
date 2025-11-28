import type { ReactNode } from "react";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-[var(--page-bg)] text-foreground">
      <SiteHeader />
      <main className="flex-1 pt-10 sm:pt-14 lg:pt-18">{children}</main>
      <SiteFooter />
    </div>
  );
}
