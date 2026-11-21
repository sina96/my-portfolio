"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import type { DesktopIconName } from "./DesktopIcon";
import { DesktopNavigation } from "./DesktopNavigation";
import { Taskbar } from "./Taskbar";

export type WindowState = "open" | "minimized" | "closed";

interface WindowEntry {
  id: string;
  title: string;
  state: WindowState;
  desktopApp: boolean;
  icon?: DesktopIconName;
}

interface WindowManager {
  windows: readonly WindowEntry[];
  landing: boolean;
  scenery: boolean;
  homeRequest: number;
  goHome: () => void;
  restore: () => void;
  sceneryEntering: boolean;
  finishSceneryEntry: () => void;
  register: (id: string, title: string, desktopApp: boolean, icon?: DesktopIconName) => () => void;
  setState: (id: string, state: WindowState) => void;
  minimize: (id: string, after: () => void) => void;
  minimizing: boolean;
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
  const [minimizing, setMinimizing] = useState(false);
  const pending = useRef<{ id: string; finish: (commit: boolean) => void }>(null);
  const register = useCallback((id: string, title: string, desktopApp: boolean, icon?: DesktopIconName) => {
    setWindows((current) => [...current.filter((window) => window.id !== id), { id, title, desktopApp, icon, state: "open" }]);
    return () => {
      // A window that goes away mid-minimize must not commit or move focus afterwards.
      if (pending.current?.id === id) pending.current.finish(false);
      setWindows((current) => current.filter((window) => window.id !== id));
    };
  }, []);
  useEffect(() => () => pending.current?.finish(false), []);

  const setState = useCallback((id: string, state: WindowState) => {
    if (pending.current?.id === id) pending.current.finish(false);
    setWindows((current) => current.map((window) => window.id === id ? { ...window, state } : window));
  }, []);

  function minimize(id: string, after: () => void): void {
    if (pending.current?.id === id) return;
    pending.current?.finish(true);
    const source = document.getElementById(id);
    const task = document.getElementById(`task-${id}`);
    const workspace = source?.closest(".xp-desktop");
    const bar = task?.closest(".xp-taskbar");
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const commit = () => { setState(id, "minimized"); after(); };
    if (!source || !task || !workspace || !bar || reduce.matches) { commit(); return; }

    const from = source.getBoundingClientRect();
    const to = task.getBoundingClientRect();
    // Use the visible endpoint even if the reading taskbar is still sliding into view.
    const taskTop = to.top + window.innerHeight - bar.getBoundingClientRect().bottom;
    setMinimizing(true);
    const top = Math.max(0, from.top);
    const height = Math.max(1, Math.min(window.innerHeight, from.bottom) - top);
    const ghost = document.createElement("div");
    ghost.className = "xp-minimize-ghost";
    ghost.setAttribute("aria-hidden", "true");
    Object.assign(ghost.style, { left: `${from.left}px`, top: `${top}px`, width: `${from.width}px`, height: `${height}px` });
    workspace.append(ghost);
    const animation = ghost.animate([
      { transform: "none" },
      { transform: `translate(${to.left - from.left}px, ${taskTop - top}px) scale(${to.width / from.width}, ${to.height / height})` },
    ], { duration: 250, easing: "steps(5, end)", fill: "forwards" });
    const onMotion = () => { if (reduce.matches) finish(true); };
    function finish(shouldCommit: boolean): void {
      pending.current = null;
      setMinimizing(false);
      animation.onfinish = null;
      animation.cancel();
      ghost.remove();
      reduce.removeEventListener("change", onMotion);
      if (shouldCommit) commit();
    }
    pending.current = { id, finish };
    animation.onfinish = () => finish(true);
    reduce.addEventListener("change", onMotion);
  }
  const landing = usePathname() === "/";
  const contentWindows = windows.filter(({ desktopApp }) => !desktopApp);
  const allClosed = contentWindows.length > 0 && contentWindows.every(({ state }) => state === "closed");
  const someClosed = !allClosed && contentWindows.some(({ state }) => state === "closed");

  const reopenContent = useCallback(() => {
    pending.current?.finish(false);
    setScenery(false);
    finishSceneryEntry();
    setWindows((current) => current.map((window) => !landing && window.desktopApp ? window : { ...window, state: "open" }));
  }, [finishSceneryEntry, landing]);

  const goHome = () => {
    reopenContent();
    requestHome((request) => request + 1);
  };

  const restore = useCallback(() => {
    reopenContent();
    requestAnimationFrame(() => {
      const main = document.getElementById("main");
      if (landing) {
        document.getElementById("xp-start")?.focus({ preventScroll: true });
      } else {
        main?.focus({ preventScroll: true });
        main?.scrollIntoView({ block: "nearest", behavior: "instant" });
      }
    });
  }, [landing, reopenContent]);

  useEffect(() => {
    if (!allClosed) return;
    (scenery ? sceneryRestore : primary).current?.focus({ preventScroll: true });
    if (!scenery) primary.current?.closest(".xp-closed-card")?.scrollIntoView({
      block: landing ? "start" : "nearest", behavior: "instant",
    });
    const escape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !event.defaultPrevented
        && (scenery || document.activeElement?.closest(".xp-closed-card"))) restore();
    };
    window.addEventListener("keydown", escape);
    return () => window.removeEventListener("keydown", escape);
  }, [allClosed, landing, restore, scenery]);

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
      {someClosed && (
        <div className="xp-partial-restore">
          <button type="button" className="xp-quiet-action" onClick={restore}>restore closed windows ↺</button>
        </div>
      )}
    </>
  );

  const taskbar = <Taskbar year={year} />;
  return (
    <WindowContext.Provider value={{ windows, register, setState, minimize, minimizing, landing, scenery, homeRequest, goHome, restore, sceneryEntering, finishSceneryEntry }}>
      {landing ? <DesktopNavigation year={year} taskbar={taskbar}>{content}</DesktopNavigation> : (
        <div className="xp-subpage" data-scenery={scenery}>
          {content}
          {taskbar}
        </div>
      )}
    </WindowContext.Provider>
  );
}
