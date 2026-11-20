"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { KeyboardEvent, ReactNode } from "react";
import { Taskbar } from "./Taskbar";
import { useXpWindows } from "./XpWindowManager";
import { TaskPane } from "./TaskPane";
import { HintBalloon, markHintSeen, MENU_HINT } from "./TrayBalloon";

const MOBILE = "(width < 760px)";

function subscribeMobile(onChange: () => void): () => void {
  const media = window.matchMedia(MOBILE);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

const readMobile = () => window.matchMedia(MOBILE).matches;
const serverMobile = () => false;

interface DesktopNavigationProps {
  year: number;
  children: ReactNode;
}

export function DesktopNavigation({ year, children }: Readonly<DesktopNavigationProps>) {
  const { scenery } = useXpWindows();
  const [past, setPastHill] = useState(false);
  const pastHill = past && !scenery;
  const [menuUsed, setMenuUsed] = useState(false);
  const mobile = useSyncExternalStore(subscribeMobile, readMobile, serverMobile);
  const focusDestination = useRef<"pane" | "taskbar" | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const sidebar = useRef<HTMLDivElement>(null);
  const drawer = useRef<HTMLDialogElement>(null);
  const drawerButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const desktop = container.current;
    const sentinel = desktop?.querySelector(".hill-nav-sentinel");
    if (!desktop || !sentinel) return;
    const observer = new IntersectionObserver(([entry]) => {
      const next = !entry.isIntersecting && entry.boundingClientRect.bottom <= (entry.rootBounds?.top ?? 0);
      const focused = document.activeElement;
      if (next && focused?.closest(".xp-taskbar")) focusDestination.current = "pane";
      if (!next && focused?.closest(".xp-pane-sidebar, .xp-pane-launcher, .xp-pane-drawer")) {
        focusDestination.current = "taskbar";
      }
      if (!next) drawer.current?.close();
      setPastHill(next);
    }, { threshold: 0 });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (pastHill && focusDestination.current === "pane") {
      (window.matchMedia(MOBILE).matches ? drawerButton.current : sidebar.current?.querySelector("button"))?.focus();
    }
    if (!pastHill && focusDestination.current === "taskbar") container.current?.querySelector<HTMLElement>("#xp-start")?.focus();
    focusDestination.current = null;
  }, [pastHill]);

  useEffect(() => {
    const media = window.matchMedia(MOBILE);
    const closeOnDesktop = () => {
      if (!media.matches && drawer.current?.open) {
        drawer.current.close();
        sidebar.current?.querySelector("button")?.focus();
      }
    };
    media.addEventListener("change", closeOnDesktop);
    return () => media.removeEventListener("change", closeOnDesktop);
  }, []);

  function closeDrawer(): void {
    drawer.current?.close();
    if (pastHill && window.matchMedia(MOBILE).matches) drawerButton.current?.focus();
  }

  function trapTab(event: KeyboardEvent<HTMLDialogElement>): void {
    if (event.key !== "Tab") return;
    const focusable = [...event.currentTarget.querySelectorAll<HTMLElement>("a[href], button:not([disabled])")]
      .filter((element) => element.getClientRects().length);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  return (
    <div className="xp-workspace" data-past-hill={pastHill} data-scenery={scenery} ref={container}>
      {children}
      <div className="xp-pane-sidebar" ref={sidebar} inert={!pastHill}>
        <TaskPane year={year} />
      </div>
      <button type="button" className="xp-pane-launcher" ref={drawerButton} inert={!pastHill}
        aria-haspopup="dialog" aria-controls="xp-pane-drawer" onClick={() => {
          markHintSeen(MENU_HINT);
          setMenuUsed(true);
          drawer.current?.showModal();
        }}>
        <span aria-hidden="true">▤</span> Places
      </button>
      {pastHill && mobile && !menuUsed && (
        <div className="xp-menu-hint">
          <HintBalloon storageKey={MENU_HINT} delay={6000} duration={8000} message="your menu lives here"
            onDismiss={() => drawerButton.current?.focus()} />
        </div>
      )}
      <dialog id="xp-pane-drawer" className="xp-pane-drawer" ref={drawer} aria-label="Places and tools"
        onKeyDown={trapTab} onCancel={(event) => { event.preventDefault(); closeDrawer(); }}
        onClick={(event) => { if (event.target === event.currentTarget) closeDrawer(); }}>
        <div className="xp-drawer-sheet">
          <button type="button" className="xp-drawer-close" onClick={closeDrawer} aria-label="Close places and tools">×</button>
          <TaskPane year={year} onNavigate={closeDrawer} />
        </div>
      </dialog>
      <Taskbar year={year} active={!pastHill} />
    </div>
  );
}
