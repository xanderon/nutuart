"use client";

import { themes, type ThemeName } from "@/lib/themes";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";

const entries = Object.keys(themes) as ThemeName[];

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center gap-1 rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[10px] uppercase tracking-[0.28em] text-white/70 shadow-[0_20px_50px_-40px_rgba(0,0,0,0.8)] backdrop-blur">
      {entries.map((entry) => (
        <button
          key={entry}
          type="button"
          onClick={() => setTheme(entry)}
          className={cn(
            "rounded-full px-3 py-1 transition duration-150 hover:text-white",
            theme === entry
              ? "bg-white/15 text-white shadow-[0_10px_30px_-18px_rgba(0,0,0,0.7)]"
              : "text-white/60"
          )}
        >
          {entry}
        </button>
      ))}
    </div>
  );
}
