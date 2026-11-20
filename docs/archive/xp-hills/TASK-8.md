# Task 8: Scenery mode on mobile + resize (post-review of Task 7)

**Branch:** `redesign-xp-hills`, on top of the uncommitted Task 1–7 work. Leave changes uncommitted.
**Read first:** `SPEC.md` §10, `TASK-5.md` and `TASK-7.md` Decisions logs. Task 7 was verified on 2026-11-20.
After the task: `bun run lint && bun run typecheck && bun run test && bun run build`.

Owner: "the hills easter egg in mobile form in dark mode does not seem responsive to the page and we
don't see the moon… and resizing between desktop and mobile in hills-only mode causes a weird zooming-in
transition all the time."

## 1. Scene doesn't adapt to portrait; moon is cropped out (bug)
Reproduced at 375×812, dark, scenery mode (landing and `/blog`): only stars, one cloud and a giant hill
slope are visible; no moon.
- Cause: `HillScene.tsx` renders one `viewBox="0 0 1600 1000"` SVG with `preserveAspectRatio="xMidYMid slice"`.
  In a tall portrait viewport, slice scales by height, so only the middle ~460 of 1600 viewBox units
  are visible. The moon is drawn into a full-scene raster at grid x=152 (`utils/hillScene.ts:144`,
  viewBox x≈1216), which falls outside the crop. The hill pixels also become very coarse (each
  8-unit cell ≈ 6.5 screen px), and the composition reads as "zoomed in" rather than as a landscape.
- Fix (pick what works; record the decision):
  - Moon (and ideally its glow) must be visible in every viewport aspect and size, sitting in the
    upper sky on the right side, never behind a window/caption. Preferred: draw the moon as its own
    small layer positioned relative to the **visible** area (e.g. a separate absolutely positioned
    pixel-art element at ~right 18%, top 10–12% of `.hill-scene`), not baked into the 1600×1000 raster.
  - Portrait composition: the scene should read as "hills under a sky" on a phone too. Either
    anchor the crop so the more interesting part shows (e.g. `xMaxYMax slice` for portrait), and/or
    generate/choose a narrower portrait variant so the cell size on phones is similar to desktop
    (~4–6 CSS px per cell). Hills should occupy roughly the bottom 35–45% of the full-screen scenery
    view, sky above, at 375×812, 390×844 and 768×1024.
  - Applies in day mode too (sun/clouds if any element is similarly cropped); check both themes.
  - Keep output deterministic (seeded); update/extend the determinism test if the generator changes.
  - Non-scenery headers (42vh faded header, landing intro) must still look as they do now on desktop;
    on mobile they may benefit from the same portrait fix — check they don't regress.

## 2. Resizing in scenery mode replays a "zoom" animation (bug)
Reproduced on `/` in scenery mode: every time the viewport crosses the 760px breakpoint,
`xp-grow-hill` (42vh → 100vh, 600ms) starts again (2 crossings = 2 replays measured).
- Cause: `src/app/(main)/scenery.css:7–10` applies the grow animation to `.hill-header-intro .hill-scene`
  only inside `@media (width < 760px), (prefers-reduced-motion: reduce)`, so the `animation` property is
  added/removed as the media query flips and the browser restarts it. On desktop the intro scene is
  `position: fixed` with `--hill-height` from the glide, on mobile it's absolute: the layout switch
  itself also jumps.
- Fix:
  - The grow animation plays **once**, when "Show me the hills" is clicked, never again on resize,
    orientation change, or theme toggle. E.g. trigger it with a one-shot class/attribute
    (`data-scenery="entering"` → `"true"` after `animationend`/600ms) instead of tying it to a media query.
  - While in scenery mode the scene is simply `position: fixed; inset: 0; height: 100dvh` (use `dvh`,
    not `vh`, so mobile URL bars don't crop the bottom), independent of breakpoint, glide variables,
    and mask.
  - Resizing should only rescale the scene continuously, no transitions or jumps. Leaving scenery
    mode (restore) must still return to the correct desktop/mobile layout for the current width.
  - Check `/` and one sub-page: enter scenery at 1440 → resize to 375 → back to 1440 → restore,
    and the reverse; also rotate 812×375 landscape on mobile.

## Acceptance
- [x] Scenery mode, dark, at 375×812, 390×844, 768×1024, 1440×900: moon visible top-right, hills at
      the bottom, sky above; no element cut awkwardly. Day mode looks equally composed
- [x] Faded sub-page header and landing intro unchanged on desktop; no regression on mobile
- [x] Grow animation plays exactly once per "Show me the hills"; resizing across 760px and rotating
      cause no replays or jumps (count `animationstart` events in a quick script)
- [x] Scene fills the visible viewport on mobile (`dvh`), caption and restore button stay visible
- [x] Restore after resizing returns the correct layout for the current width
- [x] Reduced motion: no animation at all; deterministic test passes
- [x] lint, typecheck, test, build pass; no console warnings; `/anita` unchanged

## Decisions log
- Scenery uses a viewport-sized grid of approximately 5px square cells, with the hill crest around 57% down. The normal intro and headers keep their reference grid and original moon coordinates.
- Scenery uses a separate moon-and-glow layer anchored to the upper-right of the visible sky. Captions and restore controls have separate vertical spacing.
- Both routes reveal the fixed `100dvh` scene with a one-shot stepped clip animation; resize and theme changes do not re-arm it. Chrome counted one start per entry, zero with reduced motion.
- All 16 tests and the build passed. The two existing `/anita` image lint warnings remain; desktop and mobile screenshots still match.
