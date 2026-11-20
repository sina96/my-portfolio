"use client";

export type Theme = "light" | "dark";

const KEY = "theme";
const QUERY = "(prefers-color-scheme: dark)";
const listeners = new Set<() => void>();
let stopListening: (() => void) | undefined;
// Explicit choice that couldn't be saved; wins over stale storage until the next save or cross-tab change.
let unsavedTheme: Theme | null = null;

function validTheme(value: unknown): Theme | null {
  return value === "light" || value === "dark" ? value : null;
}

function savedTheme(): Theme | null {
  if (unsavedTheme) return unsavedTheme;
  try {
    return validTheme(window.localStorage.getItem(KEY));
  } catch {
    return null;
  }
}

export function getTheme(): Theme | null {
  return validTheme(document.documentElement.dataset.theme);
}

export function getServerTheme(): null {
  return null;
}

function applyTheme(theme: Theme): void {
  if (getTheme() === theme) return;
  document.documentElement.dataset.theme = theme;
  listeners.forEach((listener) => listener());
}

export function setTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(KEY, theme);
    unsavedTheme = null;
  } catch {
    // The current page keeps the choice when storage is unavailable.
    unsavedTheme = theme;
  }
  applyTheme(theme);
}

export function subscribeToTheme(listener: () => void): () => void {
  listeners.add(listener);
  if (!stopListening) {
    const media = window.matchMedia(QUERY);
    const syncTheme = () => applyTheme(savedTheme() ?? (media.matches ? "dark" : "light"));
    const onStorage = (event: StorageEvent) => {
      if (event.key === KEY || event.key === null) {
        unsavedTheme = null;
        syncTheme();
      }
    };
    media.addEventListener("change", syncTheme);
    window.addEventListener("storage", onStorage);
    syncTheme();
    stopListening = () => {
      media.removeEventListener("change", syncTheme);
      window.removeEventListener("storage", onStorage);
    };
  }

  return () => {
    listeners.delete(listener);
    if (!listeners.size) {
      stopListening?.();
      stopListening = undefined;
    }
  };
}
