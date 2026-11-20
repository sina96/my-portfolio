# Task 2: Post-review fixes for the XP Hills redesign

> Historical baseline (rev 2). See [TASK-3.md](./TASK-3.md) for landing-only navigation, the desktop glide, and layout changes.

**Branch:** `redesign-xp-hills`, on top of the uncommitted Task 1 work (do not reset or discard it).
**Read first:** [`SPEC.md`](./SPEC-revisions.md), [`TASK.md`](./TASK.md) (incl. its Decisions log), `AGENTS.md`.
Task 1 was verified on 2026-11-20: lint, typecheck, test and build pass and all routes behave as specced.
Part A fixes the review findings; Part B applies the owner's design changes (SPEC rev 2).
Do Part A first, then Part B.

Leave changes uncommitted (the owner commits after review), unless told otherwise.
Sanity check after each part: `bun run lint && bun run typecheck && bun run test && bun run build`.

## Part A: Review fixes

### A1. Smooth-scroll warning (dev console)
`[browser] Detected scroll-behavior: smooth on the <html> element...` comes from
`src/app/(main)/site.css:181` (`html:has(.xp-desktop) { scroll-behavior: smooth; }`).
- Add `data-scroll-behavior="smooth"` to `<html>` in `src/app/layout.tsx` (Next's documented fix),
  keeping smooth scroll for in-page anchors and disabling it during route transitions.
- Keep it off under `prefers-reduced-motion: reduce`.
- `src/app/anita/anita.css:6` sets the same rule; the root `<html>` attribute covers it too. Leave `/anita` visually unchanged.

### A2. LCP image warning
`Image with src ".../sina-pc-memoji...png" was detected as the Largest Contentful Paint`.
- In `src/app/(main)/page.tsx` (~line 34) give the memoji `<Image>` `loading="eager"`
  (it is above the fold on mobile). Do not use the deprecated `priority` prop if Next 16 warns about it.

### A3. Availability log noise
Local `.env` contains the placeholder values from `.env.example`, so every request logs three full
stack traces and falls back to mock data. That is config, not a bug, but the logging is too loud.
- In `src/app/api/availability/ics.ts` (~lines 201, 331) and `route.ts` (~line 39) log a single line
  with `error instanceof Error ? error.message : String(error)` instead of the whole Error object.
- Do **not** edit `.env` (owner will fix their config). Optionally add a comment in `.env.example`
  that the example values are placeholders and the vars should be removed or replaced.

### A4. 404 page doesn't match the site
`src/app/not-found.tsx` renders outside the `(main)` layout: no hill header, no taskbar, no skip link,
and its mono heading falls back to Courier.
- Make the 404 use the same chrome as other pages: static `HillScene mode="header"`, taskbar,
  skip link, `<main id="main">`, the site font stacks, and the XP error-dialog window it already has.
  Options: a `src/app/(main)/[...notFound]/page.tsx` that calls `notFound()` plus
  `src/app/(main)/not-found.tsx`, or importing the (main) styles/chrome into the root not-found.
  Pick the cleanest one that keeps a real **404 status** and record the choice in the Decisions log.
- Title should be e.g. "Page not found | Sina Bastani".

### A5. `/blog` Explorer window frame
The RSS toolbar strip sits outside the window's blue side borders (the borders start below the toolbar).
- Make the toolbar part of the framed window body so the left/right/bottom frame is continuous from
  title bar to bottom, in both themes.

### A6. Duplicate headings inside windows
`/blog` has title bar "My Blog" + `<h1>My Blog</h1>`; `/availability` and the Availability window on
`/contact` repeat "Availability" as a heading.
- Keep exactly one `<h1>` per page (a11y/SEO), but avoid the visual duplication: either make the
  in-window heading visually hidden (`.sr-only`-style class) where it only repeats the title bar,
  or give it different copy. Apply consistently.

### A7. Explicitly not in scope
- Speed Insights console errors on localhost (expected; only works on Vercel).
- Blog post copy (e.g. "retro Windows 98 theme" in `hello-world.md`): owner's call, don't edit.
- Phase 6 of TASK.md (sanitizer, CMS preview, Renovate) stays deferred.

### Part A acceptance

Verified in Chrome dev at 1280px and 375px; production HTTP and screenshot checks also passed.
- [x] No smooth-scroll or LCP warnings in the dev console on `/` (desktop and 375px)
- [x] Availability fallback logs one line per failure, no stack traces
- [x] Unknown URL: 404 status, hill header, taskbar, skip link, XP error window, consistent fonts, both themes
- [x] `/blog` window frame continuous around the toolbar, both themes
- [x] One `<h1>` per page, no visually duplicated title/heading pairs
- [x] lint, typecheck, test, build pass; `/anita` unchanged

## Part B: Design changes (owner review, 2026-11-20)

SPEC.md has been updated (rev 2). The sections that changed: §2.2 fonts, §4.0 nav swap, §4.4 task pane,
§4.5 desktop icon and tray balloon, §5.1 landing, §5.3 post, §6 responsive. SPEC wins over this summary.

### B1. Hero window becomes `hi.exe` (SPEC §5.1)
- Title bar "hi.exe"; body: large memoji (`loading="eager"`), "hi! 👋", hint "(you can close me, the view is nicer)".
- Minimize → taskbar button restores it. Maximize is decorative (no-op, not focusable, `aria-hidden`).
  Close → desktop icon + caption (B2).
- Keep the existing scroll fade/lift.

### B2. Desktop icon, caption and tray balloon (SPEC §4.5)
- `hi.exe` desktop icon (memoji + label) top-left on the full-screen hill, only while the hero is closed.
  Double-click on desktop; single tap / Enter / Space also open it. Real `<button>`, name "Open hi.exe".
- Caption "enjoy the scenery ☁" over the hill while the hero is closed.
- Yellow XP tray balloon "psst… try closing the window, the view is nicer": once per visitor
  (try/catch-wrapped localStorage flag), ~4s after load, only if the hero is open and the page is at the top;
  closable, auto-hides ~10s or when the hero closes; `role="status"`.
- The hero window is **excluded** from the "you closed them all" check; that joke applies to the
  windows below the hill only.

### B3. Landing content below the hill (SPEC §5.1)
- One centred column, stacked: **About me** window (memoji, `<h1>` "Sina Bastani", tagline, status pill,
  View CV), then **Latest posts** window. Remove the side-by-side grid.
- The page's single `<h1>` moves from the hero to the About me window.

### B4. Navigation swap: taskbar → XP Explorer task pane (SPEC §4.0, §4.4)
- Taskbar shows while the hill is on screen; once scrolled past the hill (landing: once the intro has
  fully shrunk; other pages: past the static header) it fades out and a sticky left **task pane** fades in.
  Reverse on scroll up. Applies to every `(main)` page.
- Task pane: XP Explorer look (blue pane, rounded collapsible groups with chevrons). Groups:
  Places (Home, Blog, CV, Contact, RSS with small inline icons, `aria-current`),
  Other (theme toggle + restore buttons for closed/minimized windows), optional Details (©).
- Use an IntersectionObserver sentinel, not a per-frame scroll handler. Only the active nav is focusable
  (`inert` on the other). Reduced motion: instant swap.
- **Mobile < 760px:** taskbar fades the same way; a small fixed button opens the task pane as a
  slide-in drawer (focus trap, Escape/backdrop closes, focus returns to the button).
- Content column stays centred in the space next to the pane; no layout jump when the pane appears
  (reserve its width on desktop, or overlay it in a gutter that is always reserved).

### B5. Blog post: one window (SPEC §5.3)
- Merge the title window and the article window into one window: title bar = post title; inside, date
  meta + `<h1>` title, then the content, then "← All posts" / "Home".

### B6. Fonts (SPEC §2.2)
- Headings, title bars, Start button, task pane headers: `"Trebuchet MS", "Fira Sans", "Segoe UI", sans-serif` bold.
- Body and UI: `Verdana, "DejaVu Sans", "PT Sans", Tahoma, sans-serif`, ~15px desktop body, line-height ~1.6.
- Dates, meta, code: `"Lucida Console", Consolas, "IBM Plex Mono", monospace`.
- Load only the needed web fallbacks via `next/font` (e.g. Fira Sans, PT Sans, IBM Plex Mono) so
  Android/Linux look close. Remove Ubuntu Sans (and anything else unused). Check readability of long
  posts (`.blog-post-content`) and the CV in both themes; adjust size/line-height if Verdana feels too wide.
- Update the share images (`opengraph-image.tsx`, `src/lib/shareImage.tsx`) only if they reference removed fonts.

### Part B acceptance

Verified against a local production build in Chrome, including desktop mouse, mobile touch, keyboard and reduced motion.
- [x] Landing at top: `hi.exe` window over full-screen hills, taskbar visible; balloon appears once after ~4s
- [x] Close hero → caption + `hi.exe` icon; icon reopens it (double-click, tap, keyboard); all-closed joke not triggered
- [x] Minimize hero → taskbar button restores; Maximize does nothing and isn't tabbable
- [x] Below the hill: About me then Latest posts, centred, single column
- [x] Scroll past hill → taskbar fades, task pane appears (all `(main)` pages); scroll up reverses; no layout jump
- [x] Mobile: taskbar fades, drawer button opens task pane drawer, focus trap works, no horizontal scroll at 375px
- [x] Blog post is one window with date + h1 + body
- [x] Fonts per B6 everywhere; Ubuntu Sans gone; long posts comfortably readable in both themes
- [x] Reduced motion: no balloon pop, no nav swap animation, scene still static
- [x] One `<h1>` per page; no hydration warnings; lint, typecheck, test, build pass; `/anita` unchanged
- [x] SPEC/TASK docs and AGENTS.md updated where they describe the nav, hero or fonts

## Decisions log
- The root not-found boundary reuses `XpShell`; Next still sends HTTP 404 for unknown paths, including missing blog slugs. The root metadata title template uses an empty default so the not-found component can supply its own title.
- The landing sentinel crosses the viewport at the end of the desktop intro shrink (58vh); header mode uses the actual header bottom (42vh). The pane gutter stays reserved on desktop.
- The mobile pane uses a native modal dialog, with explicit Tab wrapping and focus restoration.
- Desktop icon mouse activation requires double-click; touch, pen, Enter and Space can open it once. The balloon is still shown in reduced motion without animation.
- The 15px font guidance in rev 2 §2.2 takes precedence over the old sizes in §6; sharing images do not use the removed font.
