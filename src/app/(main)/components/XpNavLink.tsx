import Link from "next/link";
import { DesktopGlyph } from "./DesktopIcon";
import type { DesktopIconName } from "./DesktopIcon";

interface XpNavLinkProps {
  href: string;
  label: string;
  icon: DesktopIconName;
}

/** A compact in-window navigation button, with normal link semantics. */
export function XpNavLink({ href, label, icon }: Readonly<XpNavLinkProps>) {
  return <Link href={href} className="xp-button-link xp-nav-link">
    <DesktopGlyph icon={icon} size={16} />{label}
  </Link>;
}
