"use client";
import { useState } from "react";
import { useTheme } from "../hooks/useTheme";
import { AvailabilityWidget } from "./AvailabilityWidget";

const SOCIAL_LINKS = {
  linkedin: "https://www.linkedin.com/in/sina-bastani",
  github: "https://github.com/sina96",
  instagram:
    "https://www.instagram.com/sinabastanii?igsh=MTYzdmtoMzMwbnFsMA%3D%3D&utm_source=qr",
  letterboxd: "https://boxd.it/2YAg9",
  spotify:
    "https://open.spotify.com/user/11183243899?si=ZtFq6xTjQO2AbpK7QF7WaQ",
};

export function ContactTab() {
  // Initialize theme to ensure it's set up correctly
  useTheme();
  const [showAvailability, setShowAvailability] = useState(false);

  return (
    <div className="contact-tab">
      <h2 className="win98-section-title">
        Let&apos;s create something amazing together
      </h2>
      <p className="contact-copy">
        Have a fun project? Brainstorming? Friendly chat? Hit me up!
      </p>

      <div className="field-row contact-actions">
        <a
          href="mailto:contact@sinabastani.dev?subject=Contact%20Request&body=Hello!"
          className="button default button-link"
        >
          Contact me
        </a>
      </div>

      <div className="availability-widget">
        <button
          type="button"
          className="default"
          aria-expanded={showAvailability}
          aria-controls="availability-panel"
          onClick={() => setShowAvailability((currentValue) => !currentValue)}
        >
          {showAvailability ? "Hide availability" : "View availability"}
        </button>

        {showAvailability && <AvailabilityWidget id="availability-panel" />}
      </div>

      <div className="contact-social-links">
        <span className="win98-label">Social Links:</span>
        <a
          href={SOCIAL_LINKS.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          className="win98-link"
        >
          LinkedIn
        </a>
        <a
          href={SOCIAL_LINKS.github}
          target="_blank"
          rel="noopener noreferrer"
          className="win98-link"
        >
          GitHub
        </a>
        <a
          href={SOCIAL_LINKS.instagram}
          target="_blank"
          rel="noopener noreferrer"
          className="win98-link"
        >
          Instagram
        </a>
      </div>

      <p className="contact-media-copy">
        i watch{" "}
        <a
          href={SOCIAL_LINKS.letterboxd}
          target="_blank"
          rel="noopener noreferrer"
          className="win98-link"
        >
          movies
        </a>{" "}
        and listen to{" "}
        <a
          href={SOCIAL_LINKS.spotify}
          target="_blank"
          rel="noopener noreferrer"
          className="win98-link"
        >
          music
        </a>{" "}
        too
      </p>
    </div>
  );
}
