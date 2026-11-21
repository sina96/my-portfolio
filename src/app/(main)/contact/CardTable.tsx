"use client";

import { useEffect, useRef, useState } from "react";

import { SlotCard } from "./SlotCard";
import type { SlotFace } from "./SlotCard";

const GREETINGS = ["hi!", "say hi →", "your move", "email me"];
const LEFT: readonly (SlotFace | null)[] = [{ rank: 7, suit: "club" }, { rank: "Q", suit: "diamond" }, null, null];
const RIGHT: readonly (SlotFace | null)[] = [{ rank: "A", suit: "heart" }, { rank: 3, suit: "spade", edges: 2 }, { rank: 2, suit: "diamond", edges: 1 }, null];

function Slots({ faces }: Readonly<{ faces: readonly (SlotFace | null)[] }>) {
  return <div className="xp-card-slots" aria-hidden="true">
    {faces.map((face, slot) => <span className="xp-card-slot" key={slot}>{face && <SlotCard {...face} />}</span>)}
  </div>;
}

function PixelSina({ waving }: Readonly<{ waving: boolean }>) {
  return (
    <svg viewBox="0 0 24 24" shapeRendering="crispEdges" aria-hidden="true" focusable="false">
      <g className="xp-mini-face">
        <path fill="#262039" d="M6 5h1V3h3V2h6v1h2v2h1v10H5V6h1z" />
        <path fill="#f3b883" d="M7 7h2V6h7v1h2v3h1v3h-2v3H8v-3H6v-3h1z" />
        <path fill="#242842" d="M8 8h3v1h2V8h3v1h1v3h-1v1h-3v-2h-2v2H8v-1H7V9h1z" />
        <path fill="#c9e4ed" d="M8 9h2v3H8zm6 0h2v3h-2z" />
        <path fill="#343347" d="M9 10h1v1H9zm5 0h1v1h-1z" />
      </g>
      {waving && <path className="xp-mini-wave" fill="#f3b883" d="M21 7h1v2h1v3h-1v2h-2v-2h-1v-2h1V8h1z" />}
      <path fill="#34394c" d="M3 14h18v7h1v2H2v-2h1z" />
      <path fill="#aeb9c5" d="M4 15h16v6H4zm-1 7h18v1H3z" />
      <path fill="#e1e8ed" d="M11 17h2v2h-2z" />
    </svg>
  );
}

/** A card-table header around an original, clickable desktop mascot. */
export function CardTable() {
  const [greeting, setGreeting] = useState("");
  const [play, setPlay] = useState(0);
  const next = useRef(0);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function sayHi(): void {
    window.clearTimeout(timer.current);
    setGreeting(GREETINGS[next.current % GREETINGS.length]);
    next.current++;
    setPlay(next.current);
    timer.current = window.setTimeout(() => setGreeting(""), 2000);
  }

  return (
    <div className="xp-card-table">
      <Slots faces={LEFT} />
      <div className="xp-card-emblem">
        <button type="button" className="xp-mini-sina" aria-label="Say hi" onClick={sayHi}>
          {/* Remount only the sprite, not the focused button or the live region. */}
          <PixelSina key={play} waving={play > 0} />
        </button>
        <span className="xp-card-greeting" aria-live="polite">{greeting}</span>
      </div>
      <Slots faces={RIGHT} />
    </div>
  );
}
