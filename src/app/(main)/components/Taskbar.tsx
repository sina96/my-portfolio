"use client";

import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_NAME, SOCIAL_LINKS } from "@/lib/site";
import { useReadingTaskbar } from "../hooks/useReadingTaskbar";
import { useTheme } from "../hooks/useTheme";
import { useXpWindows } from "./XpWindowManager";
import { DesktopGlyph } from "./DesktopIcon";
import { HintBalloon, SCENERY_HINT, TrayBalloon } from "./TrayBalloon";
import { HERO_ID } from "./heroConfig";
import { isCurrentPlace, XP_PLACES } from "./navPlaces";

const CLOCK_FORMAT = new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" });

function Clock() {
  const [time, setTime] = useState("");
  useEffect(() => {
    const update = () => setTime(CLOCK_FORMAT.format(new Date()));
    const first = window.setTimeout(update, 0);
    const interval = window.setInterval(update, 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(interval);
    };
  }, []);
  return <time className="xp-clock" dateTime={time || undefined} title="Local time">{time}</time>;
}

interface TaskbarProps {
  year: number;
}

export function Taskbar({ year }: Readonly<TaskbarProps>) {
  const pathname = usePathname();
  const { windows, setState, scenery, goHome, restore, landing, minimizing } = useXpWindows();
  const { darkMode, toggleDarkMode } = useTheme();
  const [open, setOpen] = useState(false);
  const heroOpen = windows.find(({ id }) => id === HERO_ID)?.state === "open";
  const canRestore = windows.some(({ state }) => state !== "open");
  const [focused, setFocused] = useState(false);
  const bar = useRef<HTMLElement>(null);
  const { reading, reveal } = useReadingTaskbar(!landing, windows);
  const hidden = !landing && reading && !open && !focused && !scenery && !canRestore && !minimizing;
  const startArea = useRef<HTMLDivElement>(null);
  const startButton = useRef<HTMLButtonElement>(null);
  const startMenu = useRef<HTMLDivElement>(null);

  const themeButton = useRef<HTMLButtonElement>(null);
  const focusTheme = () => themeButton.current?.focus({ preventScroll: true });

  function revealForKeyboard(fromEnd: boolean): void {
    // The bridges are outside the inert landmark; move focus after removing inert.
    flushSync(reveal);
    const lastButton = bar.current?.querySelector<HTMLButtonElement>(".xp-tray > button");
    (fromEnd ? lastButton : startButton.current)?.focus({ preventScroll: true });
  }

  function activateWindow(id: string): void {
    setState(id, "open");
    requestAnimationFrame(() => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const behavior = reduce ? "instant" : "smooth";
      if (id === HERO_ID) window.scrollTo({ top: 0, behavior });
      else document.getElementById(id)?.scrollIntoView({ block: "start", behavior });
    });
  }

  useEffect(() => {
    if (!open) return;
    startMenu.current?.querySelector("a")?.focus();
    const outsideClick = (event: PointerEvent) => {
      if (event.target instanceof Node && !startArea.current?.contains(event.target)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      startButton.current?.focus();
    };
    document.addEventListener("pointerdown", outsideClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", outsideClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      {!landing && <button type="button" className="xp-sr-only xp-taskbar-bridge" tabIndex={hidden ? 0 : -1}
        onFocus={() => revealForKeyboard(false)}>Show taskbar</button>}
      <nav ref={bar} className="xp-taskbar" aria-label="Primary" inert={hidden} data-reading-hidden={hidden || undefined}
        onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
        }}>
        <div ref={startArea} className="xp-start-area">
          <button id="xp-start" ref={startButton} type="button" className="xp-start-button"
            aria-expanded={open} aria-controls="xp-start-menu" onClick={() => setOpen((value) => !value)}>
            <span aria-hidden="true" className="xp-start-logo"><i /><i /><i /><i /></span> start
          </button>
          <div className="xp-start-menu" id="xp-start-menu" ref={startMenu} hidden={!open}>
            <div className="xp-start-name">{SITE_NAME}</div>
            {XP_PLACES.map(({ href, label }) => (
              <Link key={href} href={href} aria-current={isCurrentPlace(pathname, href) ? "page" : undefined}
                onNavigate={(event) => {
                  setOpen(false);
                  if (pathname === "/" && href === "/") {
                    event.preventDefault();
                    goHome();
                  }
                }}>{label}</Link>
            ))}
            <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href={SOCIAL_LINKS.github} target="_blank" rel="noopener noreferrer">GitHub</a>
            {canRestore && <button type="button" className="xp-start-restore" onClick={() => {
              setOpen(false);
              restore();
            }}>Restore all windows</button>}
            <small>© {year} {SITE_NAME}</small>
          </div>
        </div>
        <div className="xp-task-buttons">
          {!scenery && windows.filter(({ state }) => state !== "closed").map(({ id, title, state, icon }) => (
            <button key={id} id={`task-${id}`} type="button" title={title} aria-label={title}
              aria-controls={id} aria-pressed={state === "open"} data-state={state} onClick={() => activateWindow(id)}>
              {icon && <DesktopGlyph icon={icon} size={16} />}<span>{title}</span>
            </button>
          ))}
        </div>
        <div className="xp-tray">
          <TrayBalloon eligible={heroOpen && !scenery} onDismiss={focusTheme} />
          {scenery && <HintBalloon storageKey={SCENERY_HINT} delay={0} duration={12_000}
            message="nice view, right? use Start → Restore all windows to bring them back" onDismiss={focusTheme} />}
          <button ref={themeButton} type="button" aria-label="Dark mode" aria-pressed={darkMode} onClick={toggleDarkMode}>
            <span aria-hidden="true" className="xp-theme-day">☀</span>
            <span aria-hidden="true" className="xp-theme-night">☾</span>
          </button>
          <Clock />
        </div>
      </nav>
      {!landing && <button type="button" className="xp-sr-only xp-taskbar-bridge" tabIndex={hidden ? 0 : -1}
        onFocus={() => revealForKeyboard(true)}>Show taskbar</button>}
    </>
  );
}
