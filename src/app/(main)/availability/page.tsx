import type { Metadata } from "next";
import { siteAlternates } from "@/lib/site";
import { AvailabilityWidget } from "../components/AvailabilityWidget";
import { HillScene } from "../components/HillScene";
import { XpNavLink } from "../components/XpNavLink";
import { XpWindow } from "../components/XpWindow";

export const metadata: Metadata = {
  title: "Availability",
  description: "View Sina Bastani's availability for calls, project chats, and planning.",
  alternates: siteAlternates("/availability"),
};

export default function AvailabilityPage() {
  return (
    <>
      <HillScene mode="header" />
      <main id="main" className="xp-content availability-page" tabIndex={-1}>
        <XpWindow id="availability" icon="contact" title="Sina Bastani - Availability"
          statusBar={<div className="status-bar"><p className="status-bar-field">Europe/Stockholm</p></div>}>
          <h1 className="xp-sr-only">Availability</h1>
          <AvailabilityWidget />
          <div className="xp-actions">
            <XpNavLink href="/contact" label="Contact" icon="back" />
            <XpNavLink href="/" label="Home" icon="home" />
          </div>
        </XpWindow>
      </main>
    </>
  );
}
