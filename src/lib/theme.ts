"use client";

export type Theme = "light" | "dark";

const KEY = "theme";
const QUERY = "(prefers-color-scheme: dark)";
const listeners = new Set<() => void>();
let stopListening: (() => void) | undefined;
let inMemoryTheme: Theme | null = null;

function validTheme(value: unknown): Theme | null {
  return value === "light" || value === "dark" ? value : null;
}

function savedTheme(): Theme | null {
  try {
    return validTheme(window.localStorage.getItem(KEY));
  } catch {
    return inMemoryTheme;
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
  inMemoryTheme = theme;
  try {
    window.localStorage.setItem(KEY, theme);
  } catch {
    // The current page still works when storage is unavailable.
  }
  applyTheme(theme);
}

export function subscribeToTheme(listener: () => void): () => void {
  listeners.add(listener);
  if (!stopListening) {
    const media = window.matchMedia(QUERY);
    const syncTheme = () => applyTheme(savedTheme() ?? (media.matches ? "dark" : "light"));
    const onStorage = (event: StorageEvent) => {
      if (event.key === KEY || event.key === null) syncTheme();
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
