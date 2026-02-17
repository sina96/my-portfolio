"use client";
import Image from "next/image";
import Link from "next/link";
import memojiImage from "@/assets/images/sina-pc-memoji.png";

export function HomeTab() {
  return (
    <>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: "20px" }}>
        <Image
          src={memojiImage}
          alt="Sina memoji"
          width={100}
          height={100}
          loading="eager"
          style={{ marginBottom: "10px" }}
        />
        <h1 style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px" }}>
          i&apos;m Sina.
        </h1>
        <p style={{ fontSize: "14px", color: "var(--win98-text-secondary, #808080)" }}>
          Human. Developer. Livsnjutare
        </p>
      </div>

      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "center", alignItems: "center", gap: "24px", flexWrap: "wrap" }}>
        <span style={{ fontWeight: "bold", color: "var(--win98-text)" }}>Current Status:</span>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "12px",
            padding: "6px 12px",
            background: "var(--win98-status-indicator-bg)",
            border: "1px solid var(--win98-status-indicator-border)",
          }}
        >
          <div
            style={{
              width: "10px",
              height: "10px",
              background: "#FF0000",
              borderRadius: "50%",
              position: "relative",
            }}
          >
            <div
              className="animate-ping-large"
              style={{
                position: "absolute",
                inset: 0,
                background: "#FF0000",
                borderRadius: "50%",
              }}
            ></div>
          </div>
          <div style={{ fontSize: "12px", fontWeight: "normal", color: "var(--win98-status-text)" }}>
            in a project
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: "12px" }}>
        <Link
          href="/cv"
          className="button default"
          style={{ textDecoration: "none", color: "var(--win98-text, black)" }}
        >
          View CV
        </Link>
      </div>
    </>
  );
}
