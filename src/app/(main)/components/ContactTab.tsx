"use client";

const SOCIAL_LINKS = {
  linkedin: "https://www.linkedin.com/in/sina-bastani",
  github: "https://github.com/sina96",
  instagram: "https://www.instagram.com/sinabastanii?igsh=MTYzdmtoMzMwbnFsMA%3D%3D&utm_source=qr",
};

export function ContactTab() {
  const handleMailtoClick = () => {
    window.location.href =
      "mailto:contact@sinabastani.dev?subject=Contact%20Request&body=Hello!";
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px" }}>
        Let&apos;s create something amazing together
      </h2>
      <p style={{ marginBottom: "20px", fontSize: "12px" }}>
        Have a fun project? Brainstorming? Friendly chat? Hit me up!
      </p>

      <div className="field-row" style={{ marginBottom: "20px" }}>
        <button className="default" onClick={handleMailtoClick}>
          Contact me
        </button>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "24px", flexWrap: "wrap", justifyContent: "center" }}>
        <span style={{ fontWeight: "bold" }}>Social Links:</span>
        <a
          href={SOCIAL_LINKS.linkedin}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "blue", textDecoration: "underline" }}
        >
          LinkedIn
        </a>
        <a
          href={SOCIAL_LINKS.github}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "blue", textDecoration: "underline" }}
        >
          GitHub
        </a>
        <a
          href={SOCIAL_LINKS.instagram}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "blue", textDecoration: "underline" }}
        >
          Instagram
        </a>
      </div>
    </div>
  );
}
