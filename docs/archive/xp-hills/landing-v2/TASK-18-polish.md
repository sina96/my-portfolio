# Task 18: Final polish (collect items here; run after Task 17)

**Branch:** `landing-v2`, on top of uncommitted Tasks 12–17. Leave changes uncommitted.
After the task: `bun run lint && bun run typecheck && bun run test && bun run build`.

## 1. LCP warning for the memoji (dev console)
Owner saw on `/`: "Image with src `/_next/static/media/sina-pc-memoji….png` was detected as the Largest
Contentful Paint (LCP). Please add the `loading="eager"` property if this image is above the fold."
- The hero memoji (`HomeHero.tsx`) is already `loading="eager"`. The likely candidate is the **About me**
  memoji (`page.tsx`, lazy, 100px before Task 13), which shares the same src URL. It becomes the largest
  element once the About window is in view (desktop content view, or after scrolling on mobile).
- Re-check after Tasks 13–17 (the About memoji shrinks to ~56px; the hero card is the first view on every
  viewport). Reproduce with `bun run dev` at 1440×900 and 375×812, fresh load, no interaction.
- If it still appears: confirm which element is LCP (PerformanceObserver `largest-contentful-paint`
  entry's `element`). If it's the hero memoji, make sure it's the eager one (consider Next 16's
  `preload` prop per `node_modules/next/dist/docs/` for `next/image`, rather than the deprecated
  `priority`). If it's a below-the-fold copy, leave it lazy and record why the warning is a false positive.
  Don't make below-the-fold images eager just to silence the warning.

## 2. Phone night sky is almost empty (Task 15 verification, 2026-11-21)
At 375×812 the night sky has 5 stars (360×740: 4); 1440×900 has 45. Task 15's density rule counted stars
per *grid cell*, and phone cells are bigger (~7px vs ~5px), so phones end up far sparser than desktop. The
hero card also covers much of the sky. The result reads as "a moon and nothing", not a night sky.
- Base density on **CSS-pixel sky area** so phones match the desktop look (≈ 45 stars per 1440×~520px of
  sky → roughly 10–14 at 375×812), with a floor of ~10 on phones.
- Bias placement toward the **visible sky**: above the hero card and the strips beside it (use the
  portrait layout's known card band); keep min spacing, sizes and 2–3 bright plus-stars; still none in the
  moon box or below the far ridge.
- Day, same screen: only two small clouds. Make sure phones show 2–3 clouds of readable size in the sky
  above/around the card.
- Update the Task 15 tests (phone star count range, density parity with desktop within ~±30%).

## 3. Contact social icons in one row on phones (Task 17 verification, 2026-11-21)
At 375×812 the four social shortcuts (Email, LinkedIn, GitHub, Instagram) sit in a 2×2 grid that takes about
half a screen of felt and pushes "Off the clock…", "View availability" and the nav buttons far down.
- Below 760px show them in **one row of four**: icon ~32px, label ~12px (cream on felt, AA as recorded in
  16b), each target ≥ 44×44px. Must fit 360px without horizontal scroll; below ~340px allow two rows.
- Desktop unchanged.

## 4. Desktop inbox is taller than the screen (Task 17c verification, 2026-11-21)
At 1440×900 the `inbox.exe` window (toolbar + bounded list/preview + status bar + bottom nav row) runs past
the viewport: the status bar sits on the taskbar line and the bottom "Home" button is hidden behind the
taskbar. The bounded-height formula only accounts for the list/preview body.
- Remove the bottom nav row from the **inbox** on desktop too (Home is now the first toolbar button). Keep
  the end-of-post "← Inbox · Home" row on posts.
- Size the body so the **whole window** (title bar, toolbar, panes, status bar) fits between the hill
  header overlap and the taskbar with ~16px to spare at 1440×900, 1280×720 and 1024×768. Keep the min
  height (~420px body); if the viewport is shorter than that, let the page scroll normally.
- Mobile: the toolbar's icon-only RSS button sits higher than the labelled Home button. Align it to the
  same row height/centre (or give it an invisible-label spacer); keep it icon-only.

## 5. Sub-pages: hills behind everything instead of a flat pale background (owner, 2026-11-21)
Owner: "my problem is that in mobile mode it is still white background." Sub-pages (`/blog`, posts, `/cv`,
`/contact`, `/availability`, 404) still use the 42vh faded header, so below it the page is flat `--page`
(pale blue by day, navy by night). Most visible on phones, where windows are narrow and pages are long.
- Sub-pages get the **same fixed wallpaper as the landing** (Task 12's fixed layer, viewport grid, `100lvh`,
  no regeneration on URL-bar height changes, Task 15 art, Task 17 day/night switch), on mobile and desktop.
  Remove the faded-header mask and the flat page background on sub-pages.
- **No transition** on sub-pages: no parallax, no snap, no hero. A **static dim veil** at a fixed opacity
  (~0.3; tune so the hills are clearly visible but calm) sits above the scene and below windows. Window
  bodies stay opaque, so reading contrast doesn't change.
- Ambient animation (clouds, twinkle, fireflies) runs while `scrollY < 80px` and pauses once you scroll into
  the content (reuse `data-wallpaper="rest"`), resuming near the top. Reduced motion: static.
- Windows keep their current top offset (they still start below a strip of visible sky/hills). Scenery mode
  on sub-pages keeps working (undimmed full scene).
- CV print still prints only the paper. `/anita` unchanged.
- Check performance on a long post at 375×812 with 4× CPU throttling (one fixed layer, no scroll work
  beyond the pause toggle).

## Acceptance
- [x] Every sub-page shows the hills wallpaper behind the windows (static veil, no flat background) at 375 and 1440, day/night; ambient pauses while reading; print and /anita unchanged
- [x] Desktop inbox fits fully above the taskbar at 1440×900, 1280×720, 1024×768; no bottom Home row on the inbox; mobile RSS icon aligned
- [x] Contact on phones: social icons in one row (two rows only below ~340px), targets ≥ 44px
- [x] 375×812 / 360×740 night: ~10–14 stars mostly in visible sky, reads as a night sky; day: 2–3 clouds
- [x] No LCP warning on a fresh load of `/` at 1440×900 and 375×812, or a recorded reason it's a false positive

## Decisions log

- Fresh dev loads at 1440×900 and 375×812 produced no image LCP warning. Chrome’s PerformanceObserver reported the hero H1, not either memoji. Kept the hero eager and the About image lazy.
- Star density now uses CSS-pixel sky area. The 375px and 360px portrait scenes both have 10 stars, with nine above the hero band and two bright crosses; desktop has 44. Day has three distributed upper-sky clouds on phones. Seeded tests cover density parity, spacing, terrain and moon exclusion.
- Chrome verified the fixed wallpaper in both themes on all six XP sub-page types at 375px and 1440px, including undimmed scenery, instant sub-page theme changes, and paper-only CV print. A 4× CPU trace on the long post at 375×812 captured 52 scroll events (max 0.6ms), 104 animation-frame callbacks (max 2.2ms), and exactly two wallpaper attribute changes on the round trip. No long scroll callbacks.
- Inbox clears the taskbar by 18.25px at 1440×900, 16.66px at 1280×720, and 18.27px at 1024×768. Mobile RSS and Home controls align. Contact shortcuts fit one row at 360/375px and two at 320px, with at least 44px targets.
- Lint (two existing Anita warnings), typecheck, all 42 tests and production build passed. Both /anita baseline screenshots matched.
