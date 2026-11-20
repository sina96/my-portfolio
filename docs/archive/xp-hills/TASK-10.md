# Task 10: Hero note, CV toolbar, landing scroll behaviour (post-review of Task 9)

**Branch:** `redesign-xp-hills`, on top of the uncommitted Task 1–9 work. Leave changes uncommitted.
**Read first:** `SPEC.md`, Decisions logs of `TASK-6-CV.md`, `TASK-8.md`, `TASK-9.md`.
Task 9 was verified on 2026-11-20. After the task: `bun run lint && bun run typecheck && bun run test && bun run build`.
Update SPEC/AGENTS where behaviour changes (Task 9's "Home → content on mobile" is replaced below).

## 1. hi.exe note has a dark chip in light mode (bug)
Owner: "in light mode '(you can close me, the view is nicer)' has a dark background."
- Cause: `hero.css` `.xp-hero-note` sets `background: rgb(10 16 48 / .76)` + padding/radius in both themes.
- Fix: no chip/background in either theme. Plain text like the greeting: white ~70% opacity, the same
  soft text-shadow as `.xp-hero-window .window-body`, ~12px. It must stay readable over the light glass;
  if 70% is too faint in light mode, use ~80% there and record it.

## 2. CV toolbar: Home on top, understandable mobile buttons (owner request)
Owner: "the Home button can be on top as well, aligned with other buttons. The mobile version of the
buttons is nice but can be hard to understand."
- Add **Home** to the WordPad toolbar row (`cv/CVToolbar.tsx`), same toolbar-button style and height as
  Print / Save as PDF / Open PDF / Copy as Markdown, with a small house icon (inline SVG, like the pane's
  Home icon in `TaskPane.tsx:13`). Place it at the start of the row, separated by an XP toolbar separator.
  It's a normal `<Link href="/">`. Keep the bottom centred Home button too.
- Mobile (<760px): don't show icon-only buttons. Show icon + a short label under (or beside) it:
  "Home", "Print", "Save PDF", "Open PDF", "Copy MD" (full names stay in `aria-label`/`title`).
  Fit 375px without horizontal scroll: allow the toolbar to wrap or use stacked icon-over-label buttons
  (XP "large icons" toolbar look). Labels ≥11px.
- Desktop keeps icons + full text.

## 3. Landing scroll behaviour (owner request)
### 3a. Mobile Home goes to the very top
Owner: "on mobile, clicking Home in the taskbar scrolls, but then we don't see the hills. On mobile it should take us
to the top."
- <760px (and any non-glide mode): Home on `/` restores content windows if needed (scenery / all-closed
  dialog, same as Task 9), closes the Start menu / drawer, then scrolls to `top: 0` (smooth unless reduced
  motion) so the hill and hi.exe are visible. Focus: the skip-link target is not needed; move focus to the
  `<body>`/document start or the hi.exe window without scrolling (record choice; must not jump).
- Desktop glide mode: unchanged (Home → glide to content).

### 3b. Every visit starts at the hill view
Owner: "on desktop, refreshing the page or opening it again lands on the scrolled-down view. That's handy but for
showcasing it lowers the effect."
- Reproduced: glide to content on `/`, reload → `scrollY` 696 (Chrome's native scroll restoration).
- Fix: on `/` set `history.scrollRestoration = "manual"` and start at `scrollY = 0` (hill view, glide state
  reset: hero visible, taskbar shown, pane hidden) on load, reload, client navigation to `/`, and
  back/forward to `/`. Restore `"auto"` when leaving `/` so other pages keep normal browser behaviour.
- Must not cause a visible flash of the content view before jumping to the top (set it before paint
  where possible, e.g. in the landing effect with `useLayoutEffect`, or an inline script guarded to `/`).
- Hash links (`/#main` from the skip link) still work.

## 4. Contact copy (owner decision)
In `contact/page.tsx`, replace the line "i watch movies and listen to music too" with:
"Off the clock: logging movies on Letterboxd and looping way too much on Spotify."
- Link "logging movies on Letterboxd" → `SOCIAL_LINKS.letterboxd`, "Spotify" → `SOCIAL_LINKS.spotify`
  (both `target="_blank" rel="noopener noreferrer"`). No emojis. Everything else in the window unchanged.

## Acceptance
- [x] Contact shows the new "Off the clock…" line with both links; no emojis
- [x] hi.exe note: no background chip in light or dark; readable
- [x] /cv toolbar starts with Home (same style, separator); desktop icons + text; 375px icon + short label,
      no horizontal scroll; bottom Home still there
- [x] Mobile `/` Home: restores windows if needed, scrolls to the top with the hill visible; desktop unchanged
- [x] `/` always opens at the hill view: reload after gliding, new visit, client nav from a sub-page, back
      button; no flash; other pages keep native scroll restoration
- [x] lint, typecheck, test, build pass; no console warnings; `/anita` unchanged

## Decisions log
- Non-glide Home focuses the landing header with preventScroll, then scrolls to the top. The desktop content glide is unchanged.
- Set manual scroll restoration in the pre-paint script for direct landing visits and reset position in a landing layout effect. Leave hash targets alone and restore auto on unmount. A persisted pageshow also resets the landing desktop.
- The chip-free note uses 80% white in day mode and 70% at night. The mobile CV toolbar stacks icons above 11px labels.
- Chrome verified zero scroll offset in the first sampled reload frames, native CV Back restoration, direct and skip-link hash visits, mobile scenery restore, and desktop/mobile toolbar labels. All 18 tests passed; both Anita screenshots matched.
