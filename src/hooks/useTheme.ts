import { useState, useEffect } from "react";

export type ThemeKey = "dark" | "light" | "ocean-light" | "warm-light";

export interface ThemeOption {
  key: ThemeKey;
  label: string;
  preview: string; // CSS gradient for preview swatch
}

export const themeOptions: ThemeOption[] = [
  { key: "dark", label: "Dark Command", preview: "linear-gradient(135deg, hsl(222,47%,7%), hsl(187,72%,50%))" },
  { key: "light", label: "Clean Light", preview: "linear-gradient(135deg, hsl(0,0%,98%), hsl(210,100%,56%))" },
  { key: "ocean-light", label: "Ocean Breeze", preview: "linear-gradient(135deg, hsl(200,30%,96%), hsl(187,72%,40%))" },
  { key: "warm-light", label: "Warm Sand", preview: "linear-gradient(135deg, hsl(40,30%,96%), hsl(25,80%,50%))" },
];

const STORAGE_KEY = "flood-guard-theme";

export function useTheme() {
  const [theme, setThemeState] = useState<ThemeKey>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(STORAGE_KEY) as ThemeKey) || "dark";
    }
    return "dark";
  });

  useEffect(() => {
    const root = document.documentElement;
    // Remove all theme classes
    root.classList.remove("dark", "light", "ocean-light", "warm-light");
    root.classList.add(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  return { theme, setTheme: setThemeState };
}
