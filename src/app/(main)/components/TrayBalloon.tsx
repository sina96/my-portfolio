"use client";

import { useEffect, useState } from "react";

const HERO_HINT = "xp-hero-tip-seen";
export const MENU_HINT = "xp-menu-hint-seen";
const seenThisPage = new Set<string>();

function hasSeenTip(key: string): boolean {
  if (seenThisPage.has(key)) return true;
  try {
    return localStorage.getItem(key) === "1";
  } catch {
    return false;
  }
}

export function markHintSeen(key: string): void {
  seenThisPage.add(key);
  try {
    localStorage.setItem(key, "1");
  } catch {
    // Retain the flag for this page when storage is unavailable.
  }
}

interface HintBalloonProps {
  storageKey: string;
  delay: number;
  duration: number;
  title?: string;
  message: string;
  atTop?: boolean;
  onDismiss?: () => void;
}

/** Mount only while the hint is eligible to show. */
export function HintBalloon({ storageKey, delay, duration, title, message, atTop, onDismiss }: Readonly<HintBalloonProps>) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (hasSeenTip(storageKey)) return;
    let hide: number | undefined;
    const show = window.setTimeout(() => {
      if ((atTop && window.scrollY > 4) || hasSeenTip(storageKey)) return;
      markHintSeen(storageKey);
      setVisible(true);
      hide = window.setTimeout(() => setVisible(false), duration);
    }, delay);
    return () => {
      window.clearTimeout(show);
      window.clearTimeout(hide);
    };
  }, [atTop, delay, duration, storageKey]);

  if (!visible) return null;

  return (
    <div className="xp-tray-balloon">
      <div role="status">{title && <strong>{title}</strong>}<p>{message}</p></div>
      <button type="button" onClick={() => {
        setVisible(false);
        onDismiss?.();
      }} aria-label="Dismiss tip">×</button>
    </div>
  );
}

export function TrayBalloon({ eligible }: Readonly<{ eligible: boolean }>) {
  return eligible && <HintBalloon storageKey={HERO_HINT} delay={4000} duration={10_000}
    title="psst…" message="try closing the window, the view is nicer" atTop />;
}
