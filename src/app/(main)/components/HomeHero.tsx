"use client";

import Image from "next/image";
import memojiImage from "@/assets/images/sina-pc-memoji.png";
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
      <XpWindow id={HERO_ID} title="hi.exe" className="xp-hero-window" desktopApp>
        <Image src={memojiImage} alt="" width={72} height={72} loading="eager" />
        <p className="xp-hero-greeting">hi! 👋</p>
        <p className="xp-hero-note">(you can close me, the view is nicer)</p>
      </XpWindow>
      {closed && (
        <>
          <button id="xp-hero-icon" type="button" aria-label="Open hi.exe" title="Open hi.exe"
            onDoubleClick={reopen}
            onClick={(event) => {
              // Keyboard activation and touch/pen use a single press; a mouse uses double-click.
              const pointerType = (event.nativeEvent as PointerEvent).pointerType;
              if (event.detail === 0 || pointerType === "touch" || pointerType === "pen") reopen();
            }}>
            <Image src={memojiImage} alt="" width={48} height={48} />
            <span>hi.exe</span>
          </button>
          <p className="xp-scenery-caption">enjoy the scenery ☁</p>
        </>
      )}
    </>
  );
}
