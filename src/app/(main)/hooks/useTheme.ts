"use client";
import { useEffect, useLayoutEffect, useState } from "react";

function applyTheme(isDark: boolean) {
  document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
}

function resolveInitialTheme(): boolean {
  const saved = localStorage.getItem("theme");
  if (saved === "dark") return true;
  if (saved === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function useTheme() {
  // IMPORTANT: keep initializer pure to avoid hydration issues.
  // We intentionally start with "light" and resolve/apply the real theme in effects.
  const [darkMode, setDarkMode] = useState<boolean>(() => false);

  useLayoutEffect(() => {
    // DOM mutations belong in an effect, not the state initializer.
    // useLayoutEffect runs before paint on the client, reducing visual flicker.
    if (typeof window === "undefined") return;

    const initial = resolveInitialTheme();
    setDarkMode(initial);
    applyTheme(initial);
  }, []);

  useEffect(() => {
    // Sync with system preference changes
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't set a preference
      if (!localStorage.getItem("theme")) {
        const prefersDark = e.matches;
        setDarkMode(prefersDark);
        applyTheme(prefersDark);
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      const newMode = !prev;
      applyTheme(newMode);
      localStorage.setItem("theme", newMode ? "dark" : "light");
      return newMode;
    });
  };

  return { darkMode, toggleDarkMode };
}
