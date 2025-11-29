export type ThemeName = "dark" | "light" | "blue";

export const themes: Record<
  ThemeName,
  Record<
    | "--page-bg"
    | "--color-surface"
    | "--color-elevated"
    | "--color-foreground"
    | "--color-muted"
    | "--color-accent"
    | "--color-accent-strong"
    | "--color-outline"
    | "--gradient-aurora"
    | "--shadow-soft"
    | "--radius-lg"
    | "--radius-full"
  ,
    string
  >
> = {
  dark: {
    "--page-bg": "#030409",
    "--color-surface": "#080a12",
    "--color-elevated": "#0f111b",
    "--color-foreground": "#f3f4f8",
    "--color-muted": "#8b90a3",
    "--color-accent": "#f4c56c",
    "--color-accent-strong": "#ff7d64",
    "--color-outline": "rgba(255, 255, 255, 0.08)",
    "--gradient-aurora": "radial-gradient(circle at 20% 20%, #1c1f2b, transparent 45%)",
    "--shadow-soft": "0 30px 180px -60px rgba(0, 0, 0, 0.8)",
    "--radius-lg": "1.5rem",
    "--radius-full": "999px",
  },
  light: {
    "--page-bg": "#f8f9fb",
    "--color-surface": "#ffffff",
    "--color-elevated": "#f2f4f7",
    "--color-foreground": "#20232d",
    "--color-muted": "#556070",
    "--color-accent": "#2f7cf6",
    "--color-accent-strong": "#1b5bbd",
    "--color-outline": "rgba(0, 0, 0, 0.08)",
    "--gradient-aurora": "radial-gradient(circle at 35% 15%, rgba(47,124,246,0.12), transparent 45%)",
    "--shadow-soft": "0 30px 120px -60px rgba(0, 0, 0, 0.25)",
    "--radius-lg": "1.5rem",
    "--radius-full": "999px",
  },
  blue: {
    "--page-bg": "#1f2f3c",
    "--color-surface": "#324456",
    "--color-elevated": "#3c4f64",
    "--color-foreground": "#f8f9f9",
    "--color-muted": "#9ee2e7",
    "--color-accent": "#00b9c6",
    "--color-accent-strong": "#9ee2e7",
    "--color-outline": "rgba(255, 255, 255, 0.10)",
    "--gradient-aurora": "radial-gradient(circle at 25% 20%, rgba(0,185,198,0.22), transparent 50%)",
    "--shadow-soft": "0 26px 140px -72px rgba(0, 0, 0, 0.7)",
    "--radius-lg": "1.5rem",
    "--radius-full": "999px",
  },
};

export const defaultTheme: ThemeName = "dark";
