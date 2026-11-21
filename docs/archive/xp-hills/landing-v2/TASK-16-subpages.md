# Task 16: Contact icons and playful sub-page buttons

**Branch:** `landing-v2`, on top of uncommitted Tasks 12–15. Leave changes uncommitted.
**Read first:** `LANDING-V2.md`, Task 13 (`DesktopIcon`), `SPEC.md` §6.
After the task: `bun run lint && bun run typecheck && bun run test && bun run build`. Update `SPEC.md` §3/§6.

Owner: "we don't need icons in the hero … maybe we can change the contact page to have some more icons." /
"make the buttons more fun."

Sub-pages keep Task 16a's reading-friendly taskbar and the existing header-mode wallpaper.

## 0. Contact: a card-table board replaces the pixel desk (owner idea, 2026-11-21)
Owner: "make that window like a retro Windows XP games window … a solitaire board … you don't need to make
it playable. It could be just the board itself, and underneath the things that make it contactable. We don't
need the pixel desk anymore, but don't delete it, comment it out."

**Ownership rule:** an *original* Klondike-style card table. Don't reproduce Microsoft Solitaire's art,
card backs, fonts, name or win animation. Draw our own.

- **Layout (all widths):** the board sits at the top of the Contact window, full window width. Underneath
  are the contact copy, "Contact me", the social icons (§1), the "Off the clock…" line, "View availability"
  and the nav row. The ≥760px "copy left / art right" split goes away for Contact.
- **Board** (new pure generator `utils/cardTable.ts` → SVG, like `pixelDesk.ts`; deterministic, unit-tested,
  `aria-hidden`, `shape-rendering="crispEdges"`):
  - Dithered green felt (own shade; night palette darker and bluer).
  - A frozen mid-game: stock (face-down) + waste (one face-up) top-left, four foundations top-right partly
    built (e.g. A–3 of one suit, A of another, two empty slots), seven tableau columns with face-down
    stacks and a few face-up cascades.
  - Cards: white faces with pixel rank and suit glyphs (red/black), 1px dark outline, rounded corners in
    pixels. **Card back = our own design:** XP-blue with a tiny pixel hill motif from the hill scene, so it
    reads as "this site's deck".
  - One personal touch: the top waste card is a custom "S" card (rank "S", a small pixel heart) as a wink.
  - Size: ~640px wide on desktop. At 375px the seven columns must still fit inside the window without
    horizontal scroll (cards ~38–40px wide); scale the SVG, don't crop it.
  - Motion: none required. Optional: a 1px stepped lift on the waste card on hover (desktop only), off under
    reduced motion.
- **Window chrome:** title `klondike.exe` (generic, not a product name). Decorative menu row "Deal ·
  Options · Help" (non-interactive, like the CV's decorative menus). A status bar under the board:
  "Status: {SITE_STATUS.label}" with the status dot, reusing `SITE_STATUS`.
- **Pixel desk:** remove it from the Contact render only. **Keep** `PixelDesk.tsx`, `utils/pixelDesk.ts`,
  `pixelDesk.css` and its tests. Leave a one-line comment at the old render site
  (`{/* Pixel desk parked; see TASK-16 §0. */}`) and note "parked" in SPEC §6. Its tests must still pass.
- Update SPEC §6 Contact and the AGENTS.md project map (`cardTable.ts`).

## 1. Contact: social icons
- Replace the LinkedIn / GitHub / Instagram text links with a row of `DesktopIcon`s: Email
  (`CONTACT_URL`), LinkedIn, GitHub, Instagram (external ones open in a new tab with
  `rel="noopener noreferrer"`). Keep "Contact me" as the main action button and the "Off the clock…" line
  with its Letterboxd/Spotify links unchanged.
- Icons: original simple pixel glyphs (16×16 grid, crispEdges). Brand marks may be suggested by shape and
  colour (e.g. "in" on blue, a cat-ish silhouette for GitHub, a camera for Instagram) but drawn as pixel
  art, not embedded official logos. Labels under icons. On the window body (not glass), so use the
  window-body variant: label in `--ink`, selection highlight as on the desktop.
- Layout: under the copy, below the card table (§0); centred on mobile. Fit 375px
  in one or two rows without horizontal scroll.

## 2. Playful sub-page navigation buttons
- The centred button rows on sub-pages (blog post "← All posts · Home", `/availability` "← Contact · Home",
  Contact "Home · Blog", CV bottom Home, 404) become compact icon buttons: a small 16px pixel icon +
  label in an XP Luna button (rounded, beige gradient, blue hover glow, 1px press). Reuse the icon set
  (Home = house, Blog = notepad, Contact = envelope, back = left arrow).
- Keep them `<Link>`s, keyboard parity, visible focus, ≥44px tall on mobile.
- The CV WordPad toolbar keeps its own toolbar style (Task 10); don't restyle it.
- Print: buttons stay hidden on the CV print (existing rule).

## Acceptance
- [x] /contact: original card-table board on top (day/night), copy and actions underneath, fits 375px
      without horizontal scroll; pixel desk not rendered but its code and tests remain
- [x] /contact: icon row (Email, LinkedIn, GitHub, Instagram) at 1440 and 375, day/night, readable
- [x] Sub-page nav rows use the new icon buttons everywhere listed; no layout shift or overflow at 375
- [x] External links open in a new tab with the right `rel`; lint/typecheck/test/build pass

## Decisions log

- Contact uses original, static pixel art: 320×160 SVG coordinates, 38-unit cards, two felt palettes, one seeded texture and a signature S of hearts. Cards render about 40px wide at 375px. The pixel desk is parked, not deleted.
- Social shortcuts are one row on desktop and a centred 2×2 grid on mobile. Email uses the mail handler; external profiles open in a new tab. Landing hero shortcuts and the WordPad toolbar remain unchanged.
- Playwright verified the board, contact links, availability disclosure and navigation at 375px and 1440px in both themes, including 44px mobile nav targets, keyboard activation, no horizontal overflow, taskbar regression checks, and paper-only CV print. Both /anita screenshots matched.
- Lint (two existing Anita warnings), typecheck, all 39 tests and the production build passed.
