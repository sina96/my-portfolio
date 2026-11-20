/** Escapes text for an XML element or attribute. */
export function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Resolves relative `src`/`href` values in HTML against a base URL; absolute URLs are kept. */
export function absolutizeUrls(html: string, base: string): string {
  return html.replace(/\b(src|href)="([^"]*)"/g, (match, attribute: string, value: string) => {
    if (!value || /^(?:[a-z][a-z\d+.-]*:|\/\/)/i.test(value)) return match;
    try {
      return `${attribute}="${new URL(value, base).href}"`;
    } catch {
      return match;
    }
  });
}

/** Wraps verbatim XML text, splitting any embedded CDATA terminators. */
export function xmlCdata(value: string): string {
  return `<![CDATA[${value.replaceAll("]]>", "]]]]><![CDATA[>")}]]>`;
}
