"use client";

import { useLayoutEffect } from "react";

/** Start each landing visit at the hills without changing sub-page restoration. */
export function useLandingVisit(enabled: boolean): void {
  useLayoutEffect(() => {
    if (!enabled) return;

    function reset(): void {
      if (window.location.pathname !== "/") return;
      window.history.scrollRestoration = "manual";
      if (!window.location.hash) window.scrollTo({ top: 0, behavior: "instant" });
    }

    function onPageShow(event: PageTransitionEvent): void {
      if (event.persisted) reset();
    }

    reset();
    window.addEventListener("pageshow", onPageShow);
    return () => {
      window.removeEventListener("pageshow", onPageShow);
      window.history.scrollRestoration = "auto";
    };
  }, [enabled]);
}
