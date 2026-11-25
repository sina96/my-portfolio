# XP Hills — Design Spec

The current design of the public site: a Windows XP desktop on a procedural pixel-art
"green hill under a blue sky". This describes the shipped design as of 2026-11-21 (XP Hills plus the Landing v2 round).
How it got here (review rounds, task handoffs, implementer decisions) is archived in
[`docs/archive/xp-hills/`](../../archive/xp-hills/).

- Technique reference for the scene: [`sketch.html`](./sketch.html) (open in a browser; `#day` / `#night`
  forces a theme). Where the sketch and this spec disagree, this spec wins.
- Code conventions and file locations: `AGENTS.md`.

## 1. Visual system

**Libraries.** `xp.css` (XP Luna chrome) for all `(main)` pages; site styles are plain CSS next to the
pages (`src/app/(main)/*.css`), loaded from the root layout. Tailwind is used only by `/anita`, whose look
must not change.

**Fonts** (system first, `next/font` web fallbacks, none preloaded):

| Role | Stack |
|---|---|
| Title bars, headings, Start button, pane headers | `"Trebuchet MS"`, Fira Sans, `"Segoe UI"`, sans-serif |
| Body, controls, taskbar, captions | Verdana, `"DejaVu Sans"`, PT Sans, Tahoma, sans-serif (~15px, line-height ~1.6) |
| Dates, meta, code | `"Lucida Console"`, Monaco, Consolas, IBM Plex Mono, monospace |
| CV paper only | Times New Roman / Georgia body, Arial headings |

**Theme.** `data-theme="light" | "dark"` on `<html>`, set by an inline pre-paint script, stored in
localStorage `theme`, synced by `src/lib/theme.ts`. Light = day scene, dark = night scene. Tokens live
in `site.css` (`--page`, `--ink`, `--muted`, `--accent`, `--link`, `--line`, `--code`, `--window-body`);
contrast is AA in both themes. Night windows use a dark body with Luna title bars. On `/`, the tray
and Places pane save the theme immediately but apply the window tokens halfway through the twilight
sequence. Initial loads, sub-pages and reduced motion switch instantly. A second toggle during the
sequence reverses from the current frame without jumping.

## 2. Hill scene

`components/HillScene.tsx` + pure generator `utils/hillScene.ts`.
- Pixel grid with 4×4 Bayer dithering, seeded `mulberry(1987)` (deterministic, unit-tested), layers
  painted to canvas data URLs inside an SVG, `image-rendering: pixelated`, client-rendered over a sky
  gradient fallback.
- Viewport art uses ~5px cells on desktop and ~7px below 760px. Portrait adds a blue atmospheric
  ridge behind two rounded hills. The front crest is near 59% of the scene; the hero sits higher
  to keep it clear of the front ridge and leave the moon visible. Landscape keeps its terrain curves.
- Day: crest light, glints and drifting clouds with masked shadows. Night: dim clouds, fireflies and
  seeded stars (~1 per 17,500 CSS px² of sky, at least ten on phones when space allows, ≥6 cells apart,
  singles/doubles/bright crosses, ~18%
  twinkle). Stars avoid the terrain and moon. Phone portrait places most stars above the hero,
  with three day clouds spread across the upper sky (also visible with reduced motion).
- Motion stays on the pixel grid. On `/`, day/night switches use ten discrete frames over 1.5s:
  warm sky to violet to navy (reversed at dawn), a seeded sun and moon moving on right-hand arcs
  behind the ridges, and stars appearing in batches. Both palettes are cached for the active grid. The sequence works
  behind the content veil and in scenery, and resize does not restart it. Reduced motion skips it.
- Decorative: `aria-hidden`, no pointer events.

**Modes**
- **Intro** (`/`, all devices): full-screen hero (`100svh` on mobile, `100vh` on desktop) over a fixed
  `100lvh` wallpaper on a viewport-sized grid. The wallpaper stays behind opaque content windows and
  shows through their gaps. Width changes, rotation and substantial height changes can rebuild the
  grid; small height-only changes leave its scale and art intact.
  - In the first half-screen of scroll, land, clouds and moon/stars shift at different depths in
    whole-cell steps. The hero lifts and fades (keyboard focus keeps it visible), content fades in and
    a flat 60% day/night veil dims the scene. At full dim, ambient animation pauses until scrolling back.
  - Desktop (≥760px): a 475ms ease-out glide stops at the hill or with the first content window
    12px from the top. A wheel flick produces one glide; upward scrolling at the content stop
    needs about 50px of wheel input. The hill stays behind the windows.
  - Mobile: the visual transition still finishes within half a screen, but native scroll settles to
    the nearer of the hill view or the first content window 12px from the top, with a small direction
    bias. No snapping with a finger down or at or beyond the content stop.
  - Reduced motion: static wallpaper and hero, no glide or snap, instant dim after a quarter screen.
- **Sub-pages** use the same fixed `100lvh` viewport wallpaper under a 30% veil. The 42vh header
  spacer and `--hill-overlap` keep window offsets unchanged. No parallax, snapping or stepped theme
  switch. Ambient motion pauses at 80px of scroll and resumes near the top.
- **Scenery** (easter egg, §5): fixed, unfaded `100lvh` scene using the same viewport art as the
  landing. Across all XP wallpaper modes, the sun by day and moon by night share the same
  box, at least 6% from the top and 8% from the right, sized `clamp(56px, 16vmin, 180px)`.
  Clouds drift in front of them. The sun's rays alternate every 1.2s and pause with other
  ambient effects. The top-left hero shortcut zone has no bright crosses or celestial bodies.
  Scenery has no dim veil or scroll-driven parallax/pause.

Every visit to `/` without a hash starts at the hill view (reload, links, back/forward); other pages
keep native scroll restoration.

## 3. Navigation

**XP pages** (landing, blog, posts, CV, Contact, System, Availability and 404):
- **Primary taskbar** is pinned at the bottom on desktop and mobile. Start lists Home, Blog, CV,
  Contact, System, RSS, LinkedIn, GitHub, Restore all windows (when needed), and ©. The tray has the theme
  toggle and clock; the taskbar and the content padding account for the safe area.
- **Window buttons** show an icon and title on desktop, icon only on mobile. Open is pressed,
  minimized is normal, and closed windows have no task button. Clicking opens and scrolls to that
  window (the hero returns to the hill).
- On sub-pages the bar slides away on downward scroll beyond 80px. It comes back after 24px
  upward, at the bottom, for keyboard focus or an open Start menu, and when windows are minimized
  or closed. While hidden, its controls are inert; keyboard focus bridges reveal it in both directions.
  Reduced motion skips the slide. The landing bar never hides.
- **Places task pane** appears in the desktop left margin at the content stop, alongside the taskbar.
  It holds Places links and Appearance (Night mode), not window controls. No mobile launcher or drawer.
- **▼ SCROLL** floats above the taskbar in the hill view and fades with the hero. It glides to the
  content stop on desktop, scrolls smoothly on mobile and jumps instantly under reduced motion.
- **Home** restores all windows, then glides to the content on desktop
  (focus `#main`) or returns to the hill on mobile and under reduced motion.

**Sub-pages** retain the centred in-window navigation row alongside Start. Links use compact Luna
buttons with original 16px pixel glyphs, visible focus and 44px mobile targets. The Places pane is
landing-only. CV print hides the taskbar; `/anita` is outside the XP shell.

## 4. Windows

`XpWindow` (xp.css markup) uses stable ids, and `XpWindowManager` owns state per route. Minimize
hides the whole window with a stepped outline that shrinks to its task button (instant with reduced
motion). Close also removes the task button. Maximize is decorative. Below 760px, title bars stick
within their windows, excluding the glass hero and print. Windows sit in normal flow and cannot be
dragged or stacked.

## 5. Closed-all easter egg

Closing a content window leaves a quiet “restore closed windows ↺” link while other content windows
remain. Closing every content window shows the “Desktop” popup, with focus on “Show me the hills”.
The hero does not count; closing it leaves its desktop icon in the hill view.

“Show me the hills” scrolls to the top and locks the page in undimmed scenery. Ambient animation runs
unless reduced motion is active; the stepped reveal plays once. The corner restore control and Escape
restore the windows. In scenery, task buttons and the landing hero hide, but the taskbar and theme
toggle remain available. The theme can change without leaving scenery or replaying the reveal. A one-time
tray hint points to Start → Restore all windows; Home also restores all windows.

## 6. Pages

| Route | Content |
|---|---|
| `/` | `sina.exe` glass window over the hill; content view: Latest posts, then About me |
| `/blog` | `inbox.exe`: year folders, scrollable message list, pinned desktop preview, Home / RSS |
| `/blog/[slug]` | Message window with mail header, article, and ← Inbox · Home |
| `/contact` | `klondike.exe` card table and contact shortcuts; availability behind a toggle |
| `/cv` | WordPad document |
| `/availability` | Availability calendar window; ← Contact · Home |
| `/system` | System Properties dialog: General, Network, Security, Automatic Updates tabs; OK · Cancel · Apply |
| 404 | XP error window over the wallpaper |

**`sina.exe`** (desktop app): up to 360px wide with 16px mobile gutters, a
frosted-glass body, white text and an opaque fallback. A 64px memoji, the page's only `h1` (Sina Bastani),
`SITE_ROLE_LINE`, and three single-click pixel-art shortcuts: CV, Contact, Blog. Maximize is decorative.
Closing shows the reopen icon until scenery takes over. The tray balloon still hints that you can
close it.

**Latest posts**: up to five published posts and an All posts link, first in reading order. At ≥1100px
it shares a row with the narrower About me window; below that the windows stack. On phones,
list text is smaller, dates sit below titles, and excerpts display on one ellipsized line.

**About me**: 56px memoji, `SITE_TAGLINE`, the status label from `SITE_STATUS` (no prefix) (red busy dot,
green available dot, no ping under reduced motion), and the `SITE_NOW` definition list from
`src/lib/site.ts`. Entries with no value are omitted; the CV shortcut lives in the hero.

**Blog mail client**: Inbox and year folders derive from published dates without a new content field.
On desktop, the bounded list scrolls independently with a sticky column header and a pinned preview.
The inbox uses toolbar-only Home and fits above the taskbar when the viewport allows.
Click or focus selects; Arrow Up/Down and Home/End move selection; Enter, double-click or Open message
opens the post. Mobile uses scrollable folder tabs and full-row sender/date, subject and excerpt links
without a preview. Read marks are local, bounded and only shown after hydration; blocked storage keeps
the list neutral. The inbox toolbar has Home and icon-only RSS; the message toolbar adds Back to Inbox,
Copy link (canonical URL) and Reply (mailto). Post subjects are
the `h1` inside a From/To/Date/Subject block; article typography and Markdown sanitization are unchanged.

**Contact**: the `klondike.exe` body uses the same green felt in both themes, with a decorative
Deal · Options · Help menu. The slot groups contain a mix of outlined empties and original cream
pixel cards, including small built piles. There are four slots per side on desktop, three below
760px, and two below 330px. Original pixel Sina (40px desktop, 56px mobile) sits between the groups,
pops up and waves on activation, rotating a short live-region
greeting; reduced motion shows only the greeting. Copy and actions sit on the felt. Contact has
no status bar. The pixel desk is parked (component, CSS and tests retained).
- “hit me up” is the main mail action. Email, LinkedIn, GitHub and Instagram also have original
  pixel-art shortcuts on the window body, in one row at 340px and wider. Letterboxd and Spotify sit under “Off the clock:” as two short lines.
- “View availability” toggles a second window; Home · Blog are the bottom navigation links.

**CV** (`cv.doc - WordPad`): decorative menus and ruler; working toolbar Home | Print · Save as PDF ·
Open PDF · Copy as Markdown (mobile: icons with short labels); grey workspace with a white (night:
dimmed) two-column paper: header with name, role and links, sidebar with contact,
skills tag groups and languages, main column in Markdown file order (profile, experience, project,
education and certifications, additional experience); single column on mobile. Status
bar with last-updated date; Home also at the bottom. Print emits only the paper on A4. Phone numbers
never appear in HTML or copied Markdown (PDF unchanged).

**System Properties**: four keyboard-operable tabs with hash deep links. The infrastructure, scan
grades and build details are a static snapshot as of deploy, not live monitoring. The settings
sync test (`tests/system.test.ts`) checks the snapshot against the repo's infrastructure and security config.
Panels are short: icon tiles (General), aligned step tiles coloured by provider, two columns on mobile, with a stepped highlight (Network),
grade tiles that re-run each scan plus a two-column checklist (Security), and one-line automation rows.
OK, Cancel and the title-bar Close return to the previous XP page in this tab (sessionStorage,
`components/returnPath.ts`), or the desktop when unknown; Close skips the closed-desktop dialog. Apply is disabled.

## 7. Responsive, accessibility, quality

- Breakpoint 760px. Mobile: fixed wallpaper, stacked full-width windows with 16px gutters, no page-wide
  horizontal scroll, taskbar navigation.
- Landmarks (`header`, `main`, `nav`), skip link, visible focus everywhere, AA contrast, reduced motion
  respected (scene, glide, hint, ping, balloons, reveal), no hydration warnings or theme flash.
- Security: security headers and an enforced CSP on public pages (`next.config.mjs`), `/admin` on
  `admin.sinabastani.dev` behind Cloudflare Access with an app-side JWT check (Basic Auth only locally /
  break-glass), cached availability API, sanitized Markdown.
- `bun run lint && bun run typecheck && bun run test && bun run build` pass; `/anita` unchanged.

## 8. Open items and follow-ups

- Optional: on narrow portrait screens the setting sun slides off the right edge (to avoid the hero)
  instead of sinking behind the ridge.
- CV on mobile: skills come after the main sections; moving them right after Profile is an option.
- Deferred from the improvement audit: a Sveltia CMS preview stylesheet served through the authed admin
  route, and a Renovate policy for major updates.
- Out of scope: window dragging/stacking, extra desktop icons, read time/tags/cover images, pre-rendering
  the scene.
