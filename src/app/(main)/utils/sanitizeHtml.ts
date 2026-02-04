import sanitize from "sanitize-html";

// Sanitization config - allows safe HTML tags for blog content
const SANITIZE_CONFIG: sanitize.IOptions = {
  allowedTags: [
    "p", "br", "strong", "em", "u", "b", "i",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li",
    "a", "blockquote", "code", "pre",
    "div", "span", "hr", "img",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "class"],
    "*": ["class"],
  },
  allowedSchemes: ["http", "https", "mailto"],
};

/**
 * Sanitizes HTML content to prevent XSS attacks.
 * Works on both server and client.
 *
 * @param dirty - Unsanitized HTML string
 * @returns Sanitized HTML string safe for dangerouslySetInnerHTML
 */
export function sanitizeHtml(dirty: string): string {
  return sanitize(dirty, SANITIZE_CONFIG);
}
