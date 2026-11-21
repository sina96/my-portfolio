# Task 13: `sina.exe` hero with desktop icons, layout below the hills

**Branch:** `landing-v2`, on top of uncommitted Task 12. Leave changes uncommitted.
**Read first:** `LANDING-V2.md`, `TASK-12-wallpaper.md` (Decisions log), `SPEC.md` §6.
After the task: `bun run lint && bun run typecheck && bun run test && bun run build`. Update `SPEC.md` §6
(`hi.exe`, About me) and the AGENTS.md project map if files are added.

Owner: "use that transparent card for a first impression … CV, Contact, Blog right away." /
"when people scroll down we urge them to see the latest blog posts. That should be the main centre and the
about me should be more about me and to the side."

## 0. Follow-up from Task 12 (verification, 2026-11-21)
The mobile snap's "content" target is `T` (half a screen). At rest there, the top half of the phone is empty
dimmed sky and the first window starts mid-screen, which reads as a layout bug. Keep the transition maths
(`p` still completes at `T`), but make the **content snap target the first landing window's top − 12px**
(the mobile equivalent of the desktop glide's content stop, measured, re-measured on resize). The snap band
becomes `0 < scrollY < contentStop`; releases nearer the top go to `0`, otherwise to `contentStop`.
Never snap once `scrollY ≥ contentStop`. Update `useWallpaperScroll.ts` and SPEC §2 accordingly.

## 1. Hero window `sina.exe`
`components/HomeHero.tsx`. Keep `HERO_ID = "home-hero"` (balloon storage keys depend on it). Title `sina.exe`.
Keep the frosted glass body (hero.css), maximize decorative, close working.

```
┌ sina.exe ──────────────────── _ □ x ┐
│             [memoji 64px]           │
│            Sina Bastani             │  ← the page's <h1>
│    Developer (human) · Stockholm    │  ← SITE_ROLE_LINE
│                                     │
│     [doc]      [mail]     [note]    │  ← desktop icons
│       CV       Contact     Blog     │
│                                     │
│          scroll for more ↓          │
└─────────────────────────────────────┘
```
- Add `SITE_ROLE_LINE = "Developer (human) · Stockholm"` to `src/lib/site.ts` (owner may tweak wording).
- No status dot, no social icons, no "(you can close me…)" note in the card (the tray balloon keeps the
  closing hint).
- Width: ~360px desktop, `min(100% - 32px, 360px)` mobile. Text on glass: white with the existing soft
  text-shadow; must stay readable over the light and dark scene.

## 2. Desktop icons (new reusable component)
`components/DesktopIcon.tsx`: an XP desktop shortcut, used here and later on sub-pages (Task 16).
- Props: `href`, `label`, `icon` (union `"cv" | "contact" | "blog" | …`), optional `external`.
  Renders a Next `<Link>` (or `<a target="_blank" rel="noopener noreferrer">` when external).
- **Original pixel-art icons** as inline SVG on a 16×16 grid drawn at 2× (32px; 40px on mobile),
  `shape-rendering="crispEdges"`, `aria-hidden`. Draw your own simple glyphs: CV = page with folded
  corner and text lines; Contact = envelope; Blog = notepad with a pencil. 3–4 colours each, XP-ish
  palette, readable on light and dark glass. No copied Windows icon art.
- Label under the icon, ~13px, white with text-shadow (XP desktop style).
- States: hover/focus-visible → label gets the XP selection highlight (`#316ac5` background, white text)
  and the icon a blue tint overlay (like a selected XP icon); `:active` nudges 1px. Visible focus ring.
- One tap/click navigates (no double-click requirement on the web).
- Hit area ≥ 88×88 on mobile, ≥ 72×72 desktop. The three icons sit in one centred row at 375px.

## 3. Scroll hint inside the card
Replace the standalone `▼ SCROLL` hint (`hill-hint` in `HillScene.tsx` / hills.css) with a small text
button at the bottom of the card: "scroll for more ↓". It does what the hint did: desktop glide → content;
mobile → smooth scroll to the content snap target (§0). One stepped bounce on first show
(off under reduced motion). Keep it keyboard reachable.

## 4. Layout below the hills
`src/app/(main)/page.tsx` + panels/site CSS.
- Window order in the DOM: **Latest posts first, then About me** (mobile reading order and a11y order).
- **Desktop ≥1100px**: task pane (existing, left margin) | Latest posts (wide, ~640–720px) | About me
  (narrow, ~280–320px, sticky top is optional). The pair is centred in the viewport; must not overlap the
  pane at 1100–1440px. **760–1099px**: Latest posts full width, About me below. **<760px**: stacked,
  16px gutters.
- **Latest posts**: show **5** posts (`getAllBlogPosts().slice(0, 5)`), keep "All posts".
- **About me** (title stays "About me"):
  - small memoji (~56px), `SITE_TAGLINE` as the short bio;
  - status line "Current Status: {label}" with the dot (move from the old window, same `SITE_STATUS`);
  - a "now" list from a new `SITE_NOW` in `site.ts`: `{ label: string; value: string }[]`, rendered as a
    compact definition list (`label:` muted mono, value normal). Seed with clear placeholders for the
    owner to fill:
    `building: "TODO: fill me in"`, `reading: "TODO: fill me in"`, `listening to: "TODO: fill me in"`,
    `based in: "Stockholm"`. Entries with an empty value are not rendered.
  - Remove "View CV".
- Heading levels: the hero name is the only `<h1>`; window contents use `h2` and below.

## Acceptance
- [x] 375×812 day/night: card shows memoji, name, role line, three icons in one row, scroll hint; readable
- [x] Icons: hover/focus highlight, keyboard reachable, tap navigates; ≥88px targets on mobile
- [x] "scroll for more ↓" glides (desktop) / scrolls to the content (mobile)
- [x] 1440×900: pane | wide Latest posts (5) | narrow About me, no overlap; 900px: stacked; 375px: posts then about
- [x] About me shows bio, status dot, "now" list from `SITE_NOW`; no View CV
- [x] One `<h1>` on `/`; lint/typecheck/test/build pass

## Decisions log

- The same measured nav sentinel defines the scroll-hint and mobile snap destination. At 375×812 the mobile stop is 800px and after resizing to 390×844 it is 832px. Both put Latest posts at y=12px; the visual transition still completes in half a screen. Chrome verified a held drag doesn't snap, release near either end settles correctly, and scrolling beyond the content stop stays native.
- Chrome passed single-tap navigation to CV, Contact and Blog at 375px, and keyboard/hover selection on desktop. Reviewed day and night screenshots; the day glass uses a translucent navy tint so white text stays readable over clouds.
- At 1440px Latest posts is 691px wide and About me 317px; at 1100px the posts column narrows to 511px to preserve the pane and gutters. At 900px and 375px the windows stack in posts-first order.
- The landing shows up to five published posts. This checkout has four published posts, so all four appear; no filler content was added. `SITE_NOW` retains the requested placeholders for the owner.
- Lint (two existing Anita warnings), typecheck, all 30 tests and production build passed. Both /anita screenshot baselines still match.
