export type ResolvedTheme = "dark" | "light";
export type ThemePreference = "system" | ResolvedTheme;

export const themeStorageKey = "nutuart-theme";
export const defaultThemePreference: ThemePreference = "system";

export function resolveThemePreference(
  preference: ThemePreference,
  systemTheme: ResolvedTheme
): ResolvedTheme {
  return preference === "system" ? systemTheme : preference;
}

