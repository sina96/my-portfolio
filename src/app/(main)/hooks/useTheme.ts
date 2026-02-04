"use client";
import { useState, useEffect } from "react";

function getInitialTheme(): boolean {
  // Check if we're in a browser environment
  if (typeof window === "undefined") {
    // Server-side: return default (false = light mode)
    return false;
  }

  // Client-side: Check localStorage for saved preference first
  const saved = localStorage.getItem("theme");
  if (saved) {
    // User has a saved preference
    const isDark = saved === "dark";
    // Set theme attribute immediately
    document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    return isDark;
  } else {
    // No saved preference, check system/browser preference
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    // Set theme attribute immediately
    document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
    return prefersDark;
  }
}

export function useTheme() {
  // Use lazy initializer to compute theme synchronously on client
  const [darkMode, setDarkMode] = useState(getInitialTheme);

  useEffect(() => {
    // Re-check theme on mount to handle SSR mismatch
    const saved = localStorage.getItem("theme");
    if (saved) {
      const isDark = saved === "dark";
      setDarkMode(isDark);
      document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    } else {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDarkMode(prefersDark);
      document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
    }

    // Sync with system preference changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      // Only update if user hasn't set a preference
      if (!localStorage.getItem("theme")) {
        const prefersDark = e.matches;
        setDarkMode(prefersDark);
        document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.setAttribute("data-theme", newMode ? "dark" : "light");
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  return { darkMode, toggleDarkMode };
}
