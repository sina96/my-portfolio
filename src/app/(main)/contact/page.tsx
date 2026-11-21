import type { Metadata } from "next";
import { CONTACT_URL, SOCIAL_LINKS, siteAlternates } from "@/lib/site";
import { DesktopIcon } from "../components/DesktopIcon";
import { HillScene } from "../components/HillScene";
import { XpNavLink } from "../components/XpNavLink";
import { CardTable } from "./CardTable";
import { ContactWindows } from "./ContactWindows";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Sina Bastani or check his availability.",
  alternates: siteAlternates("/contact"),
};

export default function ContactPage() {
  return (
    <>
      <HillScene mode="header" />
      <main id="main" className="xp-content xp-contact-page" tabIndex={-1}>
        <ContactWindows links={<>
          <XpNavLink href="/" label="Home" icon="home" />
          <XpNavLink href="/blog" label="Blog" icon="blog" />
        </>}>
          <div className="xp-card-menu" aria-hidden="true"><span>Deal</span><span>Options</span><span>Help</span></div>
          {/* Pixel desk parked (docs/archive/xp-hills/landing-v2/TASK-16-subpages.md §0). */}
          <CardTable />
          <div className="xp-contact-copy">
            <h1>Let&apos;s link up!</h1>
            <p>fun project ideas? ai psychosis? need a rant buddy? </p>
            <a href={CONTACT_URL} className="xp-button-link">hit me up</a>
            <p>i&apos;ll reply in a day or two. find me on socials:</p>
            <ul className="xp-contact-shortcuts" aria-label="Contact links">
              <li><DesktopIcon href={CONTACT_URL} label="Email" icon="contact" variant="window" /></li>
              <li><DesktopIcon href={SOCIAL_LINKS.linkedin} label="LinkedIn" icon="linkedin" variant="window" external /></li>
              <li><DesktopIcon href={SOCIAL_LINKS.github} label="GitHub" icon="github" variant="window" external /></li>
              <li><DesktopIcon href={SOCIAL_LINKS.instagram} label="Instagram" icon="instagram" variant="window" external /></li>
            </ul>
            <p>Off the clock:</p>
            <p>logging movies on <a className="xp-felt-link" href={SOCIAL_LINKS.letterboxd} target="_blank" rel="noopener noreferrer">letterboxd</a>{" "}</p>
            <p>making playlists on <a className="xp-felt-link" href={SOCIAL_LINKS.spotify} target="_blank" rel="noopener noreferrer">spotify</a>.</p>
          </div>
        </ContactWindows>
      </main>
    </>
  );
}
