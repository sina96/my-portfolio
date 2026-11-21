"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { TaskPane } from "./TaskPane";
import { useXpWindows } from "./XpWindowManager";

export function DesktopNavigation({ year, children, taskbar }: Readonly<{ year: number; children: ReactNode; taskbar: ReactNode }>) {
  const { scenery } = useXpWindows();
  const [past, setPastHill] = useState(false);
  const container = useRef<HTMLDivElement>(null);
  const sidebar = useRef<HTMLDivElement>(null);
  const pastHill = past && !scenery;

  useEffect(() => {
    const sentinel = container.current?.querySelector(".hill-nav-sentinel");
    if (!sentinel) return;
    const observer = new IntersectionObserver(([entry]) => {
      const next = !entry.isIntersecting && entry.boundingClientRect.bottom <= (entry.rootBounds?.top ?? 0);
      if (!next && sidebar.current?.contains(document.activeElement)) {
        document.getElementById("xp-start")?.focus({ preventScroll: true });
      }
      setPastHill(next);
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="xp-workspace" data-past-hill={pastHill} data-scenery={scenery} ref={container}>
      {children}
      <div className="xp-pane-sidebar" ref={sidebar} inert={!pastHill}>
        <TaskPane year={year} />
      </div>
      {taskbar}
    </div>
  );
}
