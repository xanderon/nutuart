import type { ReactNode } from "react";
import { AssistantWidgetSlot } from "@/components/ai/assistant-widget-slot";
import { ConsoleGreeting } from "@/components/console-greeting";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SnowOverlay } from "@/components/seasonal/snow-overlay";
import { isChristmasSeason } from "@/lib/seasonal";
import { ThemeProvider } from "@/components/theme-provider";

export default function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <div className="relative flex min-h-screen flex-col bg-[var(--page-bg)] text-foreground">
        {isChristmasSeason ? <SnowOverlay /> : null}
        <div className="relative z-10 flex min-h-screen flex-col">
          <ConsoleGreeting />
          <SiteHeader />
          <main className="flex-1 pt-10 sm:pt-14 lg:pt-18">{children}</main>
          <SiteFooter />
          <AssistantWidgetSlot />
        </div>
      </div>
    </ThemeProvider>
  );
}
