import { useEffect } from "react";
import type { RefObject } from "react";
import { getLandingStop } from "./useLandingGlide";

const MOBILE = "(width < 760px)";
const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
const SCENE_CELL = 8; // SVG units per raster cell.

/** Update the landing's visual layers without rendering React during scroll. */
export function useWallpaperScroll(
  headerRef: RefObject<HTMLElement | null>,
  sceneRef: RefObject<HTMLDivElement | null>,
  enabled: boolean,
  sceneHeight: number,
): void {
  useEffect(() => {
    const header = headerRef.current;
    const scene = sceneRef.current;
    const workspace = header?.parentElement;
    if (!enabled || !header || !scene || !workspace) return;

    const mobile = window.matchMedia(MOBILE);
    const reduced = window.matchMedia(REDUCED_MOTION);
    const hasScrollEnd = "onscrollend" in document;
    const hint = header.querySelector<HTMLButtonElement>(".hill-hint");
    let frame = 0;
    let timer = 0;
    let threshold = 1;
    let contentStop = 1;
    let previousY = window.scrollY;
    let direction = 0;
    let touchActive = false;
    let settledDuringTouch = false;
    let previousValues: string[] = [];
    const properties = ["--land-shift", "--cloud-shift", "--sky-shift", "--hero-opacity", "--hero-shift", "--veil-opacity", "--landing-content-opacity"];

    const update = () => {
      frame = 0;
      const p = Math.max(0, Math.min(window.scrollY / threshold, 1));
      const still = reduced.matches;
      const hero = still ? 0 : Math.min(p / .6, 1);
      const shift = (depth: number) => `${still ? 0 : -Math.round(p * sceneHeight * .06 * depth / SCENE_CELL) * SCENE_CELL}px`;
      const values = [
        shift(1), shift(.6), shift(.3), String(1 - hero), `${-hero * 60}px`,
        String(still ? (p > .5 ? .6 : 0) : .6 * Math.max(0, (p - .3) / .7)),
        String(still ? 1 : Math.max(0, (p - .45) / .55)),
      ];
      properties.forEach((property, index) => {
        if (previousValues[index] !== values[index]) workspace.style.setProperty(property, values[index]);
      });
      previousValues = values;
      const state = p >= 1 ? "rest" : p > 0 && !still ? "moving" : "idle";
      if (scene.dataset.wallpaper !== state) scene.dataset.wallpaper = state;
      if (hero === 1 && hint && hint === document.activeElement) {
        document.getElementById("xp-start")?.focus({ preventScroll: true });
      }
      header.toggleAttribute("data-hero-faded", hero === 1);
    };
    const queue = () => { if (!frame) frame = requestAnimationFrame(update); };
    const measure = () => {
      // Finish the visual transition in half a screen, but land with the first window at 12px.
      threshold = Math.max(1, Math.ceil(header.offsetHeight * .5));
      contentStop = getLandingStop(header);
      queue();
    };
    const settle = () => {
      if (!mobile.matches || reduced.matches) return;
      if (touchActive) { settledDuringTouch = true; return; }
      const y = window.scrollY;
      if (y <= 0 || y >= contentStop) return;
      const midpoint = contentStop * (.5 - direction * .05);
      window.scrollTo({ top: y < midpoint ? 0 : contentStop, behavior: "smooth" });
    };
    const onScroll = () => {
      const y = window.scrollY;
      if (y !== previousY) direction = Math.sign(y - previousY);
      previousY = y;
      settledDuringTouch = false;
      queue();
      window.clearTimeout(timer);
      if (!hasScrollEnd && mobile.matches && !reduced.matches) {
        timer = window.setTimeout(settle, 140);
      }
    };
    const touchStart = () => { touchActive = true; settledDuringTouch = false; };
    const touchEnd = (event: TouchEvent) => {
      touchActive = event.touches.length > 0;
      if (!touchActive && settledDuringTouch) {
        // Give native momentum a chance to start before treating a held drag as settled.
        window.clearTimeout(timer);
        timer = window.setTimeout(settle, 140);
      }
    };
    const cancelPendingSettle = () => { window.clearTimeout(timer); };
    const observer = new ResizeObserver(measure);
    observer.observe(header);
    window.addEventListener("scroll", onScroll, { passive: true });
    if (hasScrollEnd) document.addEventListener("scrollend", settle);
    window.addEventListener("touchstart", touchStart, { passive: true });
    window.addEventListener("touchend", touchEnd, { passive: true });
    window.addEventListener("touchcancel", touchEnd, { passive: true });
    reduced.addEventListener("change", queue);
    measure();
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
      cancelPendingSettle();
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("scrollend", settle);
      window.removeEventListener("touchstart", touchStart);
      window.removeEventListener("touchend", touchEnd);
      window.removeEventListener("touchcancel", touchEnd);
      reduced.removeEventListener("change", queue);
      properties.forEach((property) => workspace.style.removeProperty(property));
      delete scene.dataset.wallpaper;
      header.removeAttribute("data-hero-faded");
    };
  }, [headerRef, sceneRef, enabled, sceneHeight]);
}
