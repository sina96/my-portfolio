# Task 15: Mobile hill art: portrait composition, stars, pixel size

**Branch:** `landing-v2`, on top of uncommitted Tasks 12–14. Leave changes uncommitted.
**Read first:** `LANDING-V2.md`, Decisions logs of Tasks 12–14, `SPEC.md` §2, `sketch.html`.
After the task: `bun run lint && bun run typecheck && bun run test && bun run build`. Update `SPEC.md` §2.

Owner: "the stars in mobile form are a bit weird, and the hills in mobile form are a bit weird."
Observed: stars are a uniform scatter of same-size dots (reads as noise); portrait squeezes the ridges into
a flat strip; one pixel size everywhere makes dithering look like a blurry gradient on phones.

All changes stay pure and seeded (`mulberry(1987)`) in `utils/hillScene.ts`.

## 1. Pixel size
- Viewport grid cell size: ~5 CSS px on desktop (as today), **~7 CSS px below 760px**
  (`cellSize = max(base, width / maxCells, height / maxCells)`); landing and scenery share the function.

## 2. Portrait composition (height > width)
- Hills occupy the bottom ~45% of the screen: crest of the front hill around 55–60% from the top.
- 3–4 layered ridges: add a far, paler ridge behind the back hill (atmospheric perspective: lower
  contrast, bluer at day / darker blue at night). Taller, more rounded peaks than the landscape curve;
  keep crest light and glints on the front hill.
- The hero card (Task 13) must sit in the sky above the front crest at 375×812, 390×844 and 360×740 with
  ≥ 16px clearance; the card may overlap the far ridge only. Verify with screenshots.
- Landscape and desktop keep today's composition (determinism tests for the default 200×125 scene may
  change only if shared code forces it; say so in the log).

## 3. Stars (night)
- Even distribution without clumps: jittered grid or Poisson-disk sampling, minimum spacing ~6 cells.
- Density by area (≈ 1 star per 700–1000 sky cells), so phones aren't busier than desktop.
- 2–3 sizes: 1-cell (most), 2-cell, and 3–5 bright plus-shaped stars (1 centre + 4 arms, arms dimmer).
- ~15–20% twinkle (existing stepped animation). No stars inside the moon's box or below the far ridge.

## 4. Moon and clouds
- Moon: one placement rule for landing and scenery: top-right inside safe margins (≥ 6% from top, ≥ 8%
  from right), size `clamp(56px, 16vmin, 180px)`. In portrait it sits above the hero card. Remove the
  separate fixed `x=1120 y=64` placement if it becomes redundant.
- Clouds: count and width scale with grid width (2–3 on phones, more on desktop); start positions spread
  so a phone never shows an empty or crowded sky at load.

## 5. Tests (`tests/hillScene.test.ts`)
- Update determinism expectations deliberately (note old → new in the log).
- Add: stars respect minimum spacing; star count scales with sky area (phone ≤ desktop density);
  moon stays inside the safe box at 375×812, 1440×900 and 812×375; in portrait the front crest is within
  the 52–62% band; same seed → identical output.

## Acceptance
- [x] 375×812, 390×844, 360×740 day/night: clear rounded ridges in the bottom ~45%, chunky pixels,
      card in the sky with clearance, moon visible and uncovered
- [x] Stars read as a sky (spacing, sizes, a few bright plus-stars), not noise
- [x] 1440×900 and 812×375 landscape still look right; scenery mode uses the same art
- [x] Tests updated + new ones pass; lint/typecheck/test/build pass

## Decisions log

- The default 200×125 scene retains its original terrain, cloud and light generation. Viewport fixtures now use actual test sizes and deliberately expect three rounded ridges in portrait, ~7px phone cells, and 3–4 phone stars versus 38 at 1440×900. Landscape terrain curves are unchanged.
- The smallest phone rounds down to three stars to stay no denser than desktop. It has one visible bright cross plus a double and a single. Seeded tests check spacing, sky density, moon exclusion and placement, and the crest band. Reduced motion keeps clouds at their distributed initial positions.
- Playwright/Chrome screenshots verified day and night at 375×812, 390×844, 360×740, 1440×900 and 812×375. The hero clears the front crest by 61px, 72px and 52px respectively on the three phones; the moon is above the hero. At 812×375 the scroll hint clears the hero by 12px. Scenery renders the same terrain raster at each tested size.
- Lint (two existing Anita warnings), typecheck, all 37 tests and production build passed. Both /anita screenshots matched their baselines.
