import { generatePixelDesk } from "../utils/pixelDesk";

const DAY = generatePixelDesk("day");
const NIGHT = generatePixelDesk("night");

export function PixelDesk() {
  return (
    <svg className="xp-pixel-desk" viewBox="0 0 64 34" width="280" height="149" aria-hidden="true" focusable="false">
      <g className="xp-theme-day">{DAY.map(({ fill, d }) => <path key={fill} fill={fill} d={d} />)}</g>
      <g className="xp-theme-night">{NIGHT.map(({ fill, d }) => <path key={fill} fill={fill} d={d} />)}</g>
      <path className="xp-desk-cursor" fill="#9bf5ce" d="M34 16h3v1h-3z" />
      <path className="xp-desk-steam" d="M52 19h2v-2h1v-2h-1v-2h-2v2h1v2h-1z" />
    </svg>
  );
}
