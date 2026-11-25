import { DesktopGlyph } from "../components/DesktopIcon";
import type { DesktopIconName } from "../components/DesktopIcon";

const OUTLINE = "#18305b";
const ROUND = "M5 1h6v1h2v2h1v2h1v4h-1v2h-1v2h-2v1H5v-1H3v-2H2v-2H1V6h1V4h1V2h2z";
const ROUND_FILL = "M5 2h6v1h2v2h1v6h-1v2h-2v1H5v-1H3v-2H2V5h1V3h2z";

/** Original 16×16 glyphs for the System Properties window (generic shapes, no product logos). */
const GLYPHS = {
  globe: <>
    <path fill={OUTLINE} d={ROUND} />
    <path fill="#5ca9e5" d={ROUND_FILL} />
    <path fill="#7fb446" d="M5 3h3v2H7v2H5v2H4V5h1zm5 4h3v3h-1v2h-2z" />
  </>,
  cloud: <>
    <path fill="#8a4513" d="M5 3h4v1h1v1h2v1h1v1h1v1h1v5h-1v1H1v-1H0v-3h1V8h2V6h1V4h1z" />
    <path fill="#f7a64b" d="M5 4h4v1h1v1h2v1h1v1h1v5H1v-3h1V9h2V7h1z" />
    <path fill="#ffd9a3" d="M5 5h3v1H6v2H5zm-2 4h2v1H3z" />
  </>,
  shield: <>
    <path fill={OUTLINE} d="M2 1h12v8h-1v2h-1v1h-1v1H9v1H7v-1H5v-1H4v-1H3V9H2z" />
    <path fill="#4f8a3c" d="M3 2h10v7h-1v2h-1v1H9v1H7v-1H5v-1H4V9H3z" />
    <path fill="#fff9dc" d="M10 5h1v1h-1v1H9v1H8v1H7V8H6V7H5V6h1v1h1v1h1V7h1V6h1z" />
  </>,
  gear: <>
    <path fill="#4a5a78" d="M6 0h4v2h2v1h1v2h3v6h-3v2h-1v1h-2v2H6v-2H4v-1H3v-2H0V5h3V3h1V2h2z" />
    <path fill="#c9d3e3" d="M6 3h4v1h1v1h1v6h-1v1h-1v1H6v-1H5v-1H4V5h1V4h1z" />
    <path fill="#4a5a78" d="M7 6h2v4H7z" />
  </>,
  clock: <>
    <path fill={OUTLINE} d={ROUND} />
    <path fill="#fff9dc" d={ROUND_FILL} />
    <path fill={OUTLINE} d="M7 4h2v4h3v2H7z" />
  </>,
  key: <>
    <path fill={OUTLINE} d="M1 4h6v2h1v1h7v3h-2v2h-2v-2H8v1H7v2H1v-1H0V5h1z" />
    <path fill="#f2c14e" d="M1 5h5v2h1v1h7v1h-2v2h-1V9H7v1H6v2H1z" />
    <path fill={OUTLINE} d="M2 7h2v2H2z" />
  </>,
  box: <>
    <path fill="#794b22" d="M2 1h12v3h1v11H1V4h1z" />
    <path fill="#f0b860" d="M3 2h10v2h1v10H2V4h1z" />
    <path fill="#ffd98a" d="M2 4h12v2H2z" />
    <path fill="#c98a3a" d="M7 2h2v6H7z" />
  </>,
} as const;

export type SystemGlyphName = keyof typeof GLYPHS | DesktopIconName;

/** Draw a System glyph, falling back to the shared desktop glyphs (github, inbox, blog, …). */
export function SystemGlyph({ icon, size = 16 }: Readonly<{ icon: SystemGlyphName; size?: number }>) {
  if (icon in GLYPHS) {
    return <svg viewBox="0 0 16 16" width={size} height={size} shapeRendering="crispEdges" aria-hidden="true">
      {GLYPHS[icon as keyof typeof GLYPHS]}
    </svg>;
  }
  return <DesktopGlyph icon={icon as DesktopIconName} size={size} />;
}
