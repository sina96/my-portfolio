# Task 17: Stepped day/night transition on theme switch

**Branch:** `landing-v2`, on top of uncommitted Tasks 12–16b. Leave changes uncommitted.
**Read first:** `LANDING-V2.md`, Decisions logs of Tasks 12–15, `SPEC.md` §1–2, `src/lib/theme.ts`.
After the task: `bun run lint && bun run typecheck && bun run test && bun run build`. Update `SPEC.md` §1–2.

Owner: "in the easter egg we should also be able to change dark mode to light mode." (done in Task 14) —
this task turns the switch into a moment.

## 0. Follow-up from Task 16b (owner, 2026-11-21): cards in the slots, bigger mini Sina on phones
Owner: "it turned out really cute … maybe add some cards to the card slots, right now people might not
understand they're for solitaire." / "on mobile make it three to the sides and prioritize the pixel picture
to be bigger."
- **Cards in some slots** (original pixel card faces, static, `aria-hidden`): cream face, 1px dark outline,
  pixel-rounded corners, rank + suit in the top-left corner (mirrored bottom-right) and one large centre
  pip; red hearts/diamonds, near-black spades/clubs. Draw them as a small pure helper (SVG or CSS), no
  external images.
  - Desktop (4 + Sina + 4): left slots `7♣`, `Q♦`, empty, empty. Right slots `A♥`, `3♠` (with 2 thin card
    edges peeking under it, so it reads as a built pile), `2♦` (1 edge), empty.
  - The outlined empty slots stay as they are.
- **Phones (<760px): 3 + Sina + 3**, and Sina gets the room: mini Sina ~56px (from ~32px), slots shrink to
  fit at 375px and 360px without horizontal scroll. Left `7♣`, `Q♦`, empty; right `A♥`, `3♠` (pile), empty.
  Below ~330px fall back to 2 + Sina + 2.
- Make sure the speech bubble doesn't cover "Let's link up!" (give the row enough bottom space or place the
  bubble beside Sina on phones).
- Desktop Sina size unchanged unless it looks too small next to the cards; record any change.

## Behaviour
- When the user toggles the theme on `/` (tray button or pane switch), the wallpaper plays a ~1.5s
  **stepped** transition (8–10 steps, `steps()` / discrete frames):
  - **Day → night**: sun sinks behind the front ridge, sky steps through dusk colours (orange/pink →
    violet → navy), stars blink in a few at a time, moon rises to its spot.
  - **Night → day**: the reverse (moon sets, dawn colours, stars blink out, sun rises).
- Window chrome and tokens switch at the midpoint (when the sky is darkest/brightest change), so the UI
  doesn't flash before the scene.
- Works in the landing hill view, content view (behind the veil) and scenery mode. Sub-pages and the
  initial page load never animate (pre-paint script still sets the theme with no transition).
- Reduced motion: instant switch (today's behaviour). Toggling again mid-transition jumps to the new
  target cleanly. Resizing during it doesn't restart it.

## Implementation notes (suggestions; record what you choose)
- Keep both palettes' scenes cached (`HillScene` already caches per palette). Crossfade in discrete opacity
  steps between them while a small sun/moon sprite (new pure generator in `hillScene.ts`, seeded, tested)
  moves along a stepped arc behind the ridge mask.
- A sky tint overlay (dusk/dawn colour stops) between the sky and the hills, stepped.
- `theme.ts`: expose a way to request "switch with transition" so the scene can delay the `data-theme`
  flip to the midpoint; storage writes stay immediate and wrapped in try/catch.
- Sun is a new art element: also show it in the day scene at rest (top-left, small) only if it looks
  right; otherwise only during the transition. Note the choice.

## Acceptance
- [x] Contact: cards in some slots (desktop 4+4, phones 3+3 with a ~56px mini Sina), bubble clear of the heading, no overflow at 360/375
- [x] Toggle on `/` (hill view, content view, scenery) plays the stepped dusk/dawn sequence, ~1.5s
- [x] UI tokens flip at the midpoint; no flash; double-toggle is clean
- [x] Reduced motion and first load: instant; sub-pages: instant
- [x] New generator tests pass; lint/typecheck/test/build pass

## Decisions log

- The landing caches both encoded palettes per active grid. Ten reversible render frames blend the palettes and veil, tint only the sky, and move the moon and seeded sun along pixel-snapped arcs clipped by the ridges. The sun is transition-only. Stars appear/disappear in batches; the animation clock is independent of grid resize.
- The theme store persists the target immediately, changes tokens 750ms after the request, and settles at 1500ms. A second click cancels both timers and applies the next target. Direct loads, sub-pages, and reduced motion remain immediate.
- Playwright/Chrome at 375×812 and 1440×900 observed all ten frames on the hill, in content, and in scenery; the latter did not replay its reveal. Click-to-observed midpoint was 777–800ms and finish 1530–1553ms including input overhead. Also checked immediate double-toggle and reduced-motion paths and resize without restart.
- Contact keeps the 40px desktop mascot, increases it to 56px on phones, and uses 4/3/2 slots per side at the specified widths. Checked 320/360/375/1440px for overflow and overlap; the bubble stays above the heading.
- Lint (two existing Anita warnings), typecheck, all 39 tests and production build passed. Both /anita screenshot baselines matched.
