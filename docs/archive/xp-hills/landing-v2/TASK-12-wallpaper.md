# Task 12: Full-screen wallpaper and scroll transition

**Branch:** `landing-v2` from up-to-date `main`. Leave changes uncommitted (the owner commits).
**Read first:** `LANDING-V2.md` (why and decisions), `SPEC.md` §2–3, `AGENTS.md` (invariants).
After the task: `bun run lint && bun run typecheck && bun run test && bun run build`. Update `SPEC.md` §2
and the AGENTS.md landing invariants ("Mobile and reduced motion are static" no longer holds).

Owner: "the hills should be the whole page again, with the transparent card, then you scroll down and the
hills go… I really want people to see that transition on mobile as well." / "keep it as a wallpaper even
when we go down, but make sure it's not too much for the user."

## 1. The landing scene becomes a fixed wallpaper (mobile + desktop)
- On `/`, `HillScene` (`mode="intro"`) renders its scene in a `position: fixed; inset: 0` layer behind
  all landing content, for the whole page (not only the first screen). Sub-pages (`mode="header"`) are
  unchanged: static faded 42vh header.
- First screen: the hill section is `100svh` tall on mobile and `100vh` on desktop, hero centred in it.
- Draw the landing scene on a **viewport-sized grid** (the approach scenery mode already uses:
  `ResizeObserver` → grid, `generateHillScene(palette, 1987, grid)`) so portrait phones get a composed
  scene instead of a cropped 1600×1000 one. Task 15 tunes the composition and pixel size; here just use
  the grid path.
- **Address bar gotcha:** size the fixed layer with `100lvh` (fallback `100vh`) and do **not** regenerate
  the scene when only the height changes by less than ~25% (mobile URL bar show/hide). Regenerate on
  width changes, orientation change and theme change only. Never regenerate during scroll.
- On `/` remove the flat page background behind `main`; the wallpaper shows in the gaps between windows.
  Window bodies stay opaque (the hero glass is the only see-through window).

## 2. Scroll transition
Progress `p = clamp(scrollY / T)` where `T ≈ 0.5 × viewport height` (the transition completes within
about half a screen). Drive CSS custom properties from one rAF-throttled passive scroll listener (reuse
the structure in `HillScene.tsx`'s intro effect; replace its "hill shrinks and scrolls away" maths).
- **Parallax depth** (the "bit of life"): land moves up `p × ~6%` of the viewport height; clouds `~0.6×`
  that; moon and stars `~0.3×`. Quantize every offset to whole scene cells so motion snaps to the pixel
  grid (no sub-pixel smearing). `transform` only.
- **Hero**: opacity `1 → 0` and lift `0 → -60px` across `p ∈ [0, .6]`; keep the existing "visible when
  it holds focus" rule (`.hill-hero:has(:focus-visible)`).
- **Dim veil**: a flat layer above the scene, below windows, opacity `0 → ~.6` across `p ∈ [.3, 1]`,
  colour from a new token `--wallpaper-dim` (day: a pale XP-blue like `--page`; night: deep navy).
  No blur. Check AA contrast of any text that sits directly on the wallpaper (e.g. empty-state copy,
  the © line) at full dim in both themes.
- **Content** fades in as today (`--landing-content-opacity`).

## 3. Resting states
- **Desktop (≥760px, motion allowed):** keep `useLandingGlide` exactly as it behaves now (two resting
  states, glide ~600ms). Only the visuals change: the scene stays fixed and dims instead of scrolling
  away. Its content stop must still put Latest posts / the first content window at the top.
- **Mobile (<760px, motion allowed): light snap.** Native scroll, no wheel/touch hijacking. When scrolling
  settles (`scrollend`, with a ~140ms debounce fallback for browsers without it) and no touch is active
  and `0 < scrollY < T`, smooth-scroll to whichever of `0` / `T` is nearer (bias toward the direction of
  the last movement). Never snap when `scrollY ≥ T`. A fling past `T` is left alone.
- `/` without a hash still opens at the top (keep the manual scroll restoration logic).

## 4. Pause at rest
- When `p = 1` (content view) set `data-wallpaper="rest"` on the scene and pause all scene animations
  (`animation-play-state: paused` on drift, twinkle, blink, fireflies). Resume when `p < 1`.
- In scenery mode (Task 14) the scene is never paused.

## 5. Reduced motion
- No parallax, no hero lift, no snap, no glide (as today). The wallpaper is fixed and static; the dim veil
  switches on without animation once `scrollY > T/2`. Ambient animations stay off (existing rule).

## 6. Performance
- Only `transform` and `opacity` change during scroll; one fixed layer; `will-change` on the moving
  layers only while `0 < p < 1`.
- Check in Chrome DevTools with 4× CPU throttling at 375×812: no long frames from the scroll handler;
  record the result in the Decisions log.

## Acceptance
- [x] 375×812 and 390×844, day and night: the first screen is entirely hills + hero, no About/posts visible
- [x] Scrolling on mobile: hills drift with depth, hero lifts/fades, veil settles; windows scroll over the
      fixed wallpaper; no flat blue background anywhere on `/`
- [x] Releasing mid-transition on mobile snaps to hills or content; scrolling through posts never snaps
- [x] Desktop 1440×900: glide unchanged, scene stays fixed and dims instead of leaving
- [x] Scene animations pause in the content view and resume when scrolling back up
- [x] Mobile URL bar show/hide doesn't regenerate or jump the scene (test in an emulated mobile with a
      resize of the height only)
- [x] Reduced motion: static wallpaper, readable content, no snapping
- [x] Sub-pages unchanged; `/anita` unchanged; lint/typecheck/test/build pass

## Decisions log
- Desktop glide and the existing About me-first ordering are unchanged. The mobile snap ends at half-screen; the first full-height hero section remains in normal flow, so the first window enters from below rather than jumping to the top.
- The SVG keeps its accepted grid aspect ratio on small height-only resizes. A repeated bottom raster row covers both parallax and the height change without stretching the art. Tested 375×812 → 375×745 in Chrome mobile emulation: same raster and same rendered grid height. Actual browser address-bar motion was not tested on hardware.
- Chrome trace at 375×812 with 4× CPU throttling: 32 scroll dispatches (max 1.8 ms) and 32 animation-frame callbacks (max 0.9 ms); no long frames in either set. Verified actual emulated touch drag holds without snapping, release settles, and going past the band is left alone.
- The copyright already has an opaque backing (pane: #e3eaff on #263d78, about 8.6:1 in both themes; Start menu has its window background). Empty-post copy sits inside an opaque window, not directly on the wallpaper.
- Verified both themes at 375×812 and 390×844, 1440×900 desktop glide in both directions, and reduced motion. Blog retains its 42vh header; /anita matched both baseline screenshots. Lint (two existing Anita warnings), typecheck, 30 tests and production build passed.
