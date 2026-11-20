export const XP_PLACES = [
  { href: "/", label: "Home" },
  { href: "/blog", label: "Blog" },
  { href: "/cv", label: "CV" },
  { href: "/contact", label: "Contact" },
  { href: "/feed.xml", label: "RSS" },
] as const;

export function isCurrentPlace(pathname: string, href: string): boolean {
  return pathname === href || (href === "/blog" && pathname.startsWith("/blog/"));
}
