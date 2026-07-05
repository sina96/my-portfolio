# Blog Readability Fixes

The Windows 98 theme stays exactly as it is — window chrome, VT323 UI font,
colors, buttons. These fixes only touch the *article body* (`.blog-post-content`
in `src/app/globals.css`), which currently renders long posts as a hard-to-read
wall of text.

---

## Diagnosis

### 1. Paragraphs have no spacing (biggest issue)

Tailwind's preflight (`@tailwind base` in `globals.css`) resets margins to `0`
on `p`, `h1`–`h6`, `pre`, and `blockquote`. `.blog-post-content` only restores
styles for `ul`, `li`, and `a` — so paragraphs run together with zero gap.

Evidence: `src/content/blog/slow-the-fuck-down.md` uses a manual `<br>` between
paragraphs to force a gap. That's a workaround for this bug, and it can be
removed once the CSS is fixed.

### 2. Headings render at body-text size

Same preflight reset: `h2`/`h3` inside post content inherit the body font size
and weight, so `## Section` headings are visually indistinguishable from
paragraphs. Posts with structure look flat and are hard to follow.

### 3. Whole article is 12.5–13px monospace

`.blog-post-content` uses IBM Plex Mono at 12.5px (mobile) / 13px (desktop).
Monospace is slower to read for long-form prose, and 13px is small for
sustained reading.

### 4. Lines are too long

`.blog-post-window` is `max-width: 800px` and the text fills it. At 13px mono
that's well over 100 characters per line; the comfortable range for prose is
roughly 60–75 characters.

### 5. Code blocks, blockquotes, and images are unstyled

- `pre` has no background, padding, or `overflow-x` handling — long code lines
  will overflow the window on mobile
- `blockquote` has no visual treatment
- `img` has no `max-width: 100%`, so large images can break the layout

---

## Fix

All changes are scoped to `.blog-post-content` in `src/app/globals.css` —
replace the existing `.blog-post-content` block (and its `ul`/`li`/`a` rules)
with the following. Values use the existing Win98 CSS variables so dark mode
keeps working.

```css
/* Blog post content — long-form readability */
.blog-post-content {
  font-family: var(--font-ibm-plex-mono), monospace;
  font-size: 14px;
  line-height: 1.75;
  max-width: 68ch;        /* cap the measure; window stays 800px */
  color: var(--win98-text, black);
}

@media (min-width: 768px) {
  .blog-post-content {
    font-size: 14.5px;
  }
}

/* Paragraph rhythm (undo Tailwind preflight margin reset) */
.blog-post-content p {
  margin: 0 0 1em;
}

/* Heading hierarchy */
.blog-post-content h2 {
  margin: 1.6em 0 0.6em;
  font-size: 1.3em;
  font-weight: bold;
  color: var(--win98-text, black);
}

.blog-post-content h3 {
  margin: 1.4em 0 0.5em;
  font-size: 1.15em;
  font-weight: bold;
  color: var(--win98-text, black);
}

.blog-post-content h4 {
  margin: 1.2em 0 0.4em;
  font-size: 1em;
  font-weight: bold;
}

/* Lists */
.blog-post-content ul,
.blog-post-content ol {
  padding-left: 24px;
  margin: 0 0 1em;
}

.blog-post-content ul {
  list-style-type: disc;
}

.blog-post-content ol {
  list-style-type: decimal;
}

.blog-post-content li {
  margin: 4px 0;
}

/* Links (unchanged behavior) */
.blog-post-content a {
  color: var(--win98-link-color);
  text-decoration: underline;
}

.blog-post-content a:hover {
  text-decoration: none;
}

/* Inline code */
.blog-post-content code {
  padding: 1px 4px;
  background: var(--win98-status-indicator-bg, #d4d0c8);
  border: 1px solid var(--win98-border-dark, #808080);
  font-size: 0.95em;
}

/* Code blocks — Win98 inset look, no horizontal overflow */
.blog-post-content pre {
  margin: 0 0 1em;
  padding: 10px 12px;
  background: var(--win98-status-indicator-bg, #d4d0c8);
  box-shadow: inset -1px -1px var(--win98-border-light, #ffffff),
              inset 1px 1px var(--win98-border-dark, #808080);
  overflow-x: auto;
}

.blog-post-content pre code {
  padding: 0;
  background: none;
  border: none;
}

/* Blockquotes */
.blog-post-content blockquote {
  margin: 0 0 1em;
  padding: 6px 12px;
  border-left: 3px solid var(--win98-border-dark, #808080);
  color: var(--win98-text-secondary, #808080);
}

/* Images and horizontal rules */
.blog-post-content img {
  display: block;
  max-width: 100%;
  height: auto;
  margin: 1em 0;
  border: 1px solid var(--win98-border-dark, #808080);
}

.blog-post-content hr {
  margin: 1.5em 0;
  border: none;
  border-top: 1px solid var(--win98-border-dark, #808080);
}
```

Design decisions, in case you want to tune them:

- **Font stays IBM Plex Mono** to preserve the retro feel, but bumped to
  14–14.5px. If posts still feel heavy, the bigger lever is switching the body
  (not headings/chrome) to a proportional font — e.g. Georgia or a pixel-ish
  sans — while keeping mono for headings and code.
- **`max-width: 68ch`** keeps line length readable without shrinking the
  window. The header/buttons still span the full window; only the prose column
  is capped. Add `margin: 0 auto` to center it instead of left-aligning if
  preferred.
- **Word spacing removed** — the old `word-spacing: 0.08em` fights monospace
  rhythm and isn't needed once size/spacing are fixed.

---

## Content cleanup after the CSS lands

- Remove the manual `<br>` from `src/content/blog/slow-the-fuck-down.md` —
  real paragraph spacing makes it redundant.
- Consider breaking long single-paragraph posts into shorter paragraphs and
  adding `##` section headings — the CSS can only reward structure that exists
  in the Markdown.

## Sanitizer check

Verified: `src/app/(main)/utils/sanitizeHtml.ts` already allows every tag
styled above (`h1`–`h6`, `ol`, `pre`, `code`, `blockquote`, `img`, `hr`), so
no sanitizer changes are needed.

## Verify

1. `npm run dev`, open `/blog/hello-world` and the other posts
2. Check both light and dark mode (theme toggle)
3. Check mobile width (~375px): code blocks scroll horizontally instead of
   overflowing, text size is comfortable
4. Write a scratch post exercising every feature from
   [ADDING_BLOG_POSTS.md](../howto/ADDING_BLOG_POSTS.md) (headings, lists, code,
   blockquote, image, hr) and confirm each renders distinctly
