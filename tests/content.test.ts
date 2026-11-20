import { expect, test, vi } from "vitest";
import {
  expandBlogAuthoringShortcodes,
  parsePublicBlogPost,
  isValidFrontmatter,
  isValidSlug,
  normalizeDateString,
} from "@/app/(main)/data/blogPosts";
import { sanitizeHtml } from "@/app/(main)/utils/sanitizeHtml";
import { escapeXml, xmlCdata } from "@/lib/xml";

test("normalizes dates and rejects impossible calendar dates", () => {
  expect(normalizeDateString("2026-02-30")).toBeUndefined();
  expect(normalizeDateString(" 2024-02-29 ")).toBe("2024-02-29");
  expect(isValidFrontmatter({
    title: "Title", date: new Date("2026-02-28T00:00:00Z"), excerpt: "Excerpt",
  }, "fixture.md")).toMatchObject({ valid: true, date: "2026-02-28" });
});

test("parses only public posts with valid dates and rejects traversal slugs", () => {
  const warning = vi.spyOn(console, "warn").mockImplementation(() => {});
  const fixture = (date: string, hidden = false) => `---\ntitle: Title\ndate: ${date}\nexcerpt: Excerpt\nhidden: ${hidden}\n---\nBody`;
  try {
    expect(parsePublicBlogPost("visible", fixture("2026-02-28"))?.post.slug).toBe("visible");
    expect(parsePublicBlogPost("hidden", fixture("2026-02-28", true))).toBeUndefined();
    expect(parsePublicBlogPost("invalid", fixture("2026-02-30"))).toBeUndefined();
    expect(isValidSlug("../visible")).toBe(false);
    expect(parsePublicBlogPost("../visible", fixture("2026-02-28"))).toBeUndefined();
  } finally {
    warning.mockRestore();
  }
});

test("does not expand shortcodes inside backtick or tilde fences", () => {
  for (const marker of ["`", "~"]) {
    const fence = marker.repeat(4);
    const literal = `${fence}md\n${marker.repeat(3)}\n{{divider}}\n${fence}`;
    expect(expandBlogAuthoringShortcodes(`${literal}\n{{divider}}`)).toBe(`${literal}\n<hr>`);
  }
});

test("strips scripts, event handlers and unsafe links", () => {
  expect(sanitizeHtml('<script>alert(1)</script><img src="/image.png" onerror="alert(1)"><a href="javascript:alert(1)">link</a>'))
    .toBe('<img src="/image.png" loading="lazy" decoding="async" /><a>link</a>');
});

test("limits image sources and classes while preserving Markdown styling", () => {
  const result = sanitizeHtml('<span class="hljs-keyword language-ts blog-spacer arbitrary">code</span><img src="http://example.com/a.png"><img src="//example.com/b.png"><img src="https://example.com/c.png" loading="eager">');
  expect(result).toContain('class="hljs-keyword language-ts blog-spacer"');
  expect(result).not.toMatch(/arbitrary|a\.png|b\.png|eager/);
  expect(result).toContain('src="https://example.com/c.png"');
});

test("escapes the five XML special characters for RSS", () => {
  expect(escapeXml(`<post title="A & B">It's here</post>`))
    .toBe("&lt;post title=&quot;A &amp; B&quot;&gt;It&apos;s here&lt;/post&gt;");
  expect(xmlCdata("before ]]> after")).toBe("<![CDATA[before ]]]]><![CDATA[> after]]>");
});
