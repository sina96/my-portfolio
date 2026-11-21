# Task 18b: The sun lives in the day sky

**Branch:** `landing-v2`, on top of uncommitted Tasks 12–18. Leave changes uncommitted.
**Read first:** `TASK-17-day-night.md` (Decisions log: "The sun is transition-only"), `TASK-15-mobile-art.md`
(moon placement), `utils/hillScene.ts`, `HillScene.tsx`.
After the task: `bun run lint && bun run typecheck && bun run test && bun run build`. Update `SPEC.md` §2.

Owner: "the transition is cute but we don't have any sun in the air, and it disappears and feels weird."
Today the sun only exists during the ~1.5s switch: it appears from nowhere, sinks, and is gone; the day sky
has no sun at rest. This reverses Task 17's "transition-only" choice.

## Behaviour
- **Day scene at rest shows the sun** in the same safe box the moon uses at night (top-right, ≥ 6% from top,
  ≥ 8% from right, `clamp(56px, 16vmin, 180px)`), on the landing wallpaper, sub-page wallpaper and scenery.
  In portrait it sits above the hero card, like the moon.
- **Art:** original pixel sun from the existing seeded sun generator: warm yellow disc with a 1-cell lighter
  rim and short pixel rays. Ambient: rays alternate between two frames every ~1.2s (`steps()`), paused with
  the other ambient animations (content view / reading) and off under reduced motion. Clouds may drift in
  front of it (sun layer sits behind clouds, like the moon).
- **Sun and moon share one slot, top-right.** Owner: "make sure the sun is not so close to the sina.exe
  icon; have it on the moon side when the sun is up and vice versa." The closed-hero desktop icon
  (`#xp-hero-icon`) sits at top-left (`inset: 16px auto auto 16px`, ~80×90px). Keep a **clear zone of
  ~120×130px at top-left** on every viewport: no sun, no moon and no bright plus-stars there. Today's
  transition draws the sun at x = 10–30% (top-left, `HillScene.tsx` `twilight.sun` maths). Move it.
- **Transition (Task 17) becomes continuous:**
  - Day → night: the sun starts **at its rest position (top-right)** and sinks down and slightly further
    right behind the ridge; the moon rises from behind the ridge on the right side to that same top-right
    spot. Both arcs stay in the right half of the sky, never crossing the top-left clear zone or the hero
    card. No frame where the sun pops in.
  - Night → day: the reverse: the moon sets, the sun rises to its rest spot and stays.
  - Mid-transition double toggle still reverses cleanly from the current frame.
- First load / sub-page switches / reduced motion: instant; the correct body (sun by day, moon by night) is
  simply there.

## Tests
- Sun stays inside the safe box at 375×812, 1440×900 and 812×375; same seed → identical output.
- Every transition frame keeps the sun and moon outside the top-left clear zone (~120×130px) and in the
  right half of the sky.
- Transition frames: frame 0 sun position equals the rest position (day → night), last frame equals rest
  position (night → day).

## Acceptance
- [x] Day sky shows the sun at rest on `/`, sub-pages and scenery (375 and 1440); moon unchanged at night
- [x] Switching day ↔ night: the sun sets from / rises to its rest spot; no pop-in or vanish
- [x] Close the hero (desktop icon visible): sun/moon never near the icon at rest or during the switch
- [x] Rays animate subtly, pause while reading, off with reduced motion
- [x] lint/typecheck/test/build pass

## Decisions log

- Sun and moon use one shared resting box and the same clipped right-hand arc. On narrow portrait screens the arc heads outward early to clear the hero. The same sun element stays mounted at the transition boundary, with no opacity jump.
- The theme store reverses the current discrete frame on repeat input and clears the old timers. A full trip still takes 1.5s; a reversal only plays the frames needed to reach its destination.
- Playwright/Chrome at 375×812 and 1440×900 verified rest positions on the landing, sub-page and scenery, exact dusk/dawn endpoint alignment, reversal with the closed-hero icon visible, reading pause, and reduced-motion and sub-page instant switching. Pure tests cover both ray frames, safe zones, and transition endpoints.
- Lint (two pre-existing Anita warnings), typecheck, all 43 tests, and the production build passed. Both /anita screenshot baselines matched.
