# Task 14: Always-on landing taskbar, one easter-egg rule

**Branch:** `landing-v2`, on top of uncommitted Tasks 12–13. Leave changes uncommitted.
**Read first:** `LANDING-V2.md`, Decisions logs of Tasks 12–13, `SPEC.md` §3 and §5.
After the task: `bun run lint && bun run typecheck && bun run test && bun run build`. Update `SPEC.md` §3,
§5 and the AGENTS.md "Layout and navigation" / "Windows" invariants.

Owner: "the XP taskbar should always be there, at least on the first page." / "we don't need it when we
are reading a blog … on other pages people have a mission." / "on mobile we have the easter egg on top
and on the bottom, it's a bit weird."

## 0. Follow-ups from Task 13 (owner testing, 2026-11-21)

### 0a. Bring back the bottom "▼ SCROLL" hint
Owner: "I really like the scroll thingy we had before, at the bottom of the screen. Now it's in the card
itself. To me it's a downgrade." The card itself is liked (including the darker day tint). Keep it as is.
- Remove the in-card "scroll for more ↓" button (`HomeHero.tsx`, its CSS).
- Restore the previous hint chip: `▼ SCROLL`, bottom-centre of the hill view, the same look as before
  (dark navy chip, light border, mono 12px, letter-spacing, stepped 2-frame bounce). It now shows on
  **mobile and desktop**, sitting `16px` above the always-visible taskbar (respect the safe area).
- It fades out with the hero (`--hero-opacity`) and is hidden/inert once the hero has faded.
- Click/tap: desktop glide → content (`goHome`, as before); mobile → smooth scroll to the content snap
  stop (`getLandingStop`, as Task 13's button did). Reduced motion: visible, no bounce, instant scroll.
- Keyboard reachable with visible focus; ≥44px tap height on mobile.

### 0b. Desktop wheel glide feels stiff
Owner: "if you want to scroll down using the mouse wheel, it's a bit stiff." Likely causes in
`useLandingGlide.ts`:
1. The curve is ease-in-out cubic over 600ms, so the first ~150ms barely moves. A wheel tick should get an
   immediate response.
2. Every wheel event is swallowed for the whole glide plus a fixed 250ms (`MOMENTUM_MS`), so the page
   feels locked; with a trackpad the momentum often outlasts 250ms and then scrolls natively past the
   content stop (overshoot) or triggers a second glide.
3. At the top of the content, a single tiny upward nudge glides all the way back to the hill.

Change:
- Use an **ease-out** curve (e.g. cubic or quint out) and ~450–500ms, so motion starts right away.
- Replace the fixed momentum lock with "swallow the wheel stream until there's a ~120ms gap (max ~1.2s)".
  One flick = one glide, no overshoot, no double glide.
- Upward glide from the content view needs an accumulated upward delta of ~50px (one mouse notch passes;
  a small trackpad nudge doesn't). Downward from the hill view stays immediate.
- Keyboard and the hint keep their current behaviour.
- Verify with a mouse-like input (single `deltaY: 100` notches) and a trackpad-like input (a stream of
  ~40 small deltas over ~800ms) in Playwright, both directions. Record the timings in the Decisions log.

## 1. Taskbar always visible on `/` (mobile + desktop)
- `Taskbar` is always active on `/`: no `inert`, no hiding past the hill. Pinned to the bottom with
  `padding-bottom: env(safe-area-inset-bottom)`; landing content gets matching bottom padding so the last
  window clears it.
- **Remove** the mobile launcher (`.xp-pane-launcher`), the drawer `<dialog>`, `MENU_HINT` balloon and their
  CSS/logic in `DesktopNavigation.tsx` / `TrayBalloon.tsx` / `navigation.css`. Delete dead code.
- **Start menu** (unchanged entry point) lists: Home, Blog, CV, Contact, RSS, then LinkedIn and GitHub
  (external, new tab), then "Restore all windows" (only when something is closed or minimized), ©. It
  must fit at 375×812 above the taskbar (scroll inside if needed).
- **Task buttons on mobile too**: one per landing window (`sina.exe`, Latest posts, About me). Mobile shows
  icon-only buttons (~40×30, `aria-label` = title, `title` tooltip); desktop shows icon + title. Add a small
  16px pixel icon per window (reuse Task 13's icon drawing approach; pass an `icon` through `XpWindow`
  registration). Fit Start + 3 task buttons + tray at 360px wide without overflow.
- Task button states: open = pressed look; minimized = normal; **closed = dimmed (≈55% opacity, dotted
  outline)** but still clickable. Click on any → open the window and scroll it into view (hero: scroll to
  top / glide to the hill view on desktop).
- **Desktop task pane** stays in the left margin in the content view with *Places* and *Appearance*.
  Remove its *Closed windows* group (the taskbar owns that now). Both navs can now be visible at once on
  desktop; give the pane `aria-label="Places"` and keep the taskbar's `aria-label="Primary"`, and make sure
  there aren't duplicate landmarks with the same name.
- Sub-pages: unchanged (no taskbar, no pane, centred button row).

## 2. One easter-egg rule on `/`
- **Closing any window** (hero included) hides it; its task button stays, dimmed. No dialog.
  The closed hero keeps its double-click desktop icon (rename label to `sina.exe`).
- **All landing windows closed (hero included)** → scenery mode immediately: scroll to top (instant),
  one-shot reveal (`data-entering`, existing), scroll locked, wallpaper undimmed and never paused, ambient
  animations on, taskbar visible. Keep the "enjoy the scenery ☁" caption. Remove the corner
  "restore windows ↺" button on `/` (the taskbar, Start → Restore all, Home and Escape bring things back).
- **Theme toggle works in scenery mode** (tray ☀/☾): switches the scene palette without leaving scenery
  and without replaying the reveal. Add this to the verification list.
- **One-time balloon** from the tray on first scenery entry: "nice view, right? tap a window in the
  taskbar to bring it back" (new storage key, try/catch, dismissible, focus-safe like `HintBalloon`).
- Leaving scenery: opening any window exits scenery (others stay closed); Home / Restore all / Escape
  reopen everything (existing `reopenContent` logic, now including the hero).
- The "Desktop" dialog (`.xp-closed-card`) is **removed on `/`**. On sub-pages the existing closed-all
  dialog and the partial "restore closed windows ↺" link stay as they are.
- `desktopApp` semantics: on `/` the hero counts toward "all closed"; keep it out of the pane and out of
  sub-page logic. Rename or document the flag so the rule is clear in code.
- Keep the existing "psst… try closing the window, the view is nicer" balloon (first visit, hero open).

## Acceptance
- [x] Bottom `▼ SCROLL` hint is back on mobile and desktop above the taskbar; no in-card scroll button
- [x] Desktop wheel: glide starts immediately, one flick = one glide, no overshoot; a small upward nudge
      at the top of the content doesn't throw you back to the hill
- [x] 375×812 and 1440×900: taskbar visible at the top, mid-transition and at the bottom of `/`
- [x] No "Places" launcher, drawer or menu balloon anywhere
- [x] Mobile taskbar shows 3 icon task buttons; closing a window dims its button; tapping restores + scrolls
- [x] Closing all three windows (any order, from any scroll position) → scenery with reveal; no dialog
- [x] In scenery: theme toggle switches day/night without leaving scenery; balloon shows once
- [x] Restore via task button / Start → Restore all / Home / Escape all work; focus lands sensibly
- [x] Desktop: pane (Places, Appearance) + taskbar both work; no duplicate landmark names
- [x] Sub-pages: no taskbar; closed-all dialog and partial restore unchanged
- [x] lint/typecheck/test/build pass

## Decisions log

- Playwright/Chrome at 1440×900: a ±100px notch moved the page within 14–15ms and reached its stop in 464–465ms. Forty small wheel deltas over 786ms reached the downward stop in 465ms; upward motion began at 149ms (after accumulating 50px) and hit the hill in 599ms from the first event. Neither stream overshot or glided twice; a −12px nudge at the content stop did not move the page.
- The taskbar stays visible at the hill, in transit, and at the bottom. Checked mobile controls at 360px and 375px (no overflow), and both desktop navigation landmarks at 1440px. The bottom hint has a 44px mobile target and jumps immediately with reduced motion.
- The landing derives scenery from all registered windows being closed; minimizing is not closing. The one-shot reveal is attached to entry, not to theme changes. Verified the night palette switch, one-time scenery balloon, and task-button / Restore all / Home / Escape exit paths. Focus stays in the taskbar on scenery entry and single-window restore.
- Verified the blog's closed-all dialog and Contact's partial restore on sub-pages. Both /anita screenshots match their baselines. Lint (two existing Anita warnings), typecheck, all 30 tests and the production build passed.
