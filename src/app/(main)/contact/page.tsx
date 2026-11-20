import type { Metadata } from "next";
import Link from "next/link";
import { CONTACT_URL, SOCIAL_LINKS, siteAlternates } from "@/lib/site";
import { HillScene } from "../components/HillScene";
import { PixelDesk } from "../components/PixelDesk";
import { ContactWindows } from "./ContactWindows";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Sina Bastani or check his availability.",
  alternates: siteAlternates("/contact"),
};

const PROFILES = [
  ["LinkedIn", SOCIAL_LINKS.linkedin], ["GitHub", SOCIAL_LINKS.github], ["Instagram", SOCIAL_LINKS.instagram],
];

export default function ContactPage() {
  return (
    <>
      <HillScene mode="header" />
      <main id="main" className="xp-content" tabIndex={-1}>
        <ContactWindows links={<>
          <Link href="/" className="xp-button-link">Home</Link>
          <Link href="/blog" className="xp-button-link">Blog</Link>
        </>}>
          <div className="xp-contact-intro">
            <div className="xp-contact-copy">
              <h1>Let&apos;s link up!</h1>
              <p>fun project ideas? ai psychosis? need a rant buddy? </p>
              <a href={CONTACT_URL} className="xp-button-link">hit me up</a>
              <p>i&apos;ll reply in a day or two. find me on socials:</p>
              <ul className="xp-socials" aria-label="Social links">
                {PROFILES.map(([label, href]) => (
                  <li key={label}><a href={href} target="_blank" rel="noopener noreferrer">{label}</a></li>
                ))}
              </ul>
              <p>Off the clock: logging movies on <a href={SOCIAL_LINKS.letterboxd} target="_blank" rel="noopener noreferrer">letterboxd</a>{" "}
                and making playlists on <a href={SOCIAL_LINKS.spotify} target="_blank" rel="noopener noreferrer">spotify</a>.</p>
            </div>
            <PixelDesk />
          </div>
        </ContactWindows>
      </main>
    </>
  );
}
