"use client";

import { useTheme } from "../hooks/useTheme";

/**
 * Client component wrapper to initialize theme.
 * Used in Server Components that need theme initialization.
 */
export function ThemeInitializer() {
  useTheme();
  return null;
}
