"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import type { DesktopIconName } from "./DesktopIcon";
import { useXpWindows } from "./XpWindowManager";

interface XpWindowProps {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
  statusBar?: ReactNode;
  desktopApp?: boolean;
  icon?: DesktopIconName;
  disclosure?: { expanded: boolean; onClose: () => void };
  /** Replaces the default close (hide window, closed-desktop dialog), e.g. for dialogs that navigate away. */
  onClose?: () => void;
}

export function XpWindow({ id, title, children, className = "", statusBar, desktopApp = false, icon, disclosure, onClose }: Readonly<XpWindowProps>) {
  const { windows, register, setState, minimize } = useXpWindows();
  const state = windows.find((window) => window.id === id)?.state ?? "open";
  const available = disclosure?.expanded ?? true;
  const hidden = !available || state !== "open";
  useEffect(() => {
    if (available) return register(id, title, desktopApp, icon);
  }, [register, id, title, desktopApp, icon, available]);

  function focusNavigation(): void {
    requestAnimationFrame(() => {
      const task = document.getElementById(`task-${id}`);
      const popup = document.querySelector<HTMLElement>(".xp-closed-card .default");
      const partial = document.querySelector<HTMLElement>(".xp-partial-restore button");
      // A closed hero has no task button or restore link; its reopen icon is the nearest target.
      const heroIcon = document.getElementById("xp-hero-icon");
      (task ?? popup ?? partial ?? heroIcon ?? document.getElementById("main"))?.focus({ preventScroll: true });
      if (!task && !popup) partial?.scrollIntoView({ block: "nearest", behavior: "instant" });
    });
  }

  return (
    <section id={id} className={`window xp-window ${className}`} hidden={hidden} aria-label={title}>
      <div className="title-bar">
        <span className="title-bar-text">{title}</span>
        <div className="title-bar-controls">
          <button type="button" aria-label="Minimize" title={`Minimize ${title}`}
            onClick={() => minimize(id, focusNavigation)} aria-controls={id} />
          <button type="button" aria-label="Maximize" aria-hidden="true" tabIndex={-1} inert />
          <button type="button" aria-label="Close" title={`Close ${title}`}
            onClick={() => {
              if (onClose) return onClose();
              if (disclosure) return disclosure.onClose();
              setState(id, "closed");
              focusNavigation();
            }} />
        </div>
      </div>
      <div id={`${id}-body`} className="xp-window-content">
        <div className="window-body">{children}</div>
        {statusBar}
      </div>
    </section>
  );
}
