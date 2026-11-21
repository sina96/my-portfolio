# AGENTS.md

Guidance for coding agents working on this repo: Sina Bastani's personal site. It's a Next.js App Router
site styled as a Windows XP desktop over procedural pixel-art hills ("XP Hills"), with a blog, CV,
contact/availability page, and a password-protected Sveltia CMS.

**Read before UI work:** [`docs/specs/xp-hills/SPEC.md`](docs/specs/xp-hills/SPEC.md) is the source of
truth for the design and behaviour. Keep it in sync when you change behaviour.

## Commands

```bash
bun install          # Node 24 + the Bun version pinned in package.json
bun run dev          # dev server (Turbopack); bun run dev:webpack for Webpack
bun run build        # production build
bun run start        # serve the build (use PORT=xxxx to avoid clashing with a running dev server)
bun run lint         # ESLint flat config (eslint.config.mjs); 2 known <img> warnings in /anita
bun run typecheck    # tsc --noEmit
bun run test         # Vitest (tests/*.test.ts); bun run test -t "name" for one test
```

CI (`.github/workflows/ci.yml`) runs `bun install --frozen-lockfile`, lint, typecheck, test, build.
Run all four before calling a task done. Renovate opens dependency PRs on Mondays; majors are disabled.

## Project map

```
src/
  proxy.ts                    # Next 16 "middleware": /admin Basic Auth + 308s for legacy /?tab=
  lib/
    site.ts                   # SITE_URL, social links, CONTACT_URL, SITE_STATUS, SITE_ROLE_LINE, SITE_NOW
    theme.ts                  # theme store (useSyncExternalStore) used by useTheme()
    basicAuth.ts              # constant-time admin credential check
    jsonLd.tsx, shareImage.tsx, xml.ts
  app/
    layout.tsx                # root: fonts, pre-paint theme script, ALL (main) CSS imports
    not-found.tsx             # XP error window (inside XpShell)
    sitemap.ts, robots.ts, opengraph-image.tsx, feed.xml/route.ts, cv.pdf/route.ts
    api/availability/         # route.ts + ics.ts (server-only calendar parsing)
    admin/[[...path]]/route.ts# Sveltia CMS (HTML, config, editor components) behind Basic Auth
    anita/                    # private page, Tailwind, must stay visually unchanged
    (main)/                   # the XP desktop
      XpShell.tsx, layout.tsx # shell + window manager for all public pages
      page.tsx                # landing: sina.exe over the hill, Latest posts, About me
      blog/, cv/, contact/ (CardTable mascot and slots), availability/
      components/             # HillScene, XpWindow(+Manager), Taskbar, TaskPane, DesktopNavigation,
                              # HomeHero, DesktopIcon, XpNavLink, TrayBalloon, PixelDesk (parked), BlogList, AvailabilityWidget, navPlaces
      hooks/                  # useLandingGlide, useLandingVisit, useWallpaperScroll, useReadingTaskbar, useTheme
      utils/                  # hillScene.ts, pixelDesk.ts (pure, seeded generators), sanitizeHtml.ts
      data/                   # blogPosts.ts, cv.ts, availability.ts (server-side loaders)
      *.css                   # site (tokens), hills, scenery, hero, navigation, panels, blog, pixelDesk
  content/blog/*.md           # posts (CMS writes here)
  content/cv/                 # sina-cv.md (source) + sina-cv-pdf.pdf
tests/                        # content, cv, hillScene, pixelDesk, blogMail, basicAuth, availabilityCache
docs/specs/xp-hills/          # SPEC.md (current design) + sketch.html (scene technique reference)
docs/howto/, docs/changelogs/, docs/archive/   # how-tos, dated change notes, history
```

## Invariants and gotchas

These cost time during the redesign. Don't regress them.

**Layout and navigation**
- All XP pages share the Primary taskbar and tray theme toggle. It's always visible on `/`; on
  sub-pages `useReadingTaskbar` auto-hides it while reading, with keyboard bridges around the inert
  bar. Only the desktop landing content view has a Places pane. Keep sub-page in-window nav rows.
- Every XP page has a fixed viewport-grid wallpaper behind its windows (sub-pages: static 30% veil, no
  transition). On the landing, `useWallpaperScroll` drives the half-screen visual transition and pauses ambient motion at full dim.
  `useLandingGlide` keeps the desktop hill/content stops; mobile scrolls natively and only snaps
  before the first-window stop (12px from the top) when no touch is active. Reduced motion has no
  parallax, glide or snap.
- `/` without a hash always opens at the hill view (manual scroll restoration on the landing only).
  Other pages keep native restoration.
- Home on `/` restores all windows first, then glides (desktop) or
  scrolls to the top (mobile, reduced motion). Logic lives in the window manager, not in the nav components.

**Windows**
- Every `XpWindow` needs a stable, explicit `id`. State resets per route.
- Minimize hides the whole window after a stepped taskbar outline (instant with reduced motion).
  Close also removes its task button. Maximize is decorative.
- `desktopApp` excludes the hero from the closed-all count, but Restore all and Home reopen it too.
  One closed content window gets a partial restore link; all closed content windows show the shared
  “Desktop” dialog. Scenery starts only from “Show me the hills”; its reveal is one-shot.
- Mobile window title bars stick inside the window, except the hero and in print.

**Hill scene and pixel art**
- Generators are pure and seeded (`mulberry(1987)`). The determinism tests in `tests/` must keep passing.
  If you change output on purpose, update them.
- Theme comes from `data-theme`, never `prefers-color-scheme` directly. Motion uses `steps()`, and
  everything is off under `prefers-reduced-motion`.

**Styling**
- All `(main)` CSS and `xp.css` are imported once in `src/app/layout.tsx`. That avoids unused-preload
  warnings and keeps CSS order stable. `xp.css` styles bare `button`s globally. If you touch CSS
  loading, confirm `/anita` is pixel-identical (it has its own Tailwind in `anita/anita.css`).
- Use the tokens in `site.css` (`--page`, `--ink`, `--muted`, `--accent`, `--link`, `--line`,
  `--window-body`, `--heading`, `--chrome`, `--mono`). Keep AA contrast in both themes.
- `xp.css` also paints `[role="tabpanel"]` (and other widgets) with fixed light gradients. When you
  use ARIA widget roles inside themed windows, override their background or dark mode breaks.
- Fonts are system first (Trebuchet / Verdana / Lucida Console), with `next/font` fallbacks (Fira Sans,
  PT Sans, IBM Plex Mono) that are **not preloaded**.
- `<html>` has `data-scroll-behavior="smooth"`. Keep it, or Next warns on route changes.

**Hydration and theme**
- The inline pre-paint script in `layout.tsx` sets `data-theme` before paint. Don't read localStorage
  in render. Use `useTheme()` in client components and `[data-theme]` selectors in CSS.
- Render clocks and other time- or storage-dependent UI after mount only. Wrap all storage access in try/catch.

**Status dot:** change availability by editing `SITE_STATUS` in `src/lib/site.ts` (`busy` = red,
`available` = green). Don't hard-code colours elsewhere.

## Content

**Blog** (`src/content/blog/*.md`, loader `data/blogPosts.ts`)
- Frontmatter: `title`, `date` (`YYYY-MM-DD`), `excerpt` required, optional `hidden: true`. Posts with an
  invalid date or `hidden: true` are excluded everywhere (lists, routes, static params, RSS, sitemap).
- Rendering goes through `renderBlogMarkdown()`: sanitized HTML, highlight.js, tables wrapped in
  `.blog-table-scroll`, CMS spacer markers. Keep typography scoped to `.blog-post-content` (`blog.css`).
- Posts and the `inbox.exe` archive are static (`generateStaticParams`, `dynamicParams = false`).
  `blog/mailState.ts` groups published dates into years and keeps up to 200 read slugs in browser
  storage after hydration. No frontmatter changes. Keep article styles scoped independently of
  inbox/message chrome; RSS stays static.
- Authoring and CMS guide: `docs/howto/ADDING_BLOG_POSTS.md`. Uploaded images go to `public/images/blog/`.
- Showcase posts exist for manual validation. Don't treat them as product content.

**CV** (`/cv`, WordPad window)
- Source: `src/content/cv/sina-cv.md` (OhMyCV frontmatter: name, role, links). `data/cv.ts` parses it
  with its own `new Marked()` instance into header, sections, skills, update date and copy-safe Markdown.
- Expected Markdown shape (keep it when you replace the CV with a new export):
  - `## Section` headings split the document; the main column follows file order.
  - A skills section (`## Core Skills`, `## Skills`, or `## Skills & Merits`) made only of
    `**Label:** a, b; c` lines becomes sidebar tag groups. Otherwise its HTML is shown as is.
  - A one-line `## Languages` list (`Swedish (fluent), English (fluent)`) moves to the sidebar.
  - OhMyCV `~ dates | place` lines (after a bold line or under a `###` entry heading) render as muted meta.
  - `<!-- LAST UPDATED: 20 Nov 2026 -->` feeds the status bar; values without a digit are ignored.
- **Phone numbers must never reach the web page or the copied Markdown** (tests cover this). The PDF
  (`/cv.pdf`) is served unchanged.
- Layout and A4 print rules: `cv/wordpad.css`.

**Availability**
- `/api/availability` → `ics.ts` reads `AVAILABILITY_ICS_URLS_JSON` (remote feeds) and/or
  `AVAILABILITY_ICS_FILE_PATHS_JSON` (files under the gitignored `private/availability/`). Missing or
  all failed sources fall back to mock data; failed loads are logged once per retry window. The API
  deduplicates source fetches across weeks. Healthy CDN responses cache for five minutes; partial or
  mock responses cache for at most one minute.
- `/contact` mounts the widget on first "View availability" and keeps its state. `/availability` shows it directly.

## Security rules

- HTML from Markdown/CMS goes through `sanitizeHtml()` before `dangerouslySetInnerHTML`. No exceptions.
- Validate slugs (`/^[a-zA-Z0-9_-]+$/`) and verify resolved paths stay inside their directory (blog
  loader, ICS files).
- `/admin` is protected twice: by `proxy.ts` and inside the route handler (`adminAuthFailure`). It
  fails closed when credentials are unset, the password is a placeholder, or it is under 16 characters.
  CMS config and editor components are
  served from the route, not `public/`, so they can't bypass auth. The Sveltia script is pinned with SRI.
  When bumping it, update the `integrity` hash.
- Security headers live in `next.config.mjs` (HSTS, `X-Frame-Options: DENY`, nosniff, Referrer- and
  Permissions-Policy, no `X-Powered-By`). Public CSP is enforced in production and report-only in dev;
  it uses Next's nonce-free static rendering policy. `/admin` is excluded from the public CSP.
- External links: `target="_blank" rel="noopener noreferrer"`.
- Never commit `.env*` (only `.env.example`), private ICS URLs or files, or personal data such as the
  phone number. Don't log secrets or calendar contents.
- Keep `next` patched: run `bun audit` when touching dependencies.

## Code style

- TypeScript strict. Interfaces for props and data models, union types for string states,
  `import type` for types, named imports. Group imports: React/Next → third-party → local.
- 2-space indent. JSDoc on exported functions. Inline comments only for non-obvious logic.
- Pages are server components. Interactive chrome and widgets are `"use client"` components.
  `useLayoutEffect` for DOM mutations that would flicker. Pure state initializers.
- Validation returns discriminated unions (`{ valid: true; … } | { valid: false }`). Invalid data
  → `console.warn` + graceful fallback, never a crash.
- Accessibility: semantic landmarks, `aria-label` on icon-only buttons, `aria-current` in nav, visible
  focus, keyboard parity for every pointer interaction, decorative art `aria-hidden`.

## Verifying UI changes

Unit tests don't cover layout. For visual work, build, run `PORT=3999 bun run start`, and check in a
real browser (or headless Chrome via Playwright) at **1440×900 and 375×812**, **day and night**, plus
reduced motion. The landing glide, scenery mode and Home behaviour need interaction, not just
screenshots. Stop only the server you started (by port). Don't kill other `next` processes.

## Docs

- `docs/specs/`: current design specs. `docs/howto/`: guides. `docs/changelogs/`: dated user-facing
  change notes (compact list). `docs/archive/`: history (including the XP Hills task handoffs).
- Keep README links pointing at the active docs.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
