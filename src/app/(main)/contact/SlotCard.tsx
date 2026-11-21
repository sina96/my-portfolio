const RANKS = {
  A: "M1 0h1v1H1zM0 1h1v4H0zm2 0h1v4H2zM1 2h1v1H1z",
  Q: "M0 0h3v4H0zM2 4h1v1H2zM1 1v2h1V1z",
  7: "M0 0h3v2H2v1H1v2H0V3h1V2h1V1H0z",
  3: "M0 0h3v5H0V4h2V3H1V2h1V1H0z",
  2: "M0 0h3v3H1v1h2v1H0V2h2V1H0z",
};
const SUITS = {
  club: "M1 0h3v2h1v2H3v1H2V4H0V2h1z",
  diamond: "M2 0h1v1h1v1h1v1H4v1H3v1H2V4H1V3H0V2h1V1h1z",
  heart: "M0 0h2v1h1V0h2v3H4v1H3v1H2V4H1V3H0z",
  spade: "M2 0h1v1h1v1h1v2H3v1H2V4H0V2h1V1h1z",
};

export interface SlotFace {
  rank: keyof typeof RANKS;
  suit: keyof typeof SUITS;
  edges?: number;
}

/** A decorative, original pixel card face and optional built-pile edges. */
export function SlotCard({ rank, suit, edges = 0 }: Readonly<SlotFace>) {
  const ink = suit === "diamond" || suit === "heart" ? "#a82239" : "#172030";
  const corner = <><path d={RANKS[rank]} fillRule="evenodd" /><path d={SUITS[suit]} transform="translate(-1 6)" /></>;
  return (
    <svg viewBox="0 0 24 36" aria-hidden="true" shapeRendering="crispEdges" focusable="false">
      {Array.from({ length: edges }, (_, i) => <path key={i} fill="#e9e1c8" stroke="#202a30"
        d="M2 32h19v3H2z" transform={`translate(0 ${edges - i - 1})`} />)}
      <g transform={`scale(.96 ${(36 - edges - 1) / 36})`}>
        <path fill="#202a30" d="M2 0h20v1h1v1h1v32h-1v1h-1v1H2v-1H1v-1H0V2h1V1h1z" />
        <path fill="#fffbea" d="M2 1h20v1h1v32h-1v1H2v-1H1V2h1z" />
        <g fill={ink}>
          <g transform="translate(4 3)">{corner}</g>
          <path d={SUITS[suit]} transform="translate(7 13) scale(2)" />
          <g transform="translate(20 33) rotate(180)">{corner}</g>
        </g>
      </g>
    </svg>
  );
}
