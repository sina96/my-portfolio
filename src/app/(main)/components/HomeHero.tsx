"use client";

import Image from "next/image";
import memojiImage from "@/assets/images/sina-pc-memoji.png";
import { SITE_NAME, SITE_ROLE_LINE } from "@/lib/site";
import { DesktopIcon } from "./DesktopIcon";
import { XpWindow } from "./XpWindow";
import { useXpWindows } from "./XpWindowManager";
import { HERO_ID } from "./heroConfig";

export function HomeHero() {
  const { windows, setState } = useXpWindows();
  const closed = windows.find(({ id }) => id === HERO_ID)?.state === "closed";

  function reopen(): void {
    setState(HERO_ID, "open");
    requestAnimationFrame(() => {
      document.getElementById(HERO_ID)?.querySelector<HTMLElement>(".title-bar-controls button")?.focus({ preventScroll: true });
    });
  }

  return (
    <>
      <XpWindow id={HERO_ID} title="sina.exe" className="xp-hero-window" icon="desktop" desktopApp>
        <Image src={memojiImage} alt="" width={64} height={64} loading="eager" />
        <h1>{SITE_NAME}</h1>
        <p className="xp-hero-role">{SITE_ROLE_LINE}</p>
        <div className="xp-hero-shortcuts">
          <DesktopIcon href="/cv" label="CV" icon="cv" />
          <DesktopIcon href="/contact" label="Contact" icon="contact" />
          <DesktopIcon href="/blog" label="Blog" icon="blog" />
        </div>
      </XpWindow>
      {closed && (
        <>
          <button id="xp-hero-icon" type="button" aria-label="Open sina.exe" title="Open sina.exe"
            onDoubleClick={reopen}
            onClick={(event) => {
              // Keyboard activation and touch/pen use a single press; a mouse uses double-click.
              const pointerType = (event.nativeEvent as PointerEvent).pointerType;
              if (event.detail === 0 || pointerType === "touch" || pointerType === "pen") reopen();
            }}>
            <Image src={memojiImage} alt="" width={48} height={48} />
            <span>sina.exe</span>
          </button>
        </>
      )}
    </>
  );
}
