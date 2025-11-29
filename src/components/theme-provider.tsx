"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { defaultTheme, themes, type ThemeName } from "@/lib/themes";

type ThemeContextValue = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: defaultTheme,
  setTheme: () => {},
});

const STORAGE_KEY = "nutuart-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(defaultTheme);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) as ThemeName | null;
    if (stored && themes[stored]) {
      setThemeState(stored);
      document.documentElement.dataset.theme = stored;
    } else {
      document.documentElement.dataset.theme = defaultTheme;
    }
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      setTheme: (name: ThemeName) => {
        if (themes[name]) setThemeState(name);
      },
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
