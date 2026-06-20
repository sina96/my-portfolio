import type { Metadata } from "next";
import Link from "next/link";
import { getCVContent } from "../data/cv";
import { ThemeInitializer } from "../components/ThemeInitializer";
import { Win98Window } from "../components/Win98Window";

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
      <div className="win98-page-shell">
        <Win98Window
          title="CV - Sina Bastani"
          className="cv-window"
          showMinimize
          showMaximize
          statusBar={
            <div className="status-bar">
              <p className="status-bar-field">CV</p>
              <p className="status-bar-field">Sina Bastani</p>
            </div>
          }
        >
          <div className="cv-layout">
            <div className="cv-actions">
              <a
                href="/cv.pdf"
                className="button default"
                target="_blank"
                rel="noopener noreferrer"
              >
                Open PDF
              </a>
              <a
                href="/cv.pdf?download=1"
                className="button default cv-download-btn"
                target="_blank"
                rel="noopener noreferrer"
                download="Sina-Bastani-CV.pdf"
              >
                Download PDF
              </a>
              <Link
                href="/"
                className="button default button-link"
              >
                Back to Homepage
              </Link>
            </div>

            <div className="cv-split">
              {/* Panel A: Raw Markdown (read-only) */}
              <div className="cv-panel cv-raw">
                <div className="cv-panel-heading">
                  Raw Markdown
                </div>
                <pre>
                  {rawMarkdown}
                </pre>
              </div>

              {/* Panel B: Rendered HTML */}
              <div className="cv-panel cv-rendered">
                <div className="cv-panel-heading">
                  Rendered View
                </div>
                <div
                  className="blog-post-content"
                  dangerouslySetInnerHTML={{ __html: renderedHtml }}
                />
              </div>
            </div>
          </div>
        </Win98Window>
      </div>
    </>
  );
}
