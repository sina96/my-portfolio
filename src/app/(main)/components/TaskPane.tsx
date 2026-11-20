"use client";

import { useId, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SITE_NAME } from "@/lib/site";
import { useTheme } from "../hooks/useTheme";
import { useXpWindows } from "./XpWindowManager";
import { isCurrentPlace, XP_PLACES } from "./navPlaces";

const ICONS = {
  Home: "M2 8 8 2l6 6M4 7v7h8V7M7 14v-4h2v4",
  Blog: "M3 2h7l3 3v9H3zM9 2v4h4M5 8h6m-6 3h6",
  CV: "M2 4h12v9H2zM5 7h2m-2 3h2m2-3h3m-3 3h3",
  Contact: "M2 4h12v9H2zM2 4l6 5 6-5",
  RSS: "M3 3c6 0 10 4 10 10M3 7c4 0 6 2 6 6M3 12h1v1H3z",
};

interface GroupProps {
  title: string;
  children: ReactNode;
}

function TaskGroup({ title, children }: Readonly<GroupProps>) {
  const [open, setOpen] = useState(true);
  const id = useId();
  return (
    <section className="xp-pane-group">
      <button type="button" className="xp-pane-heading" aria-expanded={open} aria-controls={id}
        onClick={() => setOpen((value) => !value)}>
        {title}<span aria-hidden="true" />
      </button>
      <div className="xp-pane-items" id={id} hidden={!open}>{children}</div>
    </section>
  );
}

interface TaskPaneProps {
  year: number;
  onNavigate?: () => void;
}

export function TaskPane({ year, onNavigate }: Readonly<TaskPaneProps>) {
  const pathname = usePathname();
  const { darkMode, toggleDarkMode } = useTheme();
  const { windows, setState, goHome } = useXpWindows();

  const restorable = windows.filter(({ state, desktopApp }) => !desktopApp && state !== "open");

  return (
    <nav className="xp-pane" aria-label="Primary">
      <TaskGroup title="Places">
        {XP_PLACES.map(({ href, label }) => (
          <Link key={href} href={href} aria-current={isCurrentPlace(pathname, href) ? "page" : undefined} onNavigate={(event) => {
            onNavigate?.();
            if (pathname === "/" && href === "/") {
              event.preventDefault();
              goHome();
            }
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <path d={ICONS[label]} fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinejoin="round" />
            </svg>{label}
          </Link>
        ))}
      </TaskGroup>
      <TaskGroup title="Appearance">
        <button type="button" className="xp-night-switch" role="switch" aria-checked={darkMode} onClick={toggleDarkMode}>
          Night mode
          <span className="xp-luna-track" aria-hidden="true"><span>☀</span><span>☾</span></span>
        </button>
      </TaskGroup>
      {restorable.length > 0 && (
        <TaskGroup title="Closed windows">
          {restorable.map(({ id, title }) => (
            <button key={id} type="button" onClick={() => {
              setState(id, "open");
              onNavigate?.();
              requestAnimationFrame(() => {
                const window = document.getElementById(id);
                window?.querySelector<HTMLElement>(".title-bar-controls button")?.focus({ preventScroll: true });
                window?.scrollIntoView({ block: "nearest", behavior: "instant" });
              });
            }}>Restore {title}</button>
          ))}
        </TaskGroup>
      )}
      <small className="xp-pane-credit">© {year} {SITE_NAME}</small>
    </nav>
  );
}
