# Task 6: CV page as a WordPad document (XP Hills rev 6)

**Branch:** `redesign-xp-hills`, on top of the uncommitted Task 1–5 work (do not reset or discard it).
**Read first:** [`SPEC.md`](./SPEC-revisions.md) (incl. §4.0a sub-page rules), `AGENTS.md` (CV section), and the
Decisions logs of earlier tasks. Do this **after Task 5** is finished.
Leave changes uncommitted. After the task: `bun run lint && bun run typecheck && bun run test && bun run build`.
Update SPEC §5.5 with a short summary of the final CV design when done.

## Owner decisions (2026-11-20)
- Drop the raw-Markdown panel. Replace it with a **"Copy as Markdown"** action.
- Goal: **easy to scan** (a recruiter gets the gist in ~10 seconds).
- Metaphor: **WordPad document window** with a **working toolbar** and **decorative menus** + ruler.
- Layout: **two-column résumé** on the page.
- Page font: **period document fonts** (Times New Roman / Georgia body, Arial headings).
- Header from CV frontmatter, **no phone number on the web page** (phone stays in the PDF only).

## Current state
- `src/app/(main)/cv/page.tsx`: one XpWindow "CV - Sina Bastani", h1 "CV", Open PDF / Download PDF / Home
  buttons, and `.cv-split` with a raw `<pre>` panel and a rendered panel.
- `src/app/(main)/data/cv.ts`: reads `src/content/cv/sina-cv.md`, ignores frontmatter, renders the body
  with the **global** `marked.setOptions` (mutates the shared instance), sanitizes.
- `sina-cv.md` frontmatter (OhMyCV format): `name`, `header[]` items with `text` (contains `<span>`
  HTML and iconify spans) and optional `link`. Items: role "Software Developer", phone, email, GitHub, site.
- Body sections (`##`): Profile, Education, Employments, Job experiences, Selected Side Project,
  Skills & Merits (bold-label lines: Certificates, Programming Languages, Tools and Frameworks,
  Knowledge in LLM-based coding assistants, Languages). HTML comments at the top (LAST UPDATED, OhMyCv).

## 1. Data: structured CV (`data/cv.ts`)
Keep the Markdown file as the single source of truth (the PDF is separate and unchanged).
- Use a dedicated `new Marked({ gfm: true, breaks: true })` instance (no global `setOptions`).
- Parse frontmatter into a typed header: `{ name, role, links: { label, href, kind: "email" | "github" | "site" }[] }`.
  Strip HTML/iconify spans from `text` to get plain labels. **Exclude phone** entries (detect `tel`,
  `phone` icon, or digits pattern). Validate; on bad data `console.warn` and fall back gracefully.
- Split the body into sections by `## ` heading → `{ id, title, html }[]` (sanitized). Put
  **Skills & Merits** in the sidebar; the rest in the main column, in file order.
- Parse Skills & Merits bold-label lines into `{ label, items: string[] }[]` (split on commas) so the
  sidebar can render compact tags; keep the sanitized HTML as a fallback if parsing fails.
- Extract `LAST UPDATED` from the HTML comment if present (for the status bar).
- **Markdown for copy:** a string built from the header (name, role, email, GitHub, site; no phone)
  + the body Markdown without frontmatter and without the HTML comments.
- Add unit tests: phone excluded, sections split correctly, skills parsed, copy-Markdown has no phone
  and no frontmatter, graceful fallback on a malformed file (use a fixture, not the real CV).

## 2. WordPad window (`/cv`)
Sub-page rules still apply: faded hill header, window overlapping at ~18vh, no taskbar/pane,
centred, in-window navigation, scenery-mode easter egg works.
- Window title: **"cv.doc - WordPad"**. Wider than other windows (~980px max) so a page fits.
- **Menu bar** (decorative): File, Edit, View, Insert, Format, Help. Look like XP menus; not focusable
  (`aria-hidden`), no fake interactivity on hover beyond the XP highlight.
- **Toolbar** (working, XP toolbar buttons with small icons + text on wide screens, icons + `aria-label`
  on narrow):
  - **Print**: `window.print()` with a print stylesheet that prints only the document page (no hill,
    chrome, toolbar; black on white; A4 margins).
  - **Save as PDF**: `/cv.pdf?download=1` with `download="Sina-Bastani-CV.pdf"`.
  - **Open PDF**: `/cv.pdf` in a new tab (`rel="noopener noreferrer"`).
  - **Copy as Markdown**: copies the copy-Markdown string via `navigator.clipboard.writeText`;
    shows an XP-style tooltip/balloon "Copied to clipboard" for ~2s (`role="status"`); fallback for
    unsupported clipboard (select a hidden textarea + `execCommand("copy")`, or show the Markdown in a
    small XP dialog to copy manually).
- **Ruler** (decorative) under the toolbar, `aria-hidden`.
- **Document area:** grey (`#808080`-ish, XP app workspace) background with a **white page** (A4-ish
  proportions, max ~820px wide, drop shadow) that scrolls with the page (no inner scroll box).
- **Status bar:** "Page 1" · "Last updated <date>" (if found) · "For Help, press F1" (decorative).
- Bottom of window, outside the page: centred **Home** button (in-window nav, like other sub-pages).
- The single `<h1>` is the name on the page.

## 3. The document page (two-column résumé)
- **Header** (full width): name large (Arial bold), role, and a row of links (email, GitHub, website)
  with small inline SVG icons (no iconify script, no external icons). Thin rule below.
- **Left column** (~32%): Contact (same links, stacked), **Skills** as compact tags grouped by label
  (Programming Languages, Tools and Frameworks, LLM coding assistants), **Certificates**, **Languages**.
- **Right column** (~68%): Profile, Job experiences, Employments, Education, Selected Side Project
  (keep file order unless it reads badly; record the decision). Each job: title/company bold, dates and
  place muted on one line, details below. Headings Arial, uppercase small-caps feel, thin rule.
- Fonts on the page: body `"Times New Roman", Georgia, "Liberation Serif", serif` (~15–16px, line-height
  ~1.5); headings `Arial, Helvetica, "Liberation Sans", sans-serif`. Rest of the window chrome uses the
  site fonts.
- Paper stays light in night mode, slightly dimmed (e.g. `#eceae4` page on a darker workspace) so it
  doesn't glare; text stays dark. AA contrast.
- **Mobile < 760px:** single column: header, then main sections, then the sidebar content at the end
  (or skills right after Profile; pick the more scannable and record it). Toolbar collapses to icons;
  ruler hidden; menus reduced to "File Edit View"; page full width with small margins; no horizontal scroll.

## 4. Clean up
- Remove `.cv-split`, `.cv-raw`, `.cv-panel*` and other unused CV CSS.
- Update page metadata description (no longer "raw Markdown").
- Update `AGENTS.md` CV section and SPEC §5.5.

## Acceptance

Verified in Chrome at desktop and 375px, including generated A4 output, clipboard feedback and manual-copy fallback. The source Markdown and downloadable PDF were left unchanged.

- [x] /cv shows "cv.doc - WordPad" window: decorative menus + ruler, working toolbar, grey workspace, white two-column page, status bar with last-updated date, centred Home
- [x] Header: name (h1), role, email/GitHub/website links with inline icons; **no phone number anywhere in the HTML**
- [x] Skills render as compact grouped tags; certificates and languages in the sidebar
- [x] Copy as Markdown copies header + body without frontmatter, comments or phone; "Copied" feedback; fallback works without clipboard API
- [x] Print preview shows only the document page, clean on A4
- [x] Save as PDF downloads; Open PDF opens a new tab
- [x] Night mode: dimmed paper, readable; day mode: white paper
- [x] 375px: single column, icon toolbar, no horizontal scroll
- [x] Sub-page rules intact (hill header overlap, no nav bars, scenery easter egg)
- [x] New tests pass; lint, typecheck, test, build pass; no hydration warnings; `/anita` unchanged

## Decisions log
- The parser preserves Markdown file order; the on-screen main column leads with Profile, Job experiences, and Employments so recent work is easier to find. The mobile skills sidebar follows the main sections.
- Clipboard failures open a native WordPad-style dialog with the Markdown selected; there is no raw Markdown panel.
- The public résumé and copied Markdown omit phone details, while the original PDF is served unchanged.
