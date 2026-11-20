"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DesktopNavigation } from "./DesktopNavigation";

export type WindowState = "open" | "minimized" | "closed";

interface WindowEntry {
  id: string;
  title: string;
  state: WindowState;
  desktopApp: boolean;
}

interface WindowManager {
  windows: readonly WindowEntry[];
  scenery: boolean;
  homeRequest: number;
  goHome: () => void;
  sceneryEntering: boolean;
  finishSceneryEntry: () => void;
  register: (id: string, title: string, desktopApp: boolean) => () => void;
  setState: (id: string, state: WindowState) => void;
}

const WindowContext = createContext<WindowManager | null>(null);

export function useXpWindows(): WindowManager {
  const context = useContext(WindowContext);
  if (!context) throw new Error("XP windows require XpWindowManager");
  return context;
}

interface XpWindowManagerProps {
  children: ReactNode;
  year: number;
}

export function XpWindowManager({ children, year }: Readonly<XpWindowManagerProps>) {
  const pathname = usePathname();
  const [visit, setVisit] = useState(0);

  useEffect(() => {
    if (pathname !== "/") return;
    // A browser cache restore can bring back the entire React tree, not just its scroll offset.
    const resetDesktop = (event: PageTransitionEvent) => {
      if (event.persisted) setVisit((current) => current + 1);
    };
    window.addEventListener("pageshow", resetDesktop);
    return () => window.removeEventListener("pageshow", resetDesktop);
  }, [pathname]);

  return <Desktop key={`${pathname}:${visit}`} year={year}>{children}</Desktop>;
}

function Desktop({ children, year }: Readonly<XpWindowManagerProps>) {
  const [homeRequest, requestHome] = useState(0);
  const [scenery, setScenery] = useState(false);
  const [sceneryEntering, setSceneryEntering] = useState(false);
  const finishSceneryEntry = useCallback(() => setSceneryEntering(false), []);

  useEffect(() => {
    if (!sceneryEntering) return;
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const stopIfReduced = () => { if (motion.matches) finishSceneryEntry(); };
    const timer = window.setTimeout(finishSceneryEntry, 650);
    motion.addEventListener("change", stopIfReduced);
    return () => {
      window.clearTimeout(timer);
      motion.removeEventListener("change", stopIfReduced);
    };
  }, [sceneryEntering, finishSceneryEntry]);
  const primary = useRef<HTMLButtonElement>(null);
  const sceneryRestore = useRef<HTMLButtonElement>(null);
  const [windows, setWindows] = useState<WindowEntry[]>([]);
  const register = useCallback((id: string, title: string, desktopApp: boolean) => {
    setWindows((current) => [...current.filter((window) => window.id !== id), { id, title, desktopApp, state: "open" }]);
    return () => setWindows((current) => current.filter((window) => window.id !== id));
  }, []);
  const setState = useCallback((id: string, state: WindowState) => {
    setWindows((current) => current.map((window) => window.id === id ? { ...window, state } : window));
  }, []);
  const contentWindows = windows.filter(({ desktopApp }) => !desktopApp);
  const allClosed = contentWindows.length > 0 && contentWindows.every(({ state }) => state === "closed");

  const pathname = usePathname();
  const landing = pathname === "/";
  const reopenContent = useCallback(() => {
    setScenery(false);
    finishSceneryEntry();
    setWindows((current) => current.map((window) => window.desktopApp ? window : { ...window, state: "open" }));
  }, [finishSceneryEntry]);

  const goHome = () => {
    if (scenery || allClosed) reopenContent();
    requestHome((request) => request + 1);
  };

  const restore = useCallback(() => {
    reopenContent();
    requestAnimationFrame(() => {
      const main = document.getElementById("main");
      main?.focus({ preventScroll: true });
      if (!landing) main?.scrollIntoView({ block: "nearest", behavior: "instant" });
    });
  }, [landing, reopenContent]);

  useEffect(() => {
    if (!allClosed) return;
    (scenery ? sceneryRestore : primary).current?.focus({ preventScroll: true });
    if (!scenery) primary.current?.closest(".xp-closed-card")?.scrollIntoView({ block: "nearest", behavior: "instant" });
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented
        && (scenery || document.activeElement?.closest(".xp-closed-card"))) restore();
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [allClosed, restore, scenery]);

  const content = (
    <>
      {children}
      {allClosed && !scenery && (
        <aside className="window xp-closed-card" role="dialog" aria-labelledby="xp-closed-title">
          <div className="title-bar"><span className="title-bar-text" id="xp-closed-title">Desktop</span></div>
          <div className="window-body">
            <p>wanna enjoy the scenery instead?</p>
            <div className="xp-actions">
              <button ref={primary} type="button" className="default xp-button-link" onClick={() => {
                window.scrollTo({ top: 0, behavior: "instant" });
                setSceneryEntering(!window.matchMedia("(prefers-reduced-motion: reduce)").matches);
                setScenery(true);
              }}>Show me the hills</button>
              <button type="button" className="xp-quiet-action" onClick={restore}>restore windows</button>
            </div>
          </div>
        </aside>
      )}
      {scenery && (
        <div className="xp-scenery-controls">
          <p className="xp-scenery-caption">enjoy the scenery ☁</p>
          <button ref={sceneryRestore} type="button" className="xp-scenery-restore" aria-label="Restore windows" onClick={restore}>
            restore windows ↺
          </button>
        </div>
      )}
    </>
  );

  return (
    <WindowContext.Provider value={{ windows, register, setState, scenery, homeRequest, goHome, sceneryEntering, finishSceneryEntry }}>
      {landing ? <DesktopNavigation year={year}>{content}</DesktopNavigation> : (
        <div className="xp-subpage" data-scenery={scenery}>{content}</div>
      )}
    </WindowContext.Provider>
  );
}
