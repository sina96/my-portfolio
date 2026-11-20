"use client";

import { useSyncExternalStore } from "react";
import { getServerTheme, getTheme, setTheme, subscribeToTheme } from "@/lib/theme";

export function useTheme() {
  const theme = useSyncExternalStore(subscribeToTheme, getTheme, getServerTheme);

  return {
    theme,
    darkMode: theme === "dark",
    toggleDarkMode: () => setTheme(getTheme() === "dark" ? "light" : "dark"),
  };
}
