"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  defaultThemePreference,
  resolveThemePreference,
  themeStorageKey,
  type ResolvedTheme,
  type ThemePreference,
} from "@/lib/themes";

type ThemeContextValue = {
  preference: ThemePreference;
  resolvedTheme: ResolvedTheme;
  setThemePreference: (preference: ThemePreference) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  preference: defaultThemePreference,
  resolvedTheme: "dark",
  setThemePreference: () => {},
  toggleTheme: () => {},
});

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") {
    return "dark";
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: ResolvedTheme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreference] = useState<ThemePreference>(() => {
    if (typeof window === "undefined") {
      return defaultThemePreference;
    }

    const stored = window.localStorage.getItem(themeStorageKey);
    return stored === "light" || stored === "dark" || stored === "system"
      ? stored
      : defaultThemePreference;
  });
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(() => getSystemTheme());

  useEffect(() => {
    applyTheme(resolveThemePreference(preference, getSystemTheme()));

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (event: MediaQueryListEvent) => {
      const nextTheme: ResolvedTheme = event.matches ? "dark" : "light";
      setSystemTheme(nextTheme);
      setPreference((currentPreference) => {
        applyTheme(resolveThemePreference(currentPreference, nextTheme));
        return currentPreference;
      });
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [preference]);

  const resolvedTheme = resolveThemePreference(preference, systemTheme);

  const value = useMemo<ThemeContextValue>(
    () => ({
      preference,
      resolvedTheme,
      setThemePreference: (nextPreference) => {
        setPreference(nextPreference);
        window.localStorage.setItem(themeStorageKey, nextPreference);
        applyTheme(resolveThemePreference(nextPreference, getSystemTheme()));
      },
      toggleTheme: () => {
        const nextTheme: ResolvedTheme = resolvedTheme === "dark" ? "light" : "dark";
        setPreference(nextTheme);
        window.localStorage.setItem(themeStorageKey, nextTheme);
        applyTheme(nextTheme);
      },
    }),
    [preference, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
