"use client";

import { useEffect, useRef } from "react";
import type { RefObject } from "react";

const GLIDE_MS = 475;
const WHEEL_GAP_MS = 120;
const MAX_WHEEL_STREAM_MS = 1200;
const UPWARD_DELTA = 50;
const SETTLE_MS = 150;
const TOUCH_SLOP = 12;
const EDGE = 1;
const GLIDE_MEDIA = "(min-width: 760px) and (prefers-reduced-motion: no-preference)";

/** The nav sentinel is one pixel before the content stop to cross the observer boundary. */
export function getLandingStop(header: HTMLElement): number {
  const sentinel = header.querySelector(".hill-nav-sentinel");
  return Math.max(1, Math.round((sentinel?.getBoundingClientRect().bottom ?? 0) + window.scrollY) + 1);
}

/** True when an element between the target and the page can still scroll in that direction. */
function canScrollInside(target: EventTarget | null, direction: number): boolean {
  for (let node = target instanceof Element ? target : null; node && node !== document.body; node = node.parentElement) {
    if (node.scrollHeight <= node.clientHeight || !/(auto|scroll|overlay)/.test(getComputedStyle(node).overflowY)) continue;
    if (direction > 0 ? node.scrollTop + node.clientHeight < node.scrollHeight - 1 : node.scrollTop > 0) return true;
  }
  return false;
}

/** Connects the desktop landing's scroll band to its two resting positions. */
export function useLandingGlide(header: RefObject<HTMLElement | null>, enabled: boolean, homeRequest: number): void {
  const requestGlide = useRef<(() => void) | undefined>(undefined);
  const handledHome = useRef(0);

  useEffect(() => {
    const hill = header.current;
    if (!enabled || !hill) return;
    const media = window.matchMedia(GLIDE_MEDIA);
    let end = 0;
    let frame = 0;
    let settling = 0;
    let wheelTimer = 0;
    let wheelStarted = -Infinity;
    let lastWheel = -Infinity;
    let upwardDelta = 0;
    let bound = false;
    let gliding = false;
    let touch: { x: number; y: number } | undefined;

    function glide(destination: number, focusContent = false): void {
      if (gliding) return;
      window.clearTimeout(settling);
      gliding = true;
      syncInput();
      const from = window.scrollY;
      const started = performance.now();
      function tick(now: number): void {
        const t = Math.min((now - started) / GLIDE_MS, 1);
        const eased = 1 - (1 - t) ** 3;
        window.scrollTo({ top: from + (destination - from) * eased, behavior: "instant" });
        if (t < 1) frame = requestAnimationFrame(tick);
        else {
          frame = 0;
          gliding = false;
          if (focusContent) document.getElementById("main")?.focus({ preventScroll: true });
          onScroll();
        }
      }
      frame = requestAnimationFrame(tick);
    }

    function intent(direction: number, event: Event): void {
      if (gliding) {
        event.preventDefault();
        return;
      }
      const y = window.scrollY;
      if ((direction > 0 && y < end - EDGE) || (direction < 0 && y > EDGE && y <= end + EDGE)) {
        event.preventDefault();
        glide(direction > 0 ? end : 0);
      }
    }

    function onWheel(event: WheelEvent): void {
      if (event.ctrlKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY) return;
      const now = performance.now();
      if (now - lastWheel >= WHEEL_GAP_MS) {
        upwardDelta = 0;
        wheelStarted = -Infinity;
      }
      lastWheel = now;

      function holdWheelStream(): void {
        window.clearTimeout(wheelTimer);
        wheelTimer = window.setTimeout(() => {
          wheelTimer = 0;
          syncInput();
        }, Math.min(WHEEL_GAP_MS, Math.max(0, wheelStarted + MAX_WHEEL_STREAM_MS - now)));
      }

      if (now - wheelStarted < MAX_WHEEL_STREAM_MS) {
        event.preventDefault();
        holdWheelStream();
        return;
      }
      if (gliding) { event.preventDefault(); return; }
      if (canScrollInside(event.target, event.deltaY)) return;

      const y = window.scrollY;
      if (event.deltaY < 0 && y > EDGE && y <= end + EDGE) {
        event.preventDefault();
        const factor = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? window.innerHeight : 1;
        upwardDelta += -event.deltaY * factor;
        if (upwardDelta < UPWARD_DELTA) return;
      } else {
        upwardDelta = 0;
        if (!(event.deltaY > 0 && y < end - EDGE)) return;
      }

      wheelStarted = now;
      holdWheelStream();
      glide(event.deltaY > 0 ? end : 0);
    }

    function onTouchStart(event: TouchEvent): void {
      const point = event.touches.length === 1 ? event.touches[0] : undefined;
      touch = point ? { x: point.clientX, y: point.clientY } : undefined;
    }

    function onTouchMove(event: TouchEvent): void {
      if (event.touches.length !== 1) return;
      if (gliding) {
        event.preventDefault();
        return;
      }
      if (!touch) return;
      const point = event.touches[0];
      const dy = touch.y - point.clientY;
      if (Math.abs(dy) < TOUCH_SLOP || Math.abs(dy) < Math.abs(touch.x - point.clientX)) return;
      intent(dy, event);
    }

    function onKey(event: KeyboardEvent): void {
      if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
      const target = event.target;
      if (target instanceof Element && target.closest("input, textarea, select, [contenteditable]")) return;
      if (event.key === " " && target instanceof Element && target.closest("button, a[href]")) return;
      switch (event.key) {
        case " ": intent(event.shiftKey ? -1 : 1, event); break;
        case "PageDown": case "ArrowDown": case "End": intent(1, event); break;
        case "PageUp": case "ArrowUp": case "Home": intent(-1, event); break;
      }
    }

    function setInput(next: boolean): void {
      if (bound === next) return;
      bound = next;
      if (next) {
        window.addEventListener("wheel", onWheel, { passive: false });
        window.addEventListener("touchstart", onTouchStart, { passive: true });
        window.addEventListener("touchmove", onTouchMove, { passive: false });
        window.addEventListener("keydown", onKey);
      } else {
        window.removeEventListener("wheel", onWheel);
        window.removeEventListener("touchstart", onTouchStart);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("keydown", onKey);
        touch = undefined;
      }
    }

    function syncInput(): void {
      setInput(media.matches && (gliding || !!wheelTimer || window.scrollY <= end + EDGE));
    }

    function onScroll(): void {
      syncInput();
      window.clearTimeout(settling);
      if (!media.matches || gliding) return;
      const y = window.scrollY;
      if (y > EDGE && y < end - EDGE) {
        settling = window.setTimeout(() => {
          const settledY = window.scrollY;
          if (settledY > EDGE && settledY < end - EDGE) glide(settledY < end / 2 ? 0 : end);
        }, SETTLE_MS);
      }
    }

    function updateBand(): void {
      cancelAnimationFrame(frame);
      window.clearTimeout(wheelTimer);
      frame = 0;
      wheelTimer = 0;
      wheelStarted = -Infinity;
      upwardDelta = 0;
      gliding = false;
      if (!hill) return;
      const wasAtStop = end > 0 && Math.abs(window.scrollY - end) <= EDGE;
      end = getLandingStop(hill);
      if (media.matches && wasAtStop) window.scrollTo({ top: end, behavior: "instant" });
      onScroll();
    }

    function onFocus(event: FocusEvent): void {
      if (!media.matches || window.scrollY >= end - EDGE) return;
      // Focusing the main container as a restore/close fallback should not navigate.
      if (event.target instanceof Element && event.target.matches("#main *")) glide(end);
    }

    requestGlide.current = () => {
      const main = document.getElementById("main");
      if (!main) return;
      if (media.matches && Math.abs(window.scrollY - end) > EDGE) {
        cancelAnimationFrame(frame);
        gliding = false;
        glide(end, true);
      } else {
        if (!media.matches) {
          const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
          hill?.focus({ preventScroll: true });
          window.scrollTo({ top: 0, behavior: reduce ? "instant" : "smooth" });
          return;
        }
        main.focus({ preventScroll: true });
      }
    };
    media.addEventListener("change", updateBand);
    window.addEventListener("resize", updateBand);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pageshow", onScroll);
    document.addEventListener("focusin", onFocus);
    updateBand();

    return () => {
      requestGlide.current = undefined;
      media.removeEventListener("change", updateBand);
      window.removeEventListener("resize", updateBand);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pageshow", onScroll);
      document.removeEventListener("focusin", onFocus);
      cancelAnimationFrame(frame);
      window.clearTimeout(wheelTimer);
      window.clearTimeout(settling);
      setInput(false);
    };
  }, [header, enabled]);

  useEffect(() => {
    if (!enabled || homeRequest === handledHome.current) return;
    handledHome.current = homeRequest;
    requestGlide.current?.();
  }, [enabled, homeRequest]);
}
