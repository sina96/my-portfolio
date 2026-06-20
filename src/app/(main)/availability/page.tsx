import type { Metadata } from "next";
import Link from "next/link";
import { AvailabilityWidget } from "../components/AvailabilityWidget";
import { Win98Window } from "../components/Win98Window";

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
      <Win98Window
        title="Sina Bastani - Availability"
        className="availability-page-window"
        showMinimize
        showMaximize
        statusBar={
          <div className="status-bar">
            <p className="status-bar-field">AvailabilityPage</p>
            <p className="status-bar-field">Europe/Stockholm</p>
          </div>
        }
      >
        <AvailabilityWidget />

        <div className="availability-page-actions">
          <a
            href="mailto:contact@sinabastani.dev?subject=Contact%20Request&body=Hello!"
            className="button default button-link"
          >
            Contact me
          </a>
          <Link
            href="/"
            className="button button-link"
          >
            Back to portfolio
          </Link>
        </div>
      </Win98Window>
    </main>
  );
}
