"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import { defaultTheme, type ThemeName } from "@/lib/themes";

type ThemeContextValue = {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: defaultTheme,
  setTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme: ThemeName = defaultTheme;

  useEffect(() => {
    document.documentElement.dataset.theme = "light";
  }, []);

  const value = useMemo(
    () => ({
      theme,
      setTheme: () => {},
    }),
    [theme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  return useContext(ThemeContext);
}
