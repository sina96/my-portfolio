"use client";
import { useState, useEffect } from "react";

export function useTheme() {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    // Check localStorage for saved preference first
    const saved = localStorage.getItem("theme");
    if (saved) {
      // User has a saved preference
      const isDark = saved === "dark";
      setDarkMode(isDark);
      document.documentElement.setAttribute("data-theme", isDark ? "dark" : "light");
    } else {
      // No saved preference, check system/browser preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      setDarkMode(prefersDark);
      document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    document.documentElement.setAttribute("data-theme", newMode ? "dark" : "light");
    localStorage.setItem("theme", newMode ? "dark" : "light");
  };

  return { darkMode, toggleDarkMode };
}
