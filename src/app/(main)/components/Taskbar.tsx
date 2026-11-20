"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_NAME } from "@/lib/site";
import { useTheme } from "../hooks/useTheme";
import { useXpWindows } from "./XpWindowManager";
import { TrayBalloon } from "./TrayBalloon";
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
  active: boolean;
}

export function Taskbar({ year, active }: Readonly<TaskbarProps>) {
  const pathname = usePathname();
  const { windows, setState, scenery, goHome } = useXpWindows();
  const { darkMode, toggleDarkMode } = useTheme();
  const [menuOpen, setOpen] = useState(false);
  const open = active && menuOpen;
  const heroOpen = windows.find(({ id }) => id === HERO_ID)?.state === "open";
  const taskWindows = windows.filter(({ desktopApp, state }) => (!scenery || desktopApp) && (!desktopApp || state !== "closed"));
  const startArea = useRef<HTMLDivElement>(null);
  const startButton = useRef<HTMLButtonElement>(null);
  const startMenu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (active) return;
    const close = requestAnimationFrame(() => setOpen(false));
    return () => cancelAnimationFrame(close);
  }, [active]);

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
    <nav className="xp-taskbar" aria-label="Primary" inert={!active}>
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
          <div className="xp-start-restore">
            {taskWindows.filter(({ state }) => state !== "open").map(({ id, title }) => (
              <button key={id} type="button" onClick={() => {
                setState(id, "open");
                setOpen(false);
                startButton.current?.focus();
              }}>Restore {title}</button>
            ))}
          </div>
          <small>© {year} {SITE_NAME}</small>
        </div>
      </div>
      <div className="xp-task-buttons">
        {taskWindows.map(({ id, title, state }) => (
          <button key={id} id={`task-${id}`} type="button" title={title}
            aria-controls={id} aria-pressed={state === "open"} onClick={() => {
              setState(id, "open");
              requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: "nearest" }));
            }}>{title}</button>
        ))}
      </div>
      <div className="xp-tray">
        <TrayBalloon eligible={active && heroOpen && !scenery} />
        <button type="button" aria-label="Dark mode" aria-pressed={darkMode} onClick={toggleDarkMode}>
          <span aria-hidden="true" className="xp-theme-day">☀</span>
          <span aria-hidden="true" className="xp-theme-night">☾</span>
        </button>
        <Clock />
      </div>
    </nav>
  );
}
