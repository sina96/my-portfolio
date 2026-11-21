"use client";

import { useSyncExternalStore } from "react";
import { getServerTheme, getTheme, getThemeTarget, setTheme, subscribeToTheme } from "@/lib/theme";

export function useTheme() {
  const theme = useSyncExternalStore(subscribeToTheme, getTheme, getServerTheme);

  return {
    theme,
    darkMode: theme === "dark",
    toggleDarkMode: () => setTheme(getThemeTarget() === "dark" ? "light" : "dark",
      window.location.pathname === "/" && Boolean(document.querySelector(".hill-header-intro [data-theme-ready]"))),
  };
}
