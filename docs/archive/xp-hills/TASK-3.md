# Task 3: Landing feel, sub-page layout and polish (XP Hills rev 3)

**Branch:** `redesign-xp-hills`, on top of the uncommitted Task 1 + Task 2 work (do not reset or discard it).
**Read first:** [`SPEC.md`](./SPEC-revisions.md) (now rev 3; source of truth), [`TASK-2.md`](./TASK-2.md) Decisions log, `AGENTS.md`.
Task 2 was verified on 2026-11-20 (all checks green, all Part A/B acceptance items pass).
Leave changes uncommitted. After each part: `bun run lint && bun run typecheck && bun run test && bun run build`.

SPEC sections changed in rev 3: §3.1 (two-state landing glide, overlap), §4.4 (pane in the margin,
viewport-centred column), §4.5 (subtle caption), §5.1 (glass teaser, centred column).

## Part A: Owner design feedback

### A1. `hi.exe` becomes a compact glass teaser (SPEC §5.1)
Owner: "too big, too bold; it should be a teaser/intro, transparent like the original sketch".
- ~320px wide; XP Luna title bar kept; body is frosted glass (sketch `.card`: `rgba(255,255,255,.16)`,
  `backdrop-filter: blur(6px)` + `-webkit-` prefix, `rgba(255,255,255,.55)` border, hard-offset shadow).
  Night tint slightly darker. Fallback when `backdrop-filter` is unsupported (`@supports not (...)`).
- Memoji ~72px, "hi! 👋" ~28px regular weight, hint ~13px, white text with soft shadow.
- Minimize/close/maximize behaviour unchanged.

### A2. Subtle "enjoy the scenery" caption (SPEC §4.5)
Owner: "too bold, should be more subtle".
- ~15–16px, regular Verdana, white ~85% opacity, soft text-shadow, low-centre above the ▼ SCROLL hint.

### A3. Two-state landing with a glide (SPEC §3.1)
Owner: "two main things: the hill view, then scroll down to the view with everything in place;
the thing in between I don't like".
- Resting states: **hill view** (top) and **content view** (hill in header end state, windows overlapping it).
- From the hill view, any downward intent (wheel/trackpad, swipe, ▼ SCROLL click, PageDown/Space/
  ArrowDown/End) glides (~600ms ease-in-out, one rAF-driven `scrollTo` animation) to the content view.
  From the top of the content view, upward intent glides back. Inside the content, normal scrolling.
- Never rest in between: if the page ends up mid-band (restored scroll, scrollbar drag, anchor), settle
  to the nearest state after ~150ms of no scrolling.
- Trackpad momentum must not trigger a second glide or fight the animation (lock input during the glide
  and for ~250ms after; swallow residual wheel events in that window).
- Non-passive wheel/touch/key listeners only while in the hill band; keyboard users can still Tab into
  the content (focusing an element below triggers the glide or lands correctly, never a stuck half state).
- Reduced motion: no glide, no shrink (static header mode, as today).
- Mobile < 760px: keep today's static header behaviour (no glide), unless it is trivial to support swipe
  well; record the decision.
- Nav: the taskbar ↔ task pane swap on landing happens when arriving at the content view (as today
  at the end of the shrink).

### A4. Sub-pages: windows overlap the hill, start higher (SPEC §3.1 header mode)
Owner: "the blog itself is not centred and should be higher up in the page".
- In `header` mode the first window starts ~18vh from the top, overlapping the faded hill (opaque windows).
  Mobile ~22vh; tune so a post title is visible on 375×812 without scrolling.
- Applies to `/blog`, posts, `/contact`, `/cv`, `/availability`, 404, and the landing content view.

### A5. Content column centred in the viewport (SPEC §4.4)
Found in review: the reserved pane gutter pushes every window ~100px right of centre under the
symmetric hill.
- Centre the column in the viewport in both nav states; the pane lives in the left margin.
- When there is not enough room (roughly < 1240px), shift the column right only as much as needed to
  clear the pane; never overlap. No layout jump when the nav swaps.

### A6. No navigation bars on sub-pages (SPEC §4.0a)
Owner: "we don't show navigation bars in blog pages; we have the buttons to go back to the main page etc."
Applies to **all** sub-pages: `/blog`, `/blog/[slug]`, `/cv`, `/contact`, `/availability`, 404.
- Remove the taskbar, task pane, mobile drawer/launcher and the nav-swap sentinel from these pages.
  They stay on `/` only (render `DesktopNavigation` from the landing page, or gate it on the route;
  keep the window manager and "closed them all" card on every page).
- Add the in-window button rows from the SPEC §4.0a table (Home, ← All posts, etc.) as XP buttons
  at the bottom of each page's main window. **No theme toggle on sub-pages** (theme is set on the landing
  page or follows the OS, and persists).
- Remove the taskbar-height bottom padding on sub-pages. Skip link still targets `#main`.
- A5 (centring) on sub-pages then simply means: column centred in the viewport, no pane to clear.

### A7. Task pane doesn't offer to restore `hi.exe` (SPEC §4.4)
Owner: restoring the closed hill window from the sidebar (landing, scrolled down) is not necessary.
- In `TaskPane.tsx`'s "Other" group, list restore buttons only for content windows
  (`desktopApp === false`); the hero (`HERO_ID`) is never listed, in the sidebar or the mobile drawer.
- The hero is still restored via the desktop icon (closed) or its taskbar button (minimized).

## Part B: Review polish

### B1. Mobile drawer finish
The drawer shows a full-height beige sheet behind the blue pane, and the close button is a tiny unstyled "×".
- Drawer sheet = the blue task-pane background, full height, ~280px (max 85vw), slides in from the left.
- Close button styled like an XP title-bar close button (red, 21px+, `aria-label` kept), 44px touch target.
- Backdrop: dim overlay (`::backdrop`) consistent in both themes.

### B2. Don't preload fallback web fonts
`src/app/layout.tsx` preloads 5 font files on every device, though macOS/Windows render the system
Trebuchet MS / Verdana. Set `preload: false` on the Fira Sans and PT Sans fallbacks (keep `display: "swap"`).
Decide for IBM Plex Mono after B3.

### B3. Period-correct monospace on macOS
Dates/meta/code fall back to IBM Plex Mono on Mac (no Lucida Console/Consolas).
- Stack: `"Lucida Console", Monaco, Consolas, var(--font-ibm-plex-mono), monospace`.
  With Monaco present, Plex Mono becomes a fallback too: `preload: false`.
- Check code blocks in `.blog-post-content` still look right (Monaco is wider; adjust size if needed).

### B4. Unused memoji preload warning
Chrome warns: `/_next/image?...sina-pc-memoji...&w=128 was preloaded using link preload but not used`.
- Find which `<Image>` emits the preload (likely the desktop icon or About me copy, or eager loading at
  a size not used at DPR 1). Only the teaser memoji should be eager/preloaded; others lazy.
  No warning on `/` at DPR 1 or 2.

## Acceptance

Verified in local Chrome with the production build and with the dev server for preload/LCP diagnostics. The native scrollbar-thumb gesture still needs a manual check; programmatic scrolls into both halves of the band and a mid-band reload exercised settling.
- [x] Teaser: ~320px glass card with XP title bar, hills visible through it, regular-weight text, legible in day and night
- [x] Closed state: caption small, regular weight, low-centre; desktop icon behaviour unchanged
- [x] Landing desktop: one wheel tick / swipe / ▼ click / PageDown glides hill → content; up at content top glides back; never rests half-shrunk (verified with trackpad-like rapid wheel events, mid-band scroll positions and reload)
- [x] Landing content view looks like a sub-page: faded hill header with windows overlapping it, pane visible
- [x] Sub-pages: first window at ~18vh over the hill; post title visible at 1440×900 and 375×812 without scrolling
- [x] Column centred in the viewport at 1440 and 1920 wide in both nav states; at 1024 it clears the pane; no jump on swap
- [x] Sub-pages (/blog, posts, /cv, /contact, /availability, 404): no taskbar, no sidebar, no drawer launcher; in-window Home/back buttons work; no theme toggle; saved theme still applied; no leftover bottom padding
- [x] Close or minimize `hi.exe`, scroll to content: sidebar/drawer "Other" shows no `hi.exe` restore; closing About me still shows its restore button
- [x] Mobile drawer (landing only): blue pane full height, XP close button, dim backdrop
- [x] No font preloads for fallbacks on `/` (check `<link rel="preload">`); Mac uses Trebuchet/Verdana/Monaco
- [x] No preload/LCP warnings in the console on `/`
- [x] Reduced motion: no glide, no shrink, static layout
- [x] lint, typecheck, test, build pass; no hydration warnings; `/anita` unchanged; SPEC/AGENTS updated if behaviour differs

## Decisions log
- The desktop threshold stays at the 58vh end of the shrink. A fixed overlap puts the first window at 18vh at rest; the content fades in late in the glide so the top view only shows the hill and teaser.
- Mobile and reduced motion keep the existing static, stacked landing layout so the teaser and desktop icon remain usable. Sub-pages still overlap the header at all widths.
- The sidebar uses a permanent clearance calculation; at 1440px and 1920px the landing column is viewport-centred, and at 1024px it shifts only enough to avoid the pane.
- Sub-pages reuse the XP window manager and theme store without rendering desktop navigation; a closed single-window page moves keyboard focus to Restore all.
- The 72px teaser is the only eager memoji; the icon and About me keep lazy loading. All three fallback fonts are non-preloaded, with Monaco ahead of Consolas on macOS.
