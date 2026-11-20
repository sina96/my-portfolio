"use client";

import { useRef, useState } from "react";
import type { ReactNode } from "react";
import { AvailabilityWidget } from "../components/AvailabilityWidget";
import { XpWindow } from "../components/XpWindow";

const AVAILABILITY_ID = "contact-availability";

interface ContactWindowsProps {
  children: ReactNode;
  links: ReactNode;
}

export function ContactWindows({ children, links }: Readonly<ContactWindowsProps>) {
  const [expanded, setExpanded] = useState(false);
  const [openedOnce, setOpenedOnce] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  function hide(): void {
    setExpanded(false);
    button.current?.focus();
  }

  function toggle(): void {
    if (expanded) {
      hide();
      return;
    }
    setOpenedOnce(true);
    setExpanded(true);
    requestAnimationFrame(() => {
      heading.current?.focus({ preventScroll: true });
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      heading.current?.closest(".xp-window")?.scrollIntoView({ block: "start", behavior: reduced ? "instant" : "smooth" });
    });
  }

  return (
    <>
      <XpWindow id="contact-details" title="Contact" className="xp-contact-window">
        {children}
        <div className="xp-actions">
          <button ref={button} type="button" className="xp-button-link" aria-expanded={expanded}
            aria-controls={AVAILABILITY_ID} onClick={toggle}>
            {expanded ? "Hide availability" : "View availability"}
          </button>
        </div>
        <div className="xp-actions">{links}</div>
      </XpWindow>
      <XpWindow id={AVAILABILITY_ID} title="Availability" disclosure={{ expanded, onClose: hide }}>
        <h2 className="xp-sr-only" ref={heading} tabIndex={-1}>Availability</h2>
        {openedOnce && <AvailabilityWidget />}
      </XpWindow>
    </>
  );
}
