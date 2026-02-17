import type { Metadata } from "next";
import Link from "next/link";
import { getCVContent } from "../data/cv";
import { ThemeInitializer } from "../components/ThemeInitializer";
import { CvPdfButtons } from "./CvPdfButtons";

export const metadata: Metadata = {
  title: "CV",
  description: "View Sina Bastani's CV as rendered HTML or raw Markdown, and download the PDF.",
  alternates: {
    canonical: "/cv",
  },
  openGraph: {
    type: "profile",
    url: "/cv",
    title: "CV - Sina Bastani",
    description: "View the CV and download a PDF copy.",
  },
};

export default async function CVPage() {
  const { rawMarkdown, renderedHtml } = getCVContent();

  return (
    <>
      <ThemeInitializer />
      <div style={{ padding: "20px", minHeight: "100vh" }}>
        <div className="window" style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div className="title-bar">
            <div className="title-bar-text">CV - Sina Bastani</div>
            <div className="title-bar-controls">
              <button aria-label="Minimize"></button>
              <button aria-label="Maximize"></button>
              <button aria-label="Close"></button>
            </div>
          </div>
          <div className="window-body">
            <div className="cv-layout">
              <div className="cv-actions">
                <CvPdfButtons />
                <Link
                  href="/"
                  className="button default"
                  style={{ textDecoration: "none", color: "var(--win98-text, black)" }}
                >
                  Back to Homepage
                </Link>
              </div>

              <div className="cv-split">
                {/* Panel A: Raw Markdown (read-only) */}
                <div className="cv-panel cv-raw">
                  <div
                    style={{
                      marginBottom: "8px",
                      paddingBottom: "8px",
                      borderBottom: "1px solid var(--win98-border-dark, #808080)",
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "var(--win98-text, black)",
                    }}
                  >
                    Raw Markdown
                  </div>
<pre
                  style={{
                    margin: 0,
                    whiteSpace: "pre-wrap",
                    wordWrap: "break-word",
                    fontFamily: "monospace",
                    fontSize: "12px",
                    background: "var(--win98-window-bg, #c0c0c0)",
                  }}
                >
                  {rawMarkdown}
                </pre>
                </div>

                {/* Panel B: Rendered HTML */}
                <div className="cv-panel cv-rendered">
                  <div
                    style={{
                      marginBottom: "8px",
                      paddingBottom: "8px",
                      borderBottom: "1px solid var(--win98-border-dark, #808080)",
                      fontSize: "12px",
                      fontWeight: "bold",
                      color: "var(--win98-text, black)",
                    }}
                  >
                    Rendered View
                  </div>
                  <div
                    className="blog-post-content"
                    dangerouslySetInnerHTML={{ __html: renderedHtml }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="status-bar">
            <p className="status-bar-field">CV</p>
            <p className="status-bar-field">Sina Bastani</p>
          </div>
        </div>
      </div>
    </>
  );
}
