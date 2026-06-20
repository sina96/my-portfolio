"use client";
import Image from "next/image";
import Link from "next/link";
import memojiImage from "@/assets/images/sina-pc-memoji.png";

export function HomeTab() {
  return (
    <>
      <div className="home-intro">
        <Image
          src={memojiImage}
          alt="Sina memoji"
          width={100}
          height={100}
          loading="eager"
          className="home-avatar"
        />
        <h1 className="home-title">
          i&apos;m Sina.
        </h1>
        <p className="home-subtitle">
          Human. Developer. Hates all printers.
        </p>
      </div>

      <div className="home-status-row">
        <span className="win98-label">
          Current Status:
        </span>
        <div className="home-status-pill">
          <div className="home-status-dot">
            <div className="home-status-dot-ping animate-ping-large"></div>
          </div>
          <div className="home-status-text">
            in a project
          </div>
        </div>
      </div>

      <div className="home-actions">
        <Link
          href="/cv"
          className="button default button-link"
        >
          View CV
        </Link>
      </div>
    </>
  );
}
