import Link from "next/link";

interface DesktopIconProps {
  href: string;
  label: string;
  icon: DesktopIconName;
  external?: boolean;
  variant?: "desktop" | "window";
}

export type DesktopIconName = keyof typeof PIXEL_ART;

const PIXEL_ART = {
  inbox: <>
    <path fill="#18305b" d="M4 1h8v6h2v2h2v6H0V9h2V7h2z" />
    <path fill="#fff3cd" d="M5 2h6v6H5z" />
    <path fill="#6280ae" d="M6 3h4v1H6zm0 2h4v1H6z" />
    <path fill="#5ca9e5" d="M1 10h5v2h4v-2h5v4H1z" />
  </>,
  folder: <>
    <path fill="#794b22" d="M0 3h6v2h10v9H0z" />
    <path fill="#f9cb5e" d="M1 4h4v2h10v7H1z" />
    <path fill="#ffe6a5" d="M1 7h14v1H1z" />
  </>,
  "mail-open": <>
    <path fill="#172f62" d="M7 1h2v1h2v2h2v2h2v2h1v7H0V8h1V6h2V4h2V2h2z" />
    <path fill="#fff9dc" d="M3 5h10v7H3z" />
    <path fill="#8dbafa" d="M1 9h2v1h2v1h2v1h2v-1h2v-1h2V9h2v5H1z" />
  </>,
  copy: <>
    <path fill="#17386e" d="M1 1h10v3h4v11H5v-3H1z" />
    <path fill="#9ac4f4" d="M2 2h8v2H5v7H2z" />
    <path fill="#fff9dc" d="M6 5h8v9H6z" />
    <path fill="#427ec7" d="M8 7h4v1H8zm0 2h4v1H8zm0 2h3v1H8z" />
  </>,
  home: <>
    <path fill="#263b64" d="M7 1h2v1h1v1h1v1h1v1h1v1h1v1h1v2h-2v6H3V9H1V7h1V6h1V5h1V4h1V3h1V2h1z" />
    <path fill="#d96545" d="M8 2l6 6H2z" />
    <path fill="#fff1c1" d="M4 9h8v5H4z" />
    <path fill="#427ec7" d="M7 10h3v4H7z" />
  </>,
  back: <>
    <path fill="#17386e" d="M5 2h3v3h6v6H8v3H5v-1H4v-1H3v-1H2v-1H1V6h1V5h1V4h1V3h1z" />
    <path fill="#91c5ff" d="M6 3h1v3h6v4H7v3H6v-1H5v-1H4v-1H3V9H2V7h1V6h1V5h1V4h1z" />
  </>,
  linkedin: <>
    <path fill="#143667" d="M1 0h14v1h1v14h-1v1H1v-1H0V1h1z" />
    <path fill="#337dc5" d="M1 1h14v14H1z" />
    <path fill="#f5faff" d="M3 3h2v2H3zm0 4h2v6H3zm4 0h5v1h1v5h-2V9H9v4H7z" />
  </>,
  github: <>
    <path fill="#222643" d="M3 1h10v1h2v2h1v8h-1v2h-2v1H3v-1H1v-2H0V4h1V2h2z" />
    <path fill="#f2f1f8" d="M3 4h2v1h6V4h2v6h-1v1h-2v3H6v-3H4v-1H3z" />
    <path fill="#222643" d="M5 7h1v2H5zm5 0h1v2h-1z" />
  </>,
  instagram: <>
    <path fill="#733456" d="M2 0h12v1h1v1h1v12h-1v1h-1v1H2v-1H1v-1H0V2h1V1h1z" />
    <path fill="#c95d7d" d="M1 3h14v10H1z" />
    <path fill="#ffc885" d="M3 4h10v1h1v7h-1v1H3v-1H2V5h1z" />
    <path fill="#733456" d="M6 6h4v1h1v3h-1v1H6v-1H5V7h1zm6-1h1v1h-1z" />
    <path fill="#fff4d8" d="M7 7h2v3H7z" />
  </>,
  desktop: <>
    <path fill="#14204a" d="M1 1h14v11H9v2h3v2H4v-2h3v-2H1z" />
    <path fill="#ece9d8" d="M2 2h12v9H2zm3 12h6v1H5z" />
    <path fill="#387ad4" d="M3 3h10v7H3z" />
    <path fill="#94c946" d="M3 8h3V7h4v1h3v2H3z" />
  </>,
  about: <>
    <path fill="#19376d" d="M0 2h16v12H0z" />
    <path fill="#ece9d8" d="M1 3h14v10H1z" />
    <path fill="#ffc784" d="M4 5h3v3H4z" />
    <path fill="#387ad4" d="M3 9h5v3H3zm7-4h4v1h-4zm0 2h4v1h-4zm0 2h3v1h-3z" />
  </>,
  cv: <>
    <path fill="#172f62" d="M2 0h8v1h1v1h1v1h1v1h1v12H2z" />
    <path fill="#fff9dc" d="M3 1h6v5h4v9H3z" />
    <path fill="#91bdf4" d="M10 2h1v1h1v1h1v1h-3z" />
    <path fill="#376dad" d="M5 7h6v1H5zm0 2h6v1H5zm0 2h4v1H5z" />
  </>,
  contact: <>
    <path fill="#172f62" d="M0 3h16v11H0z" />
    <path fill="#9bc4fa" d="M1 4h14v9H1z" />
    <path fill="#fff9dc" d="M2 12h12L9 8H7zM2 4h12v1h-1v1h-1v1h-1v1h-1v1H6V8H5V7H4V6H3V5H2z" />
    <path fill="#376dad" d="M1 5h1v1h1v1h1v1h1v1h1v1H5V9H4V8H3V7H2V6H1zm14 0h-1v1h-1v1h-1v1h-1v1h-1v1h1V9h1V8h1V7h1V6h1z" />
  </>,
  blog: <>
    <path fill="#172f62" d="M1 1h11v14H1z" />
    <path fill="#fff9dc" d="M3 4h8v10H3z" />
    <path fill="#6ba7ee" d="M2 2h9v2H2zm2 4h5v1H4zm0 2h5v1H4zm0 2h3v1H4z" />
    <path fill="#172f62" d="M13 3h2v1h1v2h-1v1h-1v1h-1v1h-1v1h-1v1h-1v1H7V9h1V8h1V7h1V6h1V5h1V4h1z" />
    <path fill="#ffc65b" d="M13 4h1v1h1v1h-1v1h-1v1h-1v1h-1v1h-1v1H8v-1h1V9h1V8h1V7h1V6h1z" />
  </>,
};

/** Draw one of the original 16×16 glyphs at the requested display size. */
export function DesktopGlyph({ icon, size }: Readonly<{ icon: DesktopIconName; size: number }>) {
  return <svg viewBox="0 0 16 16" width={size} height={size} shapeRendering="crispEdges" aria-hidden="true">
    {PIXEL_ART[icon]}
  </svg>;
}

/** An XP-style shortcut with an original 16×16 pixel glyph. */
export function DesktopIcon({ href, label, icon, external, variant = "desktop" }: Readonly<DesktopIconProps>) {
  const contents = <>
    <DesktopGlyph icon={icon} size={32} />
    <span>{label}</span>
  </>;

  const className = `xp-desktop-shortcut xp-shortcut-${variant}`;
  if (external) return <a className={className} href={href} target="_blank" rel="noopener noreferrer">{contents}</a>;
  if (href.startsWith("mailto:")) return <a className={className} href={href}>{contents}</a>;
  return <Link className={className} href={href}>{contents}</Link>;
}
