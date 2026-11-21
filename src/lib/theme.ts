"use client";

export type Theme = "light" | "dark";

export const THEME_TRANSITION_MS = 1500;
const FRAME_MS = THEME_TRANSITION_MS / 10;
interface ThemeTransition { target: Theme; started: number; from: number; to: number }

/** Resolve the currently displayed discrete dusk frame. */
export function themeFrameAt({ started, from, to }: ThemeTransition, now: number): number {
  const distance = Math.min(Math.abs(to - from), Math.max(0, Math.floor((now - started) / FRAME_MS)));
  return from + Math.sign(to - from) * distance;
}
let transition: ThemeTransition | null = null;
let midpoint: number | undefined;
let end: number | undefined;

export const getThemeTransition = () => transition;
export const getThemeTarget = () => transition?.target ?? getTheme();

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

export function finishThemeTransition(theme: Theme | null = transition?.target ?? null): void {
  if (transition) {
    window.clearTimeout(midpoint);
    window.clearTimeout(end);
    transition = null;
    if (theme) document.documentElement.dataset.theme = theme;
    listeners.forEach((listener) => listener());
  } else if (theme) applyTheme(theme);
}

export function setTheme(theme: Theme, animate = false): void {
  try {
    window.localStorage.setItem(KEY, theme);
    unsavedTheme = null;
  } catch {
    // The current page keeps the choice when storage is unavailable.
    unsavedTheme = theme;
  }
  if (!animate || (!transition && getTheme() === theme) || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    finishThemeTransition(theme);
    return;
  }
  const started = performance.now();
  const from = transition ? themeFrameAt(transition, started) : getTheme() === "dark" ? 9 : 0;
  const to = theme === "dark" ? 9 : 0;
  window.clearTimeout(midpoint);
  window.clearTimeout(end);
  if (from === to) {
    finishThemeTransition(theme);
    return;
  }
  transition = { target: theme, started, from, to };
  if (getTheme() !== theme) {
    const stepsToCross = theme === "dark" ? 5 - from : from - 4;
    midpoint = window.setTimeout(() => applyTheme(theme), Math.max(0, stepsToCross) * FRAME_MS);
  }
  end = window.setTimeout(() => finishThemeTransition(), (Math.abs(to - from) + 1) * FRAME_MS);
  listeners.forEach((listener) => listener());
}

export function subscribeToTheme(listener: () => void): () => void {
  listeners.add(listener);
  if (!stopListening) {
    const media = window.matchMedia(QUERY);
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncTheme = () => finishThemeTransition(savedTheme() ?? (media.matches ? "dark" : "light"));
    const onMotion = () => { if (motion.matches) finishThemeTransition(); };
    const onStorage = (event: StorageEvent) => {
      if (event.key === KEY || event.key === null) {
        unsavedTheme = null;
        syncTheme();
      }
    };
    media.addEventListener("change", syncTheme);
    motion.addEventListener("change", onMotion);
    window.addEventListener("storage", onStorage);
    syncTheme();
    stopListening = () => {
      media.removeEventListener("change", syncTheme);
      motion.removeEventListener("change", onMotion);
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
