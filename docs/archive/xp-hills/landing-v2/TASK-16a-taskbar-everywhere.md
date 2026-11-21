# Task 16a: Taskbar on every page, reading-friendly

**Branch:** `landing-v2`, on top of uncommitted Tasks 12–15. Leave changes uncommitted. Do this **before
Task 16** (Task 16 restyles the sub-page buttons and should build on this).
**Read first:** `LANDING-V2.md`, Decisions logs of Tasks 14 and 14b, `SPEC.md` §3–5.
After the task: `bun run lint && bun run typecheck && bun run test && bun run build`. Update `SPEC.md` §3–5,
`LANDING-V2.md` decision 6, and the AGENTS.md "Layout and navigation" invariants (they currently say only
`/` has a taskbar).

Owner (after testing 14b): "having the taskbar on every page is not a bad idea, for mobile … in an actual blog
post, minimizing gives you an empty window, which is weird. Maybe do it for every page, even on desktop. But
make it a little easier to use when we are actually reading. Now that we've changed the minimize and close
animations, it's a good idea to have it everywhere." This **reverses decision 6** ("taskbar on `/` only").

## 1. One taskbar for all `(main)` pages
- Render the same `Taskbar` on every `(main)` route: `/blog`, posts, `/cv`, `/contact`, `/availability`, 404.
  The **Explorer task pane stays landing-only**; the landing behaves exactly as now.
- Sub-page taskbar: Start menu (same entries), one task button per window on that page (e.g. the post's
  window, `cv.doc - WordPad`, Contact + Availability when open), tray with theme toggle and clock. Task
  button icons: reuse the icon set (Blog/notepad for posts, CV/document for WordPad, Contact/envelope).
  Long post titles truncate with an ellipsis (full title in `title` / `aria-label`).
- **Theme toggle is now available on sub-pages** via the tray. Night/day switch must not reset window state.
- Content gets bottom padding (taskbar height + safe area) so nothing ends up behind the taskbar.

## 2. One window rule everywhere
- **Minimize goes to the taskbar on every page** (the 14b ghost effect included). Remove the old
  "collapse to title bar" minimize; no page should show an empty window anymore.
- Close, the "restore closed windows ↺" link, the Desktop popup and scenery stay as 14b made them.
- **Maximize** becomes decorative on all windows (no collapsed state left to restore). Keep it visibly
  disabled-ish like the hero's (not focusable, `aria-hidden`).
- If every window on a sub-page is minimized, the page shows the wallpaper/header with no empty frames,
  and the taskbar stays visible (see §3).

## 3. Reading-friendly on sub-pages (mobile + desktop)
- On sub-pages the taskbar **auto-hides while you read**: after scrolling down more than ~80px from the top
  it slides down out of view (stepped, ~150ms); it slides back when you scroll up (≥ ~24px of upward
  movement), reach the bottom of the page, focus anything inside it (keyboard), open the Start menu, or
  when any window on the page is minimized or closed. At the top of the page it's always visible.
- While hidden it's `inert` and out of the a11y tree's tab order; Tab from the page end or Shift+Tab can
  still reach it by revealing it on focus (make sure keyboard users are never stuck without it).
- Reduced motion: show/hide instantly.
- The landing (`/`) keeps the always-visible taskbar (no auto-hide).
- Sticky mobile title bars (14b) keep `top: 0`; check they don't fight the taskbar at the bottom.

## 4. In-window navigation rows
- Keep the centred button rows inside sub-page windows (← All posts · Home, etc.). Readers expect them and
  Task 16 restyles them. The Start menu is the second way around.

## 5. Print and special pages
- CV print: taskbar hidden (confirm the existing print rule covers it), paper only.
- `/anita` is not a `(main)` page: no taskbar there, pixel-identical as before.

## Acceptance
- [x] Every `(main)` page has the taskbar with task buttons for its windows; pane only on `/`
- [x] Minimize on a blog post / CV / Contact sends the window to its task button (ghost effect); no empty windows
- [x] Sub-pages: taskbar hides while scrolling down, returns on scroll up / page end / focus / Start / when
      something is minimized; landing always visible; reduced motion instant
- [x] Theme toggle works on sub-pages; keyboard can always reach the taskbar
- [x] CV print shows only the paper; `/anita` unchanged; lint/typecheck/test/build pass

## Decisions log

- One shared taskbar component is mounted by the XP window manager, including for 404. In-window navigation remains, and only the landing has the Places pane. Closing and opening the Contact availability disclosure still works as before; its task button tracks registration.
- The reading bar is inert and slides fully offscreen when hidden. Focus bridges outside it hand off forward Tab to Start and reverse Tab to the tray. It stays visible while focused, while Start is open, in scenery, or while there are minimized or closed windows.
- Playwright/Chrome passed at 375×812 and 1440×900: taskbar and icons on every XP route, scroll direction thresholds and bottom reveal, Tab and Shift+Tab recovery, Start, minimize ghost and restoration on posts/CV/Contact, theme change with minimized state retained, and shared close/popup/scenery. Reduced motion skips the slide and the CV print view hides the bar.
- Lint (two existing Anita warnings), typecheck, all 37 tests and production build passed. Both /anita screenshots matched their baselines.
