# Task 14b: Real minimize vs close, restore popup, sticky mobile title bars

**Branch:** `landing-v2`, on top of uncommitted Tasks 12–14. Leave changes uncommitted.
**Read first:** `LANDING-V2.md`, Decisions log of `TASK-14-taskbar-easter-egg.md`, `SPEC.md` §4–5.
After the task: `bun run lint && bun run typecheck && bun run test && bun run build`. Update `SPEC.md` §3–5,
`LANDING-V2.md` decision 7 and the AGENTS.md "Windows" invariants. This **replaces Task 14 §2** (the
"close sends it to the taskbar" rule).

Owner (testing Task 14): "when you close the windows they go down, but people don't understand they need to
click down there to bring it up, because it's not minimizing. Minimization just hides the content of the
window … maybe minimization does that, and close closes it. And you can click the thing down there, or have
a popup like the old easter egg to restore things or go to the hills." / "in mobile, when you scroll down,
the top window's XP title bar is passed, so you can't click it. On desktop it works fine."

## 1. Landing (`/`): minimize goes to the taskbar
- **Minimize (_)** on any landing window (hero, Latest posts, About me): the window leaves the page (hidden,
  layout reflows) and its taskbar button shows the un-pressed "minimized" look. Tapping the button restores
  it and scrolls it into view (hero: top / hill view).
- Make the destination visible: a short **stepped "shrink to taskbar"** effect (~250ms, 4–5 steps): a
  window-outline ghost (like XP's minimize rectangle) scales/moves from the window toward its task button,
  then the window hides. Off under reduced motion (just hide). Never blocks input; one ghost at a time.
- **Maximize** stays as is (restores a collapsed window on sub-pages; decorative on the hero).

## 2. Landing: close really closes
- **Close (×)**: the window disappears **and its taskbar button disappears too** (real XP).
- **One content window closed** (Latest posts or About me): show the quiet "restore closed windows ↺" link
  where the windows are (reuse the sub-page `.xp-partial-restore` pattern), and Start → "Restore all
  windows".
- **Both content windows closed**: bring back the **"Desktop" popup** on the landing in their place, same as
  before Task 14 and as sub-pages still have: "wanna enjoy the scenery instead?" with **Show me the hills**
  (primary, focused) and **restore windows** (Escape = restore). Scroll it into view.
- **Show me the hills** → scenery mode: scroll to top, one-shot reveal, hero hidden too, all landing task
  buttons gone, taskbar stays, ambient on, theme toggle works without replaying the reveal, caption
  "enjoy the scenery ☁", the corner **"restore windows ↺"** button is back on `/`, and the one-time
  scenery balloon (Task 14) stays. Exit: restore button, Start → Restore all, Home, Escape.
- **Hero (`sina.exe`)**: closing it leaves the double-click desktop icon in the hill view (as today); its
  task button disappears. It does **not** count toward "both content windows closed" (go back to the
  pre-Task-14 rule: `desktopApp` excluded from the closed-all count on every page). Restore all / Home /
  scenery exit reopen it too.
- Focus: after minimize/close, focus moves to the window's task button if it still exists, else to the
  restore link / popup primary button, else `#main` (adapt `focusNavigation` in `XpWindow.tsx`).

## 3. Sub-pages
- No taskbar, so **minimize keeps collapsing** the window body (current behaviour). Close, the partial
  restore link and the closed-all popup stay as they are. Make sure landing and sub-pages share one code
  path for close/popup/scenery, with only "where minimize goes" differing.

## 4. Sticky title bars on mobile (<760px), all pages
- Each XP window's `.title-bar` is `position: sticky; top: 0` (plus `env(safe-area-inset-top)`), so while
  you scroll through a tall window its title bar stays reachable at the top of the screen; at the window's
  end it scrolls away and the next window's bar takes over (natural sticky behaviour within the window).
- Give the sticky bar a z-index above window content but below the taskbar, Start menu, balloons and
  dialogs. Keep its rounded top corners and Luna gradient; no layout shift.
- Not on desktop. Not on the hero glass window. Not in print (CV). Check the CV WordPad window on mobile:
  its toolbar must still work (sticky title bar only; the toolbar may scroll away).
- The landing mobile snap stop still puts Latest posts' title bar at ~12px.

## Acceptance
- [x] `/` 375×812 and 1440×900: minimize sends a window to its taskbar button with a visible stepped effect;
      tapping the button restores and scrolls to it; reduced motion = instant
- [x] Close removes the window and its task button; one closed → "restore closed windows ↺"; both closed →
      Desktop popup → Show me the hills → scenery (corner restore, balloon, theme toggle works) → restore
- [x] Hero close shows the desktop icon and doesn't trigger the popup on its own
- [x] Sub-pages: minimize collapses, close/partial/popup unchanged
- [x] Mobile: scrolled to the bottom of `/`, Latest posts' title bar stays reachable while its body is on
      screen; same on a long blog post and /cv; desktop unchanged
- [x] lint/typecheck/test/build pass

## Decisions log

- A single, pointer-transparent outline animates in five 50ms steps from the visible part of the window to its task button. Reduced motion skips the outline. Close removes the task button instead.
- Landing and sub-pages use the same Desktop popup and scenery state. The scenery balloon now points to Start → Restore all windows and sits above the corner restore button so both can be used.
- Playwright/Chrome verified 375×812 and 1440×900: minimize and re-open, close and partial restore, popup focus and Escape, scenery entry and corner restore, and a day/night switch without replaying the reveal. The mobile content stop still lands at 12px. Verified sticky controls while scrolling through Latest posts, a long blog post, and WordPad, plus non-sticky print and desktop styles. Contact partial restore still works.
- Lint (two existing Anita warnings), typecheck, all 30 tests and the production build passed. Both /anita baseline screenshots matched.
