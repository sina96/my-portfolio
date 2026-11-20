# Task 4: Landing content view, task pane, contact and mobile hint (XP Hills rev 4)

**Branch:** `redesign-xp-hills`, on top of the uncommitted Task 1–3 work (do not reset or discard it).
**Read first:** [`SPEC.md`](./SPEC-revisions.md) §9 "Rev 4 changes" (source of truth), [`TASK-3.md`](./TASK-3.md)
Decisions log, `AGENTS.md`. Task 3 was verified on 2026-11-20 (all acceptance items pass).
Leave changes uncommitted. After the task: `bun run lint && bun run typecheck && bun run test && bun run build`.

## 1. About me at the very top after the glide
Owner: "the about me is not fully top". Today the glide ends at scrollY ≈ 522 (1440×900) with About me
at ~162px and a strip of hill above it.
- Change the content-view target so About me's title bar sits ~12px from the viewport top, aligned with
  the task pane's top. The hill is out of view in the content view.
- Recompute the glide target, the settle-to-nearest threshold, and the nav swap point from the new
  target (no hard-coded px; derive from layout, update on resize).
- Glide up from the content top still returns to scrollY 0. Momentum lock and mid-band settle unchanged.
- Sub-pages keep the 18vh overlap (unchanged).

## 2. Task pane groups and the Luna switch (SPEC §9)
Owner: "'Details' is weird, only small text there. 'Other' is a bad title. Can't we have a Windows XP style switch?"
- Groups: **Places** (unchanged), **Appearance** (night-mode pill switch), **Closed windows** (only
  rendered when a content window is closed/minimized; never lists `hi.exe`).
- Remove "Other" and "Details". Render `© {year} Sina Bastani` as small muted text under the last group.
- Pill switch: Luna look (glossy blue track when on, beige/white thumb, ☀ and ☾ at the ends), label
  "Night mode", `role="switch"`, `aria-checked`, Space/Enter toggle, visible focus ring, works in both
  themes, no flicker on load (state from the theme store; render neutral until known, or CSS-driven).
- Same structure in the mobile drawer.

## 3. Centred button rows
Owner: "posts and blogs are better. Maybe we can have the buttons there centred."
- Centre the bottom button rows in all windows: `/blog` (Home), posts (← All posts · Home), `/cv`,
  `/contact`, `/availability`, 404, and landing ("View CV", "All posts").

## 4. Contact page
Owner: "the content in /contact is not centred. The availability window was shown previously by a button press, now it is always there."
- Centre the Contact window's content (heading, intro, Contact me, socials, sentence, buttons).
- Availability hidden by default; a "View availability" XP button in the Contact window toggles it
  ("Hide availability" when open), with `aria-expanded`/`aria-controls`. When opened, render the
  Availability window below, scroll it into view (respect reduced motion) and move focus to its heading.
  Fetch availability only when it's first opened.
- `/availability` page unchanged (calendar shown directly).

## 5. Mobile nav hint
Owner: "in mobile mode we might need a hint on where the nav is found. One-time balloon, but only after a
while when the user has not clicked on it at all; after the first click it's obvious."
- Yellow XP balloon above the drawer launcher: "your menu lives here", with ✕, `role="status"`.
- Show only if: viewport < 760px, the launcher has been visible (content view) for ~6s, it has **never**
  been tapped (localStorage `xp-menu-hint-seen` set on first launcher tap or after the balloon shows once),
  and the drawer isn't open. Auto-hide after ~8s or when the launcher is tapped.
- Reuse the tray balloon component/styles where possible. No pop animation under reduced motion.

## Acceptance

Verified on the local production build in Chrome; `/anita` matched desktop and mobile baseline screenshots. Lint still reports two pre-existing `/anita` image warnings.
- [x] Desktop 1440×900, 1920×1080, 1024×768: one wheel tick glides to About me title bar ~12px from the top; hill not visible; pane top aligned; glide back up returns to 0; momentum and mid-band settle still correct
- [x] Pane: Places / Appearance / (Closed windows only when needed) + © text; no "Other"/"Details"; switch works by mouse and keyboard, announces as a switch, correct in both themes, no flicker on reload
- [x] All bottom button rows centred (landing, /blog, posts, /cv, /contact, /availability, 404)
- [x] /contact: content centred; availability hidden until "View availability"; toggling works, focus moves, API fetched on first open only
- [x] Mobile 375×812: balloon appears once ~6s after the launcher appears if untapped; never after the launcher has been tapped; never again after shown once
- [x] No console warnings/hydration errors; reduced motion respected; lint, typecheck, test, build pass; `/anita` unchanged
- [x] SPEC/AGENTS updated if behaviour differs from SPEC §9

## Next (not this task)
CV page redesign: to be specified after this task is verified.

## Decisions log
- The desktop glide and nav observer share a sentinel tied to the CSS overlap and top gap; the scene exits during the latter part of the glide. Resize preserves the content stop when already parked there.
- Contact mounts the calendar only on first reveal and retains it while hidden to avoid re-fetching on reopen. The standalone calendar is unchanged.
- The hero and mobile hints share markup and styles, with independent storage keys.
