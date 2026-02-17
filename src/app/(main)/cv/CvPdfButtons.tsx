"use client";

/**
 * Some privacy-focused browsers (notably Firefox Focus/Klar) frequently block or ignore
 * direct file-download flows (e.g. navigation to a `Content-Disposition: attachment` URL
 * or links using the `download` attribute).
 *
 * To keep the UX reliable, we always expose an "Open PDF" action (inline viewer), and we
 * hide the explicit "Download" action for Focus-like browsers. Users can still save/share
 * the PDF from the built-in viewer UI.
 *
 * This is best-effort UA detection (not 100% accurate) because these browsers may reduce
 * or change UA strings for privacy.
 */
function isFirefoxFocusLikeUserAgent(userAgent: string): boolean {
  const ua = userAgent.toLowerCase();

  // Firefox Focus is branded as "Focus" or "Klar" in some locales.
  const focusToken = ua.includes("focus") || ua.includes("klar");
  const firefoxToken = ua.includes("firefox") || ua.includes("fxios") || ua.includes("fennec");

  return focusToken && firefoxToken;
}

export function CvPdfButtons() {
  const isFocusLike =
    typeof navigator !== "undefined" &&
    isFirefoxFocusLikeUserAgent(navigator.userAgent);

  return (
    <>
      <a
        href="/cv.pdf"
        className="button default"
        target="_blank"
        rel="noopener noreferrer"
      >
        Open PDF
      </a>

      {!isFocusLike && (
        <a
          href="/cv.pdf?download=1"
          className="button default"
        >
          Download PDF
        </a>
      )}
    </>
  );
}
