import sanitize from "sanitize-html";

// Sanitization config - allows safe HTML tags for blog content
const SANITIZE_CONFIG: sanitize.IOptions = {
  allowedTags: [
    "p", "br", "strong", "em", "u", "b", "i",
    "h1", "h2", "h3", "h4", "h5", "h6",
    "ul", "ol", "li",
    "a", "blockquote", "code", "pre",
    "div", "span", "hr", "img",
    "table", "thead", "tbody", "tr", "th", "td",
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    img: ["src", "alt", "class", "loading", "decoding"],
    th: ["align"],
    td: ["align"],
    "*": ["class"],
  },
  allowedClasses: { "*": ["hljs*", "language-*", "blog-*"] },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesByTag: { img: ["https"] },
  allowProtocolRelative: false,
  exclusiveFilter: (frame) => frame.tag === "img" && !frame.attribs.src,
  // Enforce rel="noopener noreferrer" on external links for security
  transformTags: {
    img: (tagName, attribs) => ({ tagName, attribs: { ...attribs, loading: "lazy", decoding: "async" } }),
    a: (tagName, attribs) => {
      const href = attribs.href || "";
      const isExternal = href.startsWith("http://") || href.startsWith("https://");

      if (isExternal) {
        return {
          tagName,
          attribs: {
            ...attribs,
            target: "_blank",
            rel: "noopener noreferrer",
          },
        };
      }

      return { tagName, attribs };
    },
  },
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
