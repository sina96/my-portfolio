import type { Metadata } from "next";
import Link from "next/link";
import { AvailabilityWidget } from "../components/AvailabilityWidget";

export const metadata: Metadata = {
  title: "Availability",
  description: "View Sina Bastani's availability for calls, project chats, and planning.",
  alternates: {
    canonical: "/availability",
  },
};

export default function AvailabilityPage() {
  return (
    <main className="availability-page">
      <div className="window availability-page-window">
        <div className="title-bar">
          <div className="title-bar-text">Sina Bastani - Availability</div>
          <div className="title-bar-controls">
            <button aria-label="Minimize"></button>
            <button aria-label="Maximize"></button>
            <button aria-label="Close"></button>
          </div>
        </div>
        <div className="window-body">
          <AvailabilityWidget />

          <div className="availability-page-actions">
            <a
              href="mailto:contact@sinabastani.dev?subject=Contact%20Request&body=Hello!"
              className="button default"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              Contact me
            </a>
            <Link
              href="/"
              className="button"
              style={{ textDecoration: "none", color: "inherit" }}
            >
              Back to portfolio
            </Link>
          </div>
        </div>
        <div className="status-bar">
          <p className="status-bar-field">AvailabilityPage</p>
          <p className="status-bar-field">Europe/Stockholm</p>
        </div>
      </div>
    </main>
  );
}
