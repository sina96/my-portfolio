"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";
import { useXpWindows } from "./XpWindowManager";

interface XpWindowProps {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
  statusBar?: ReactNode;
  desktopApp?: boolean;
  disclosure?: { expanded: boolean; onClose: () => void };
}

export function XpWindow({ id, title, children, className = "", statusBar, desktopApp = false, disclosure }: Readonly<XpWindowProps>) {
  const { windows, register, setState } = useXpWindows();
  const state = windows.find((window) => window.id === id)?.state ?? "open";
  const available = disclosure?.expanded ?? true;
  const hidden = !available || state === "closed" || (desktopApp && state === "minimized");
  useEffect(() => {
    if (available) return register(id, title, desktopApp);
  }, [register, id, title, desktopApp, available]);

  function focusNavigation(): void {
    const root = document.getElementById(id)?.closest(".xp-workspace");
    const candidates = [
      document.getElementById(`task-${id}`),
      root?.querySelector<HTMLElement>("#xp-start"),
      root?.querySelector<HTMLElement>(".xp-pane-launcher"),
      root?.querySelector<HTMLElement>(".xp-pane-sidebar button"),
    ];
    const navigation = candidates.find((target) => target?.getClientRects().length && !target.closest("[inert]"));
    if (navigation) navigation.focus({ preventScroll: true });
    else requestAnimationFrame(() => {
      const restore = document.querySelector<HTMLElement>(".xp-closed-card .default");
      (restore ?? document.getElementById("main"))?.focus({ preventScroll: true });
    });
  }

  return (
    <section id={id} className={`window xp-window ${className}`} hidden={hidden} aria-label={title}>
      <div className="title-bar">
        <span className="title-bar-text">{title}</span>
        <div className="title-bar-controls">
          <button type="button" aria-label="Minimize" title={`Minimize ${title}`}
            aria-controls={`${id}-body`} onClick={() => {
              setState(id, "minimized");
              if (desktopApp) focusNavigation();
            }} />
          {desktopApp ? <button type="button" aria-label="Maximize" aria-hidden="true" tabIndex={-1} inert /> : (
            <button type="button" aria-label="Maximize" title={`Restore ${title}`}
              aria-controls={`${id}-body`} onClick={() => setState(id, "open")} />
          )}
          <button type="button" aria-label="Close" title={`Close ${title}`}
            onClick={() => {
              if (disclosure) return disclosure.onClose();
              setState(id, "closed");
              if (desktopApp) {
                requestAnimationFrame(() => document.getElementById("xp-hero-icon")?.focus({ preventScroll: true }));
              } else focusNavigation();
            }} />
        </div>
      </div>
      <div id={`${id}-body`} className="xp-window-content" hidden={state === "minimized"}>
        <div className="window-body">{children}</div>
        {statusBar}
      </div>
    </section>
  );
}
