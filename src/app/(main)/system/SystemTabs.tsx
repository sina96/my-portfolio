"use client";

import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ReactNode } from "react";

export type SystemTabId = "general" | "network" | "security" | "updates";

interface SystemTabsProps {
  tabs: ReadonlyArray<{ id: SystemTabId; label: string; shortLabel?: string; content: ReactNode }>;
}

/** Switch between server-rendered panels using the keyboard, pointer, or URL hash. */
export function SystemTabs({ tabs }: Readonly<SystemTabsProps>) {
  const [selected, setSelected] = useState<SystemTabId>("general");
  const strip = useRef<HTMLMenuElement>(null);

  useEffect(() => {
    function readHash() {
      const hash = window.location.hash.slice(1);
      setSelected(tabs.find(({ id }) => id === hash)?.id ?? "general");
    }

    readHash();
    window.addEventListener("hashchange", readHash);
    return () => window.removeEventListener("hashchange", readHash);
  }, [tabs]);

  useEffect(() => {
    const menu = strip.current;
    if (!menu || menu.scrollWidth <= menu.clientWidth) return;
    menu.querySelector('[aria-selected="true"]')?.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "auto",
    });
  }, [selected]);

  function select(id: SystemTabId) {
    if (id === selected) return;
    setSelected(id);
    // Replace the hash without a new history entry. Next patches history.replaceState: keeping its
    // state lets back/forward restore this page, while passing null would make the router adopt the
    // URL and later write the old hash back. Entries made by hash navigation have no Next state, so
    // replace those natively.
    const state: unknown = window.history.state;
    if (state) window.history.replaceState(state, "", `#${id}`);
    else window.location.replace(`#${id}`);
  }

  function onTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    let next: number;
    switch (event.key) {
      case "ArrowLeft": next = (index + tabs.length - 1) % tabs.length; break;
      case "ArrowRight": next = (index + 1) % tabs.length; break;
      case "Home": next = 0; break;
      case "End": next = tabs.length - 1; break;
      default: return;
    }
    event.preventDefault();
    const { id } = tabs[next];
    select(id);
    strip.current?.querySelector<HTMLButtonElement>(`#system-tab-${id}`)?.focus({ preventScroll: true });
  }

  return (
    <>
      <menu className="system-tablist" role="tablist" aria-label="System Properties" ref={strip}>
        {tabs.map(({ id, label, shortLabel }, index) => (
          <button key={id} type="button" role="tab" id={`system-tab-${id}`}
            aria-controls={`system-panel-${id}`} aria-selected={selected === id}
            tabIndex={selected === id ? 0 : -1} onClick={() => select(id)}
            onKeyDown={(event) => onTabKeyDown(event, index)}>
            {shortLabel ? <>
              <span className="system-tab-label">{label}</span>
              <span className="system-tab-short">{shortLabel}</span>
            </> : label}
          </button>
        ))}
      </menu>
      {tabs.map(({ id, content }) => (
        <article key={id} className="system-panel" role="tabpanel" id={`system-panel-${id}`}
          aria-labelledby={`system-tab-${id}`} tabIndex={0} hidden={selected !== id}>
          {content}
        </article>
      ))}
    </>
  );
}
