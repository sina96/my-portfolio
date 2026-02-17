## Issue
The site has no dedicated CV page. We need a new `/cv` route that shows the same CV content in two forms: raw Markdown (read-only showcase for copy/inspection) and rendered HTML (for readable presentation), with a responsive two-panel layout (side-by-side on larger screens, stacked on mobile) that fits the existing Win98 aesthetic. It must also be discoverable from the Home tab via a dedicated `/cv` button.

## Proposed Solution
Store the CV as a single Markdown source file at `src/content/cv.md`, then add a small server-side helper at `src/app/(main)/data/cv.ts` that reads the file and returns `{ rawMarkdown, renderedHtml }`, rendering via `marked` and sanitizing via the existing `sanitizeHtml()` utility. Create a server component route at `src/app/(main)/cv/page.tsx` that includes `ThemeInitializer` and renders a Win98-style window containing two panels (raw + rendered). Add minimal responsive styles via global classes in `src/app/globals.css` (recommended) using `.cv-split`, `.cv-panel`, `.cv-raw`, `.cv-rendered`.

## Plan
1. Add the CV source markdown at `src/content/cv.md`.
2. Create `src/app/(main)/data/cv.ts`:
   - Read `src/content/cv/sina-cv.md` from disk using Node `fs/promises` and `path`.
   - Produce `renderedHtml` with `marked.parse(rawMarkdown)`.
   - Sanitize with the existing `sanitizeHtml()` from `src/app/(main)/utils/sanitizeHtml.ts`.
   - Return `{ rawMarkdown, renderedHtml }`.
   - Ensure errors degrade gracefully (e.g., empty strings + `console.warn()`), consistent with existing data helpers.
3. Add the route `src/app/(main)/cv/page.tsx` (server component):
   - Import and render `ThemeInitializer` (matching existing pages/components patterns).
   - Call the helper from `src/app/(main)/data/cv.ts`.
   - Render a Win98-style window wrapper (using existing 98.css classes/patterns used elsewhere in `(main)`), containing:
      - Panel A (raw Markdown, read-only): prefer `<pre><code>` showing `rawMarkdown` with class `.cv-panel .cv-raw`.
        - Editing is not allowed (no contentEditable, no writable input).
        - If a `<textarea>` is used, it must be `readOnly` and should not trap focus/keyboard navigation.
      - Panel B: a `<div>` showing sanitized HTML via `dangerouslySetInnerHTML={{ __html: renderedHtml }}` with class `.cv-panel .cv-rendered`.
4. Add global styles in `src/app/globals.css` (recommended):
   - Layout container:
     - `.cv-split { display: grid; gap: 12px; }`
     - Non-mobile default: `grid-template-columns: 1fr 1fr; align-items: start;`
     - Mobile breakpoint (e.g., `@media (max-width: 768px)`): `grid-template-columns: 1fr;` so panels stack.
   - Panel styling:
     - `.cv-panel { min-width: 0; }` (prevents overflow in grid)
     - `.cv-raw { white-space: pre-wrap; overflow: auto; max-height: ...; font-family: ...; }`
     - `.cv-rendered { overflow: auto; max-height: ...; }`
   - Keep styling minimal and consistent with the existing Win98 theme (borders, inset look, spacing).
5. Required (discoverability in Home tab):
   - Update `src/app/(main)/components/HomeTab.tsx` to add a link/button to `/cv` placed under the Current Status indicator block.
   - Use `next/link` and render an anchor styled as a 98.css button, e.g. `<a className="button default">View CV</a>` (or similar).
   - Placement: insert it immediately after the status indicator `<div style={{ display: "inline-flex", ... }}>` (the inline-flex status div inside the surrounding container) so it appears below the Current Status block.
   - Add minimal spacing via a small wrapper (e.g. a `<div>` with `marginTop`) or minimal inline styles so the button does not visually collide with the status row.

6. Optional fun elements (non-essential; keep Panel A read-only):
   - Line numbers for the raw Markdown (visual only).
   - Copy button for Panel A (copies `rawMarkdown` to clipboard).
   - Fake "Notepad"-style Win98 header/title bar for Panel A to emphasize it's a showcase, not an editor.

## Acceptance Criteria
- Visiting `/cv` renders a Win98-styled page/window with two panels:
  - Panel A shows the CV as raw Markdown text and is not editable (read-only); users can still select and copy.
  - Panel B shows the same content rendered to HTML.
- On non-mobile widths, panels display side-by-side; on mobile widths, panels stack vertically in one column.
- HTML is sanitized using the existing `sanitizeHtml()` utility before rendering via `dangerouslySetInnerHTML`.
- The CV content comes from `src/content/cv.md` and updates reflect immediately after rebuild/restart (no duplicated content sources).
- Styling changes are minimal and confined to the new `.cv-*` classes (or, if a CSS module is chosen instead, confined to the `/cv` route).
- Home tab shows a CV button/link under Current Status, and it navigates to `/cv`.

## Risks & Unknowns
- `marked` output + sanitization: current `sanitizeHtml()` config may strip desired tags/attributes (lists, headings, links) → adjust `sanitizeHtml` allowlist carefully without weakening security.
- Large CV content could make the page feel cramped or scroll poorly on small screens → set sensible `max-height`/scroll behavior per panel and test on mobile.
- Theme initialization: `ThemeInitializer` placement might be inconsistent with other routes → follow existing patterns in `(main)` pages to avoid hydration/theme flash.
- Navigation discoverability: adding a `/cv` link inside the tab UI could confuse the existing UX → add as a simple external route link and keep the current tab behavior unchanged.
