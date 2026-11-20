# XP Hills Redesign — Design Spec

Status: agreed 2026-11-20, revised same day after first implementation review (rev 2:
hero window, desktop icon, tray balloon, taskbar → task pane swap, single post window, fonts) and
second review (rev 3: glass teaser, subtle caption, two-state landing glide, windows overlap the hill,
viewport-centred column) ·
Branch: `redesign-xp-hills`
Reference sketch: [`sketch.html`](../../specs/xp-hills/sketch.html) (open in a browser; append `#day` / `#night` to force a theme)

The sketch is a **technique reference**, not a full page. It shows the pixel hill scene, its scroll
behaviour and an article column. Everything about windows, taskbar, routes and page content below
comes from the agreed decisions in this spec. Where the sketch and this spec disagree, **this spec wins**.

## 1. Concept

A Windows XP desktop living on a pixel-art "green hill under a blue sky". XP Luna window chrome
(via `xp.css`) floats over a procedurally drawn, dithered pixel hill scene. Content is presented in
XP windows; navigation shifts from the XP taskbar on the hill to the Explorer task pane below it.

## 2. Visual system

### 2.1 Libraries
- **`xp.css`** replaces `98.css` site-wide. Remove `98.css` from dependencies and all `!important`
  98.css overrides from `globals.css`.
- Tailwind stays installed (used by `/anita`), but new styles are plain CSS in `globals.css`
  (or co-located CSS files) using design tokens below.

### 2.2 Fonts (via `next/font`)
Goal: feel like the XP era, stay readable. (Rev 2: replaces the monospace-headings / Ubuntu Sans mix.)

| Role | Font stack | Notes |
|---|---|---|
| Title bars, headings (h1–h3), Start button, task pane headers | `"Trebuchet MS", "Fira Sans", "Segoe UI", sans-serif`, bold | XP's actual title-bar font |
| Body text, UI controls, taskbar, menus | `Verdana, "DejaVu Sans", "PT Sans", Tahoma, sans-serif` | Built for screens; ~15px body on desktop, line-height ~1.6. Tahoma for small dense UI (buttons, tray) is fine |
| Dates, meta, code | `"Lucida Console", Monaco, Consolas, "IBM Plex Mono", monospace` | Keep uppercase + letter-spacing for meta |

Trebuchet MS / Verdana / Lucida Console are system fonts on macOS and Windows. For Android/Linux,
self-host or `next/font/google`-load only the fallbacks actually needed (e.g. Fira Sans for headings,
PT Sans for body, IBM Plex Mono for code) so the look degrades gracefully. **VT323 and Ubuntu Sans are
removed**. The web fallbacks use `display: swap` and are not preloaded.

### 2.3 Theme tokens
Theme = `data-theme="light" | "dark"` on `<html>` (existing mechanism, localStorage key `theme`,
inline pre-paint script). Light = **day** scene, dark = **night** scene.

| Token | Day (light) | Night (dark) |
|---|---|---|
| `--page` (page bg under/around hill) | `#e8f1fb` (pale sky; continues the sky's lightest band) | `#0b1030` |
| `--ink` | dark navy, e.g. `#14204a` | `#ecebff` |
| `--muted` | e.g. `#4a5880` (must pass WCAG AA on `--page`) | `#aeabdc` |
| `--accent` | darker yellow/amber that passes AA on light, e.g. `#9a6a00` | `#ffd36b` |
| `--line` | `rgba(20,32,74,.16)` | `rgba(236,235,255,.16)` |
| `--code` | light code bg consistent with hljs light theme | `#070a22` |

Window bodies follow xp.css in day; night needs dark-mode overrides for xp.css windows
(dark window body, readable text, title bars may stay Luna blue but darker). Exact night window
palette is the implementer's call; keep contrast AA.

Scene palettes: copy `THEMES.day` / `THEMES.night` verbatim from `sketch.html` (lines ~165–180).

### 2.4 Shape language
- XP windows: Luna title bars, rounded top corners, as xp.css provides.
- Non-window accents from the sketch where they fit (hero window shadow, blockquote, `hr`, `pre`):
  hard offset shadows (`Npx Npx 0`), 3px borders, no blur.

## 3. The hill scene

Port the sketch's scene generator into a client component, e.g.
`src/app/(main)/components/HillScene.tsx` (+ pure generator module, e.g. `utils/hillScene.ts`).

- Grid 200×125 cells, 8px cells, SVG `viewBox 0 0 1600 1000`, `preserveAspectRatio="xMidYMid slice"`,
  layers painted to canvas → dataURL `<image>` with `image-rendering: pixelated`.
- Ordered 4×4 Bayer dithering, seeded RNG `mulberry(1987)` — deterministic output.
- Day: sky, back hills, front hill, sunlit crest, 7 clouds, 2 cloud shadows masked to hill, glints.
- Night: dark sky, 160 stars (≈45% twinkle), moon, 3 dim clouds, fireflies.
- Stepped (`steps()`) CSS animations so motion snaps to the 8px grid.
- **Client render** (agreed). Render after mount; the area must show a solid fallback
  (sky colour gradient matching theme) before the scene paints so there is no flash of empty page.
- Theme source is **`data-theme`** (the site toggle), **not** `prefers-color-scheme` or URL hash.
  Remove the sketch's `#day/#night` hash handling. Re-render when theme changes.
- `prefers-reduced-motion: reduce` disables **all** scene animations **and** the scroll hint bounce
  (the sketch misses the hint).
- `aria-hidden="true"`, `pointer-events: none`, fixed/absolute behind content (`z-index` below windows).

### 3.1 Two modes

**`mode="intro"` — landing page only (`/`), desktop ≥ 760px (rev 3: two resting states):**
- The landing has exactly **two resting states**:
  1. **Hill view** (scrollY = 0): full-screen hill, `hi.exe` teaser, taskbar, "▼ SCROLL" hint.
  2. **Content view**: the hill in its header end state (42vh, faded) with the content windows
     overlapping it exactly like the sub-pages (`--overlap`, see `header` mode below).
- **Glide:** from the hill view, any downward intent (wheel/trackpad, touch swipe, ▼ SCROLL click,
  PageDown/Space/ArrowDown/End) runs one smooth animated scroll (~600ms, ease-in-out) to the content
  view. From the content view at its top, an upward intent glides back to the hill view. Within the
  content, scrolling is completely normal. Never leave the page resting in between (the half-shrunk
  state is only ever seen mid-animation).
- Implementation guidance: the hill shrink stays tied to scroll position (so the glide visibly shrinks
  it), driven by one `requestAnimationFrame` animation of `window.scrollTo`; ignore/coalesce input while
  gliding; while gliding, `preventDefault` on wheel/touchmove/keys (non-passive listeners only in the
  hill-view band, i.e. scrollY < content-view offset). If the user lands mid-band (e.g. reload restores
  scroll, anchor jump, scrollbar drag), settle to the nearest state after scrolling stops (~150ms idle).
  Do not use CSS scroll-snap.
- Hero teaser fades/lifts during the glide as before.
- Reduced motion: no glide and no shrink; landing behaves like `header` mode (static), as today.
- "▼ SCROLL" hint at the bottom (stepped bounce) triggers the glide when clicked.

**`mode="header"` — every other page, and landing on mobile (< 760px):**
- Static header, height 42vh, already in the sketch's end state: bottom faded 45% into `--page`.
- **Rev 3: content overlaps the hill.** The first window starts ~18vh from the top (`--overlap`), on top
  of the hill's lower half, so a post's title and first lines are visible without scrolling. Windows stay
  opaque. Mobile: start ~22vh (tune so the title is visible on a 375×812 screen).
- No scroll-linked JS. Scrolls away with the page.

## 4. Global chrome

### 4.0a Rev 3 scope: navigation chrome on the landing page only
**The taskbar, Start menu, task pane sidebar, mobile drawer and tray balloon exist only on `/`.**
Every other page (`/blog`, `/blog/[slug]`, `/cv`, `/contact`, `/availability`, 404) has **no taskbar and
no sidebar**: just the faded hill header, the window(s) overlapping it, and navigation **inside the window**:

| Page | In-window buttons (bottom of the main window, XP buttons) |
|---|---|
| `/blog` | Home · RSS (RSS can stay in the Explorer toolbar) |
| `/blog/[slug]` | ← All posts · Home |
| `/cv` | Open PDF · Download PDF · Home (existing) |
| `/contact` | Home · Blog |
| `/availability` | ← Contact · Home |
| 404 | Home (existing) |

**No theme toggle on sub-pages**: the theme is chosen on the landing page (tray / task pane) or follows
the OS, and persists via localStorage. The window title-bar controls and the
"you closed them all" card keep working (Restore all is the way back). Rules below in §4.0–§4.4 now
apply to the landing page only.

### 4.0 Navigation swap: taskbar ↔ task pane (rev 2; landing only since rev 3)
- **On the landing page**, the **taskbar** (4.1) is shown until the desktop glide reaches the content view, or until the bottom of the static hill passes on mobile and with reduced motion.
- **Once you scroll past that point**, the taskbar fades/slides away (stepped, short) and an
  **XP Explorer task pane sidebar** (4.4) fades in on the left. Scrolling back up reverses it.
- Reduced motion: swap instantly, no animation.
- Implement with an IntersectionObserver on a sentinel at the hill's bottom (or the existing scroll
  progress on landing), not a per-frame scroll handler. Only one of the two navs is in the
  accessibility tree / tab order at a time (`inert` or `hidden` on the inactive one).
- **Mobile (< 760px):** taskbar fades the same way; instead of a sidebar, a small fixed button
  (e.g. bottom-left mini "start"/folder button) opens the task pane as a slide-in **drawer**
  (focus trapped, Escape and backdrop click close, returns focus to the button).

### 4.1 Taskbar (landing only)
- Fixed to bottom, full width, XP Luna taskbar look (blue gradient bar).
- **Start button** (green, "start") opens a **Start menu** with: Home `/`, Blog `/blog`, CV `/cv`,
  Contact `/contact`, RSS `/feed.xml`. Real `<Link>`s. Menu closes on outside click, Escape and
  navigation; keyboard accessible (focus moves into menu, arrow keys nice-to-have, Escape returns focus
  to Start). Start button has `aria-expanded` / `aria-controls`.
- **Window buttons** in the middle: one per window registered on the current page (title + icon optional).
  Clicking restores a minimized/closed window (see 4.2). Active page window can look "pressed".
- **Tray** on the right: theme toggle (sun/moon icon button, `aria-label`, `aria-pressed`) and a clock
  (HH:MM, local time; render only after mount to avoid hydration mismatch).
- Page content gets bottom padding equal to taskbar height so nothing hides behind it.
- **Mobile (< 760px):** compact — Start, toggle, clock only (window buttons hidden).

### 4.2 Windows
- New `XpWindow` component (replaces `Win98Window`) using xp.css markup:
  `.window > .title-bar(.title-bar-text, .title-bar-controls) > .window-body`, optional `.status-bar`.
- Controls: Minimize collapses to title bar (or hides body), Maximize restores, Close hides the window.
  `aria-label` on each control button.
- Keep the window manager (rename `XpWindowManager`) and the joke: closing every window shows the
  "you closed them all! happy with yourself?" card with "Restore all".
- Taskbar buttons restore hidden/minimized windows.
- **No dragging, no z-order stacking.** Windows sit in normal document flow.
- Use stable, explicit window ids (not `useId`) so state is predictable across navigations.
  Hidden state may reset on route change (implementer's choice; document it).

### 4.3 Footer
None beyond the taskbar. `© {year} Sina Bastani` can live in a window status bar or the Start menu.

### 4.4 Task pane sidebar (rev 2)
- Styled after the XP Explorer left task pane: blue gradient pane background, rounded collapsible
  group boxes with a header bar (bold Trebuchet) and a chevron toggle.
- Groups:
  - **Places:** Home `/`, Blog `/blog`, CV `/cv`, Contact `/contact`, RSS `/feed.xml`, each with a
    small icon (inline SVG or CSS; no external icon sets). `aria-current="page"` on the current route.
  - **Other:** theme toggle ("Dark mode" / "Light mode"), and restore buttons for any closed/minimized
    **content** windows on the page (replaces the taskbar's window buttons while the pane is active).
    The `hi.exe` teaser is **never** listed here (rev 3); it is reopened only from the hill view
    (desktop icon, or its taskbar button when minimized).
  - Optional **Details** group: `© {year} Sina Bastani`.
- Sticky, ~200–220px wide, **in the left margin** (rev 3): the content column is centred in the
  **viewport** at all times (taskbar or pane), so windows line up under the symmetric hill. When the
  viewport is too narrow for column + pane + gutters (roughly < 1240px), the column shifts right just
  enough to clear the pane (never overlapping it); below 760px the drawer is used instead.
- `<nav aria-label="Primary">`; group toggles are buttons with `aria-expanded`.

### 4.5 Desktop icon and tray balloon (landing only, rev 2)
- **Desktop icon `hi.exe`:** an XP desktop icon (memoji image + label "hi.exe", white label with text
  shadow) in the top-left area of the full-screen hill. Visible **only while the hero window is closed**.
  Double-click (desktop) or single tap / Enter / Space (touch & keyboard) reopens the hero window.
  It is a real `<button>` with an accessible name ("Open hi.exe").
- **Caption (rev 3: subtle):** when the hero window is closed, show "enjoy the scenery ☁" over the hill:
  small (~15–16px), regular weight Verdana, white at ~85% opacity with a soft (not hard, not bold)
  text-shadow, placed low-centre above the hint rather than mid-screen. Hidden again when the window reopens.
- **Tray balloon:** a classic yellow XP notification balloon pointing at the tray, shown once per visitor
  (`localStorage` flag, wrapped in try/catch) ~4s after load if the hero is still open and the user is at
  the top: title "psst…", text "try closing the window, the view is nicer". Has its own small ✕, auto-hides
  after ~10s or when the hero is closed. `role="status"`. Under reduced motion it still shows,
  without the pop animation.
- Closing the hero does **not** trigger the "you closed them all" joke (that stays for the content windows
  below the hill). The hero is excluded from the all-closed check.

## 5. Routes and pages

`?tab=` routing is removed. Old URLs redirect permanently:
`/?tab=blogs` → `/blog`, `/?tab=contact` → `/contact`, `/?tab=home` → `/`.

| Route | Scene | Content |
|---|---|---|
| `/` | `intro` (desktop) / `header` (mobile) | `hi.exe` over the hill; below: stacked About me and Latest posts |
| `/blog` (new) | `header` | Explorer-style archive window |
| `/blog/[slug]` | `header` | Single window with date, title, and article |
| `/contact` (new) | `header` | Contact window(s) incl. availability |
| `/cv` | `header` | WordPad résumé with print, PDF, and Markdown actions |
| `/availability` | `header` | Existing availability page in an XP window |
| Unknown URL | `header` | XP error window and faded hill, with HTTP 404 |
| `/anita` | — | **Untouched** (outside `(main)`, own styling) |

### 5.1 `/` — Landing
- Server component; no `useSearchParams`. Fully static HTML (no "Loading..." fallback).
- **Hero teaser `hi.exe`** (rev 3: compact glass card) centred over the full-screen hill, taskbar visible below:
  - ~320px wide (max `calc(100vw - 32px)`), a teaser, not a content window.
  - Title bar: XP Luna title bar **"hi.exe"** (normal xp.css size).
  - Body: **frosted glass** like the sketch's card: `background: rgba(255,255,255,.16)`,
    `backdrop-filter: blur(6px)` (with `-webkit-` prefix), thin light border (`rgba(255,255,255,.55)`),
    soft hard-offset shadow. Hills visible through it. Night: same idea, slightly darker tint
    (e.g. `rgba(10,16,48,.28)`). Provide an opaque-ish fallback when `backdrop-filter` is unsupported.
  - Content: memoji ~72px (`next/image`, `loading="eager"`), **"hi! 👋"** ~28px **regular weight**
    (not bold), hint **"(you can close me, the view is nicer)"** ~13px. Text white with a soft shadow
    for legibility over sky/clouds (check contrast against the brightest clouds).
  - Controls: Minimize → window goes to its taskbar button (click to restore); **Maximize does nothing**
    (decorative: `tabIndex={-1}`, `aria-hidden`, so it never takes keyboard focus);
    Close → hides it and shows the desktop icon + caption (4.5).
  - Still fades/lifts on scroll as before.
- Content view (see §3.1): **one column centred in the viewport** (rev 3; the task pane sits in the
  left margin and must not push the column off-centre), stacked:
  - **About me window:** memoji, **"Sina Bastani"** (h1), tagline **"Human. Developer. Can't properly
    work with printers."**, "i'm Sina." can go, **hard-coded** status pill "Current Status: in a project"
    with pinging dot (respect reduced motion), "View CV" button → `/cv`.
  - **Latest posts window:** 3 most recent posts (title link, date, excerpt) + "All posts" → `/blog`.

### 5.2 `/blog` — Archive
- Server component, static.
- One **Explorer-style XP window** titled e.g. "My Blog":
  toolbar row with an **RSS** button (`/feed.xml`), optionally an address bar showing `/blog`
  (decorative); body is a list/details view, one row per post: **title (link), date, excerpt**.
- Empty state: "No blog posts yet."
- Hidden posts excluded (existing `getAllBlogPosts()` behaviour).

### 5.3 `/blog/[slug]` — Post
- Keep static generation (`generateStaticParams`, `dynamicParams = false`) and `generateMetadata`.
- Static faded hill header, then **one single window** (rev 2; no separate title window):
  - Title bar: the post title.
  - Inside, at the top: date (Lucida Console meta, uppercase like "20 NOV 2026") and the post title as
    the page's `<h1>` (Trebuchet bold). No read time, no series.
  - Then `div.blog-post-content` with sanitized HTML, then "← All posts" (`/blog`) and "Home" (`/`) links.
- Restyle all `.blog-post-content` elements for both themes: p, h2 (Trebuchet stack, accent colour),
  h3, a, lists, blockquote (6px accent left border, italic, muted), `pre`/code (hard shadow, 3px border,
  hljs themes for day/night), `hr` (3px dashed), tables (`.blog-table-scroll`), images, spacers.
- Not-found branch restyled.

### 5.4 `/contact` — new
- Content from today's `ContactTab`: copy, mailto `contact@sinabastani.dev`, socials (LinkedIn, GitHub,
  Instagram + Letterboxd, Spotify sentence), and the `AvailabilityWidget` (can be always visible or
  behind the existing toggle — implementer's call).

### 5.5 `/cv`, `/availability`
- **CV (rev 6):** a single `cv.doc - WordPad` window with decorative menus and ruler, live Print/PDF/Copy as Markdown actions, an XP status bar, and a centred Home button. The paper has a header and a two-column layout (skills and contacts at left, profile and experience at right), with a single column on mobile. Print emits only the document on A4. Phone details remain in the unchanged PDF only.
- **Availability:** the standalone calendar is shown directly in an XP window.

## 6. Responsive

Breakpoint **760px** (sketch). Below it:
- Scene is always static (42vh, faded); the landing teaser and content stay stacked without a glide, and the hint is hidden. Sub-pages overlap their faded hill, with the first window at about 22vh.
- Windows full width, stacked, with 16px side gutters; no horizontal scroll.
- Taskbar compact (Start, toggle, clock) while the hill is in view; past it, the taskbar fades and the
  task pane is reachable as a drawer (4.0).
- Desktop icon and caption still work on the landing hill; the tray balloon points at the compact tray.
Body text is approximately 15px with 1.6 line-height; use the stacks in §2.2.

## 7. Accessibility & quality bars
- Landmarks: `<header>` (scene/hero), `<main>` for windows, `<nav>` for the active taskbar or task pane.
- Skip link to main content.
- Visible focus styles on all interactive elements (xp.css + custom).
- Contrast AA in both themes (check muted/accent on page and window backgrounds).
- Reduced motion respected everywhere (scene, hint, status ping, any transitions).
- No hydration warnings in the console; no theme flash on load (keep the inline pre-paint script).
- `bun run build` passes.

## 8. Out of scope
- Window dragging / stacking / additional desktop icons.
- Read time, series, tags, cover images in blog frontmatter.
- Pre-rendering the scene to static SVG (possible later optimisation).
- Changes to `/anita`’s appearance or behavior, the CMS content model, or the availability API’s behavior.

## 9. Rev 4 changes (third review, 2026-11-20)
These override the earlier sections where they conflict.

- **Landing content view (§3.1):** the glide ends with the **About me title bar at the top of the
  viewport** (~12px gap, aligned with the task pane's top). The hill is scrolled out of view in the
  content view. Glide back up still returns to the full hill view. Sub-pages keep the 18vh overlap.
- **Task pane groups (§4.4):**
  - **Places:** unchanged.
  - **Appearance:** a Luna-style **pill switch** for night mode (☀ ··· ☾): glossy blue track when on,
    beige thumb, `role="switch"` + `aria-checked`, label "Night mode", keyboard Space/Enter toggles,
    visible focus ring. Replaces the "Dark mode / Light mode" text button.
  - **Closed windows:** appears **only** when at least one content window is closed or minimized;
    lists "Restore <title>" buttons (never `hi.exe`).
  - The "Other" and "Details" groups are removed. `© {year} Sina Bastani` becomes small muted text
    under the last group, outside any group box.
  - Same structure in the mobile drawer.
- **Mobile nav hint (§4.0):** a yellow XP balloon pointing at the drawer launcher, text
  "your menu lives here". Shown **at most once per visitor**, only if the launcher has been visible for
  ~6s without being tapped. Once the launcher is tapped (ever), never show it (localStorage flag,
  try/catch). Auto-hides after ~8s, has a ✕, `role="status"`, no pop animation under reduced motion.
- **Button rows (§4.0a):** the in-window button rows at the bottom of sub-page windows (and "View CV" /
  "All posts" on landing) are **centred** horizontally.
- **Contact (§5.4):** the Contact window's content is centred (heading, text, Contact me button,
  social links, sentence, buttons). The **Availability** calendar is hidden by default behind a
  "View availability" XP button in the Contact window (toggle: "Hide availability"); when shown, the
  Availability window appears below. `aria-expanded`/`aria-controls` on the toggle. `/availability`
  (standalone page) keeps showing the calendar directly.

## 10. Rev 5 changes (fourth review, 2026-11-20)
These override earlier sections where they conflict.

- **Status (§5.1):** the About me status comes from one config value (e.g. `SITE_STATUS` in
  `src/lib/site.ts`): `{ state: "busy" | "available", label: string }`. `busy` → **red** dot,
  default label "in a project"; `available` → **green** dot, e.g. "open to new projects". Text reads
  "Current Status: <label>". Dot colours AA-visible in both themes; ping respects reduced motion.
  Default today: `busy` / "in a project" (red, as on `main`).
- **Contact pixel-art desk (§5.4):** the Contact window gets a pixel-art illustration in the hill
  scene's style (8px-ish grid, Bayer-dithered shading, limited palette): a desk with a beige CRT
  monitor showing the memoji (or a pixel version of it) / a blinking cursor, a coffee mug with stepped
  pixel steam, maybe a small plant. Inline SVG or canvas generated in code (no external assets), crisp
  (`image-rendering: pixelated`), ~240–320px wide, centred above "Let's link up!". Day/night palettes
  (night: screen glow, darker desk). Stepped animations (cursor blink, steam) off under reduced motion.
  `aria-hidden` / decorative. Must not dominate on mobile (scale down to ~200px).
- **Closing-all easter egg → scenery mode (all `(main)` pages):**
  - When every content window on a page is closed (never counting `hi.exe`), show a small XP dialog
    window "Desktop" with: "wanna enjoy the scenery instead?" and two choices (Escape restores):
    **[Show me the hills]** (default/primary) and a subtle **"restore windows"** text link/button.
    This replaces the old "you closed them all! happy with yourself?" card.
  - **Show me the hills:** reveal a fixed, unfaded `100dvh` scene with a one-shot stepped animation
    (~600ms). Resize and theme changes do not replay it. The viewport-sized pixel grid preserves the
    hill/sky proportions in portrait and landscape, with the moon anchored in the visible upper-right.
    Show the subtle caption "enjoy the scenery ☁" and, low in a
    corner, a subtle "restore windows ↺" button (small, muted, Verdana, no heavy chrome). No desktop icons.
    Scrolling is locked to that view while in scenery mode (no content below to scroll to).
  - **restore windows** (from the dialog or from scenery mode) reopens all content windows and returns
    to the normal layout (focus to `#main`).
  - Landing: in scenery mode the taskbar is shown (hill view rules). Reduced motion: instant switch.
  - Scenery mode is per page view (not persisted).
- **RSS on /blog (§5.2):** replace the toolbar strip + "RSS" button with a **subtle RSS icon** like the
  old site: a small orange square glyph (14px, `#ff8c00`, white arcs + dot; CSS or inline SVG), no
  toolbar background. Place it at the top-right of the archive window body, inline with nothing heavy
  around it, as a link to `/feed.xml` with `aria-label="RSS feed"` and `title="RSS feed"` (optionally a
  small "RSS" text next to it in muted colour). Keep the Home button row at the bottom.

## 11. Landing Home and Contact polish

- Home in the landing Start menu or task pane glides to the content and focuses `#main` in desktop glide mode. On mobile and with reduced motion it returns to the hill and focuses the header. If scenery mode or the closed-window dialog is active, it restores the content windows first and leaves `hi.exe` unchanged. Other pages keep their normal Home links.
- The `hi.exe` greeting is 21px; its lower-opacity 12px note has a soft shadow and no backing, and the memoji stays 72px.
- Contact shows a crisp terminal illustration to the right of left-aligned text from 760px up. Below that it sits above centred text. Availability and navigation actions stay centred below the row.
- Unanchored landing visits start at the hill, including reloads and history navigation; `/#main` remains usable and sub-pages retain native scroll restoration.
- WordPad has Home at the start of its toolbar and at the bottom. Mobile keeps visible short labels beneath its icons.
- Contact’s off-the-clock line links to Letterboxd and Spotify.
