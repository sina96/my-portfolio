"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";
import { XpWindow } from "../components/XpWindow";
import { previousXpPath } from "../components/returnPath";

interface SystemDialogProps {
  title: string;
  children: ReactNode;
}

/** The System Properties window: OK, Cancel and Close all return to the previous XP page (or the desktop). */
export function SystemDialog({ title, children }: Readonly<SystemDialogProps>) {
  const router = useRouter();
  const pathname = usePathname();
  const leave = () => router.push(previousXpPath(pathname));

  function onReturn(event: MouseEvent<HTMLAnchorElement>) {
    // Let modified clicks (new tab/window) follow the plain "/" link.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    leave();
  }

  return (
    <XpWindow id="system-properties" title={title} icon="system" onClose={leave}>
      {children}
      <nav className="system-actions" aria-label="System Properties actions">
        <Link href="/" className="xp-button-link xp-nav-link" onClick={onReturn} title="Back to the previous page">OK</Link>
        <Link href="/" className="xp-button-link xp-nav-link" onClick={onReturn} title="Back to the previous page">Cancel</Link>
        <button type="button" className="xp-button-link xp-nav-link" disabled>Apply</button>
      </nav>
    </XpWindow>
  );
}
