# Task 7: Scenery dialog fixes (post-review of Tasks 5 and 6)

**Branch:** `redesign-xp-hills`, on top of the uncommitted Task 1–6 work. Leave changes uncommitted.
**Read first:** `SPEC.md` §10, `TASK-5.md` Decisions log. Tasks 5 and 6 were verified on 2026-11-20;
everything else passed. After the task: `bun run lint && bun run typecheck && bun run test && bun run build`.

## 1. Dialog is pushed off-screen on sub-pages (bug)
After closing the last window on a sub-page (e.g. `/blog` at 1440×900), the "wanna enjoy the scenery
instead?" dialog renders with its title bar and top edge **above the viewport** (only the text and
buttons are visible at y≈0).
- Cause: `src/app/(main)/scenery.css:27` `.xp-subpage > .xp-closed-card { margin-top: calc(-1 * var(--hill-overlap)); }`
  pulls the card up by the overlap once the window above it is hidden.
- Fix: the dialog should sit where the closed window was: top at the overlap position (~18vh), fully
  visible, centred, over the faded hill. Check `/blog`, a post, `/contact` (with availability open and
  closed), `/cv`, `/availability`, 404, and the landing content view, at 1440×900 and 375×812.

## 2. "Show me the hills" button text is tiny (bug)
The primary button renders with much smaller text than every other button on the site (it picks up
the xp.css default button font size instead of the site's button styles).
- Make both dialog actions use the site's button typography (same size as "Home" / "View CV" buttons).
  "restore windows" stays a subtle link-style button but readable (~13–14px).

## 3. Subtle restore in scenery mode (polish)
In scenery mode the "restore windows ↺" control at the bottom-right has a dark filled chip background,
which is heavier than the spec's "subtle". Make it a quiet text button: white ~80% opacity with a soft
text-shadow, no filled background, underline/focus ring on hover/focus, same font as the caption.
Keep `aria-label` and keyboard focus behaviour.

## 4. Unused CSS preload warning on /contact (minor)
Chrome logs `/_next/static/chunks/<hash>.css was preloaded using link preload but not used within a few
seconds` on `/contact`. Find the stylesheet (likely a CSS file imported only by a lazily-mounted component,
e.g. the availability widget or scenery/pixel-desk CSS) and import it where it is actually needed, or
from the shared shell, so no preload is wasted. No warning on any route.

## Acceptance

Verified in Chrome against local dev and production; dialog positions and restore controls checked at 1440×900 and 375×812. All 12 tests and the production build passed; lint retains two existing `/anita` warnings.
- [x] Closing all windows on every page shows the dialog fully on screen (title bar visible) at 1440×900 and 375×812
- [x] Dialog buttons readable at the same size as other site buttons; restore stays subtle
- [x] Scenery-mode restore is a quiet text button, no filled chip; works with mouse and keyboard
- [x] No CSS preload warnings on any route
- [x] lint, typecheck, test, build pass

## Decisions log
- Sub-pages share a grid cell for the windows and the dialog, so their negative overlap is applied once rather than twice when the main area is empty.
- No unused CSS preload reproduced on a direct Contact load. Chrome did reproduce an unused WordPad preload on `/` and unused root-404 styles on `/anita`; scoped XP and WordPad CSS now load from the root layout. Anita still matched both baseline screenshots.
