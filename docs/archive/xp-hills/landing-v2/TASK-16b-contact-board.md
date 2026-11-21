# Task 16b: Contact lives on the card table

**Branch:** `landing-v2`, on top of uncommitted Tasks 12–16. Leave changes uncommitted. Do this **before
Task 17**.
**Read first:** `TASK-16-subpages.md` §0 and its Decisions log, `SPEC.md` §6 Contact.
After the task: `bun run lint && bun run typecheck && bun run test && bun run build`. Update `SPEC.md` §6.

Owner (after Task 16): "I wanted just the top row, where you put the cards, with a picture in between that
you can click and it shows a little animation. The rest of the cards we don't need. I want 'Let's link up'
to be *on* the board of the game instead of under it. And the status sitting there is just weird."

Owner follow-up: "No, the status should not be here at all." / "The green can be the same for dark and light."
Owner's reference (a classic FreeCell window): a flat green table whose top row is eight empty card slots
drawn as thin bright-green outlines, four on the left and four on the right, with a small picture in the
middle between them. Decision (2026-11-21): use that **top-row layout** and put a **mini pixel Sina** in the
middle instead of a king. No king card.

**Ownership rule (unchanged):** original art only. Don't reproduce Microsoft's king icon, card faces or its
"looks toward the mouse" behaviour. The layout (slots + a centre emblem) is generic; the emblem is ours.

## 1. Board = the whole window body
- The green felt fills the entire `klondike.exe` window body; there's no beige panel anymore. **One felt
  colour for both themes** (drop the separate night felt); cards and text stay the same in day and night. Keep the
  decorative "Deal · Options · Help" menu row above it.
- **Felt:** flat classic card-table green (no dither texture needed), one colour for both themes.
- **Top row only, no cards:** eight empty slots as thin bright-green outlines (1px, slightly lighter than
  the felt), four left and four right, card-sized (~2:3). **Remove the tableau columns, the stock/waste
  cards and the foundations' cards.** Simplify `utils/cardTable.ts` to the slot geometry (pure, tested) or
  replace it with CSS if that's simpler; record the choice.
- **Centre of the top row: mini pixel Sina** (original pixel art in the memoji's look: dark hair, round
  glasses, peeking over a grey laptop; ~40px on desktop, ~32px on mobile) on a small framed square, like
  the reference's centre picture.
  - Click/tap (and Enter/Space): a short stepped animation (~600ms, `steps()`): he pops up 2px, waves
    (2–3 frames), and a tiny speech bubble says one of a few lines in rotation ("hi!", "say hi →",
    "your move", "email me"). Clicking again mid-animation restarts cleanly. He doesn't track the pointer.
  - It's a `<button>` with `aria-label="Say hi"`; the bubble text is `aria-live="polite"`. Reduced motion:
    no movement, just show the bubble for ~2s.
  - At 375px the row must fit without scrolling: shrink slots (~30px wide) and keep the 4 + emblem + 4
    layout; below ~360px show 3 + emblem + 3.
- **Contact content sits on the felt** below the top row, centred: "Let's link up!", the two copy lines,
  "Contact me", the four social icons, the "Off the clock…" line, "View availability" and the Home/Blog
  buttons. Copy unchanged.
  - Text on felt: cream/white (`#fffbe8`-ish) with a 1px dark text-shadow; links (letterboxd, spotify) in
    a light yellow with underline; social icon labels light. Check **AA contrast** on the felt and record
    the ratios.
  - XP buttons keep their Luna look (they read fine on green).

## 2. No status on Contact
- Remove the "Status: …" line entirely (it wasn't on Contact before Task 16). No status bar either. The
  status stays where it belongs: About me on the landing.

## 3. Keep
- The availability window still opens below the Contact window on "View availability".
- Taskbar button, minimize/close behaviour, title `klondike.exe`, desktop/mobile layouts with no horizontal
  scroll.

## Acceptance
- [x] Contact window body is all felt: menu row, top row (8 empty outlined slots + mini Sina), then the copy
      and actions on the felt; no tableau columns, no beige panel
- [x] Mini Sina click/tap/Enter plays the pop + wave + bubble; reduced motion shows the bubble only
- [x] No status anywhere on Contact; one felt colour in both themes
- [x] AA contrast on the felt (ratios in the log); 375px fits without horizontal scroll
- [x] lint/typecheck/test/build pass

## Decisions log

- CSS grid draws empty slots directly; removed the superseded tableau generator and its two tests. Slot geometry was verified in Chrome: eight at 360px and 375px (30.25 × 45.38px at 375px), six at 320px, no horizontal overflow.
- Felt #12603b is identical in both themes. Cream #fffbe8 text and shortcut labels measure 7.32:1; underlined yellow #ffe995 links measure 6.28:1. Decorative outlines #65b97e measure 3.18:1.
- Playwright verified click, tap, Enter and Space, sprite restart without losing focus, greeting rotation, and the two-second reduced-motion bubble without animation. Availability disclosure and taskbar restoration still work. Verified at 320, 360, 375 and 1440px.
- Lint (two existing Anita warnings), typecheck, all 37 tests and production build passed. Both /anita screenshots matched their baselines.
