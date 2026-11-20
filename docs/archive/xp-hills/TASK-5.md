# Task 5: Status, contact illustration, scenery easter egg, subtle RSS (XP Hills rev 5)

**Branch:** `redesign-xp-hills`, on top of the uncommitted Task 1–4 work (do not reset or discard it).
**Read first:** [`SPEC.md`](./SPEC-revisions.md) §10 "Rev 5 changes" (source of truth), [`TASK-4.md`](./TASK-4.md)
Decisions log, `AGENTS.md`. Task 4 was verified on 2026-11-20 (all acceptance items pass).
Leave changes uncommitted. After the task: `bun run lint && bun run typecheck && bun run test && bun run build`.

## 1. Status dot follows a config (SPEC §10)
Owner: "the current status shows green even if it should be red when I am in a project."
On `main` the dot was red; the redesign hard-coded green (`src/app/(main)/site.css:96`, `#36823d`).
- Add `SITE_STATUS` to `src/lib/site.ts`: `{ state: "busy" | "available"; label: string }`,
  default `{ state: "busy", label: "in a project" }`.
- `page.tsx` renders "Current Status: {label}" with `data-status={state}`; CSS: busy = red, available = green,
  both readable in day and night. Keep the ping (off under reduced motion).
- Add a unit test that both states map to the right class/attribute if there is a pure helper; otherwise skip.

## 2. Contact window gets a pixel-art desk (SPEC §10)
Owner: "what can we add to the contact window? It feels soulless." → chose a pixel-art desk sketch.
- New decorative component (e.g. `components/PixelDesk.tsx` + pure generator in `utils/`), drawn in code
  in the hill scene's style: coarse pixel grid, Bayer-dithered shading, small palette. Contents: desk,
  beige CRT monitor (screen shows a tiny pixel memoji-ish face or "hi" + blinking cursor), coffee mug
  with stepped steam, optionally a plant or keyboard.
- Day and night palettes from the theme store (night: monitor glow, darker room tones).
- Stepped animations (cursor blink, steam) using `steps()`; none under reduced motion.
- ~240–320px wide on desktop, ~200px on mobile, centred above "Let's link up!", `aria-hidden`,
  crisp (`image-rendering: pixelated`), no layout shift (reserve its box), no external assets.
- Deterministic output (seeded); add a determinism test like the hill scene's.

## 3. Scenery mode replaces the "you closed them all" card (SPEC §10)
Owner: "the 'you closed them all' easter egg is a bit tasteless. Closing all windows should offer
'wanna enjoy the scenery instead?' with two options: restore, or bring the hills to the centre as the
main thing on that page. A subtle restore button should be there." → no desktop icons; every page.
- Replace the closed-all card with a small XP dialog "Desktop": "wanna enjoy the scenery instead?",
  primary **Show me the hills**, subtle **restore windows** link-style button. Focus moves to the primary
  button when it appears; Escape = restore windows.
- **Show me the hills:**
  - Sub-pages: the header hill grows (stepped, ~600ms) to fill the viewport, fade removed, scroll locked
    (no content below). Landing: glide to the hill view and stay there (glide-down disabled while in
    scenery mode); taskbar shown.
  - Show the subtle caption "enjoy the scenery ☁" (same style as the landing caption) and a subtle
    "restore windows ↺" button low in a corner (small, muted, clear focus ring, `aria-label`).
- **restore windows:** reopens all content windows, restores normal layout and scrolling, focus to `#main`.
- Never counts `hi.exe`. Per page view, not persisted. Reduced motion: instant.
- Works on `/`, `/blog`, posts, `/cv`, `/contact` (with or without availability open), `/availability`, 404.

## 4. Subtle RSS icon on /blog (SPEC §10)
Owner: "the RSS button in /blog was previously a subtle RSS icon; now it's weird with its own background."
- Remove the `.xp-toolbar` strip and the "RSS" `xp-button-link` in `src/app/(main)/blog/page.tsx:21`
  (and the now-unused toolbar CSS).
- Add a small orange RSS glyph link (14px, `#ff8c00`, white arcs + dot; the old site's `.rss-feed-icon`
  from `main:src/app/globals.css` ~L991–1022 is a good reference) at the top-right of the archive window
  body, optionally with a muted "RSS" label. `aria-label="RSS feed"`, `title="RSS feed"`, visible focus ring.

## Acceptance

Verified with local Chrome against the production build: scenery and focus restoration on all public routes, Escape, responsive illustration, and the RSS link. The status uses one config for label and state; both color styles were checked.

- [x] Status: red "in a project" by default; flipping `SITE_STATUS` to available shows green and the new label; both themes
- [x] /contact: pixel desk renders crisp above the heading in day and night, animates (stepped) unless reduced motion, ~200px on 375px, no layout shift, no console errors
- [x] Close all content windows on each page → "wanna enjoy the scenery instead?" dialog; Show me the hills → full-viewport unfaded hill, caption, subtle restore; restore brings everything back with focus on #main; Escape on dialog restores; landing works with taskbar shown
- [x] Old "you closed them all" copy is gone everywhere
- [x] /blog: no toolbar background; small orange RSS icon top-right links to /feed.xml, keyboard focusable
- [x] No hydration warnings; reduced motion respected; lint, typecheck, test, build pass; `/anita` unchanged
- [x] SPEC/AGENTS updated if behaviour differs from SPEC §10

## Next (not this task)
CV page redesign: to be specified with the owner.

## Decisions log
- The pixel desk is server-rendered SVG; the pre-paint theme attribute selects its palette without waiting for hydration.
- Scenery mode preserves the landing layout while gliding back; sub-pages expand the existing hill instead of creating a duplicate scene.
- The Contact disclosure remains closed if intentionally dismissed before restoring the rest of the page.
