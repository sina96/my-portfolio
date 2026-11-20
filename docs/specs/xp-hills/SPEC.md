# XP Hills — Design Spec

The current design of the public site: a Windows XP desktop on a procedural pixel-art
"green hill under a blue sky". This describes the shipped design as of 2026-11-20.
How it got here (ten review rounds, implementer decisions) is archived in
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
contrast is AA in both themes. Night windows use a dark body with Luna title bars.

## 2. Hill scene

`components/HillScene.tsx` + pure generator `utils/hillScene.ts`.
- Pixel grid with 4×4 Bayer dithering, seeded `mulberry(1987)` (deterministic, unit-tested), layers
  painted to canvas data URLs inside an SVG, `image-rendering: pixelated`, client-rendered over a sky
  gradient fallback.
- Day: sky, back/front hills, crest light, drifting clouds with masked shadows, glints.
  Night: stars (some twinkle), moon, dim clouds, fireflies.
- Motion uses `steps()` so it snaps to the grid. Reduced motion disables all of it.
- Decorative: `aria-hidden`, no pointer events.

**Modes**
- **Intro** (`/`, desktop ≥760px, motion allowed): two resting states.
  1. *Hill view* (scrollY 0): full-screen hill, `hi.exe`, taskbar, "▼ SCROLL" hint.
  2. *Content view*: About me's title bar at the top of the viewport, hill scrolled away.
  Any downward intent (wheel, swipe, keys, hint click) glides (~600ms) to the content view; upward intent
  at the top of the content glides back. Never rests in between.
- **Header** (all other pages; landing on mobile or reduced motion): static 42vh faded header. The first
  window overlaps it (`--hill-overlap`, ~18–24vh) so titles are visible without scrolling.
- **Scenery** (easter egg, §5): fixed, unfaded `100dvh` scene drawn on a viewport-sized grid (~5px cells)
  so it composes well in portrait and landscape; moon anchored top-right of the visible sky.

Every visit to `/` without a hash starts at the hill view (reload, links, back/forward); other pages
keep native scroll restoration.

## 3. Navigation

**Landing only** (`/`):
- **Taskbar** (bottom, Luna): Start menu (Home, Blog, CV, Contact, RSS), a button per registered window
  (hidden on mobile), tray with theme toggle and clock.
- **Explorer task pane** replaces the taskbar once the content view is reached (IntersectionObserver
  sentinel; only one nav is in the a11y tree). Sits in the left margin; the content column stays
  centred in the viewport and shifts only to avoid overlap. Groups:
  - *Places*: Home, Blog, CV, Contact, RSS with icons, `aria-current`.
  - *Appearance*: Luna pill switch "Night mode" (`role="switch"`).
  - *Closed windows*: shown only when a content window is closed/minimized; never lists `hi.exe`.
  - `© {year} Sina Bastani` as small muted text below.
- **Mobile**: compact taskbar; past the header a launcher opens the pane as a native `<dialog>` drawer.
  A one-time balloon "your menu lives here" appears if the launcher sits untapped for ~6s.
- **Home on `/`**: restores content windows first if scenery mode or the closed-all dialog is active,
  then desktop glides to the content (focus `#main`); mobile and reduced motion scroll to the top.

**Sub-pages** (`/blog`, posts, `/cv`, `/contact`, `/availability`, 404): no taskbar, pane or theme
toggle. Navigation is a centred button row inside the main window.

## 4. Windows

`XpWindow` (xp.css markup) with stable ids, managed by `XpWindowManager`. Minimize collapses, Close
hides, no dragging or stacking; windows sit in normal flow. State resets per route.

## 5. Closed-all easter egg

Closing every content window on any page (never counting `hi.exe`) shows a small "Desktop" dialog where
the windows were: "wanna enjoy the scenery instead?" with **Show me the hills** (primary, focused) and a
subtle **restore windows** link (Escape = restore).
- *Show me the hills*: scenery mode (§2) with a one-shot ~600ms stepped reveal (not replayed by resize
  or theme changes), caption "enjoy the scenery ☁", and a quiet "restore windows ↺" text button in the
  corner. Scroll is locked; the landing keeps its taskbar.
- *restore windows*: reopens content windows, normal layout, focus `#main`. Per page view, not persisted.

## 6. Pages

| Route | Content |
|---|---|
| `/` | `hi.exe` glass teaser over the hill; content view: About me, Latest posts |
| `/blog` | "My Blog" archive window: title, date, excerpt per post; subtle orange RSS glyph top-right |
| `/blog/[slug]` | One window: date, title (h1), article; ← All posts · Home |
| `/contact` | Contact window with pixel desk; availability behind a toggle |
| `/cv` | WordPad document |
| `/availability` | Availability calendar window; ← Contact · Home |
| 404 | XP error window over the faded hill |

**`hi.exe`** (desktop app, not a content window): ~320px frosted-glass body (blur, thin light border,
darker tint at night, opaque fallback). Memoji 72px, "hi! 👋" 21px regular, note "(you can close me,
the view is nicer)" 12px white at 80% (day) / 70% (night) with a soft shadow, no backing. Maximize is
decorative. Closing it shows a double-click desktop icon and the "enjoy the scenery ☁" caption. A
one-time tray balloon "psst… try closing the window, the view is nicer" appears after ~4s.

**About me**: memoji, "Sina Bastani" (h1), "Human. Developer. Can't properly work with printers.",
status "Current Status: {label}" from `SITE_STATUS` in `src/lib/site.ts` (`busy` = red dot, `available`
= green; ping off under reduced motion), centred "View CV".

**Contact**: ≥760px the copy is left-aligned on the left and the pixel desk on the right (like About
me); below 760px the desk sits above centred copy. Copy: "Let's link up!", "Have a fun project?
Brainstorming? Rant? Hmu!", Contact me (mailto), LinkedIn / GitHub / Instagram, "Off the clock: logging
movies on letterboxd and making playlists on spotify." "View availability" toggles the availability
window below; Home · Blog centred at the bottom.
- *Pixel desk* (`utils/pixelDesk.ts`, deterministic SVG): desk, beige CRT showing a tiny code editor
  (prompt, coloured code lines, blinking cursor), plant, mug with stepped steam; day/night palettes;
  `aria-hidden`; ~280px desktop, ~200px mobile.

**CV** (`cv.doc - WordPad`): decorative menus and ruler; working toolbar Home | Print · Save as PDF ·
Open PDF · Copy as Markdown (mobile: icons with short labels); grey workspace with a white (night:
dimmed) two-column paper: header with name, role and links, sidebar with contact,
skills tag groups and languages, main column in Markdown file order (profile, experience, project,
education and certifications, additional experience); single column on mobile. Status
bar with last-updated date; Home also at the bottom. Print emits only the paper on A4. Phone numbers
never appear in HTML or copied Markdown (PDF unchanged).

## 7. Responsive, accessibility, quality

- Breakpoint 760px. Mobile: static header, stacked full-width windows with 16px gutters, no horizontal
  scroll, drawer navigation.
- Landmarks (`header`, `main`, `nav`), skip link, visible focus everywhere, AA contrast, reduced motion
  respected (scene, glide, hint, ping, balloons, reveal), no hydration warnings or theme flash.
- Security: security headers and an enforced CSP on public pages (`next.config.mjs`), `/admin` behind
  Basic Auth that refuses placeholder or short passwords, cached availability API, sanitized Markdown.
- `bun run lint && bun run typecheck && bun run test && bun run build` pass; `/anita` unchanged.

## 8. Open items and follow-ups

- CV on mobile: skills come after the main sections; moving them right after Profile is an option.
- Deferred from the improvement audit: a Sveltia CMS preview stylesheet served through the authed admin
  route, and a Renovate policy for major updates.
- Out of scope: window dragging/stacking, extra desktop icons, read time/tags/cover images, pre-rendering
  the scene.
