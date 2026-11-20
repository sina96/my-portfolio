# Task: Implement the XP Hills redesign

> Historical baseline (rev 1). For the current hero, navigation, fonts, and post layout, see [TASK-2.md](./TASK-2.md) and [SPEC.md](./SPEC-revisions.md).

**Branch:** `redesign-xp-hills` (everything lands in this one branch; commit per phase).
**Read first:** [`SPEC.md`](./SPEC-revisions.md) (source of truth for design), [`sketch.html`](../../specs/xp-hills/sketch.html)
(technique reference for the hill scene; open it in a browser), and `AGENTS.md` (code style).
Where the sketch and SPEC disagree, SPEC wins. If something is ambiguous, pick the option closest to
SPEC, note it in the "Decisions log" at the bottom of this file, and keep going.

## Ground rules
- Package manager: **bun**. Sanity check after each phase: `bun run build` (plus `bun run lint`,
  `bun run typecheck`, `bun run test` once Phase 1 adds them).
- Follow `AGENTS.md`: named imports, `import type`, `"use client"` only on leaf interactive components,
  interfaces for props, sanitize before `dangerouslySetInnerHTML`, `rel="noopener noreferrer"` on
  external links.
- Server components by default. Data modules using `fs` (`data/blogPosts.ts`, `data/cv.ts`) stay server-only.
- Do **not** touch `/anita` behaviour or look, the availability API logic, or the CMS content model.
- Do not commit secrets or anything under `private/`.
- Commit messages: imperative, one per phase (e.g. `redesign: phase 2 hill scene`).

## Current state (summary of what exists)
- `(main)/page.tsx` → `HomeContent` (client, `useSearchParams`, `?tab=home|blogs|contact`) renders
  `Win98Nav`, `HomeTab`, `BlogsTab`, `ContactTab`, `LatestBlogsWindow`. Static HTML of `/` is only
  the Suspense fallback.
- `Win98Window` / `Win98WindowManager` (98.css) used by all `(main)` pages; manager provider is in
  `(main)/layout.tsx`.
- Theme: inline pre-paint script in `src/app/layout.tsx` sets `data-theme`; `hooks/useTheme.ts`
  holds per-instance state; `ThemeInitializer.tsx` is used on cv and blog detail.
- `globals.css` (~1335 lines) is imported in both root and `(main)` layouts, after `98.css` in `(main)`.
- Fonts in `(main)/layout.tsx`: VT323, Ubuntu Sans, IBM Plex Mono.
- `bun run lint` is broken (`next lint` no longer exists in Next 16).

---

## Phase 1: Foundations and cleanup
1. **Lint/typecheck/test tooling**
   - Delete `.eslintrc.json`; add `eslint.config.mjs` (flat config):
     ```js
     import nextVitals from "eslint-config-next/core-web-vitals";
     import nextTs from "eslint-config-next/typescript";
     import { defineConfig, globalIgnores } from "eslint/config";
     export default defineConfig([...nextVitals, ...nextTs,
       globalIgnores([".next/**", "node_modules/**", "next-env.d.ts", "docs/**"])]);
     ```
   - Scripts: `"lint": "eslint ."`, `"typecheck": "tsc --noEmit"`, `"test": "vitest run"`.
   - Add Vitest (`vitest`, `vitest.config.ts`, node env, `@` alias). Export the pure helpers from
     `data/blogPosts.ts` (`isValidSlug`, frontmatter validation, date normalization, shortcode expansion)
     and allow an optional content dir for tests. Tests to write:
     - invalid dates (`2026-02-30`), YAML Date values, `hidden: true` excluded, slug with `../` rejected
     - shortcodes ignored inside code fences
     - `sanitizeHtml` strips `<script>`, `onerror`, `javascript:` hrefs
     - feed XML escaping
     - hill scene generator is deterministic (same seed → same output) once it exists (Phase 2)
   - Bump `@types/node` to `^24` (engines say Node 24).
2. **Dependencies**: remove `framer-motion`, `tailwind-merge`, `98.css`; add `xp.css`.
3. **Site constants**: create `src/lib/site.ts` (`SITE_URL`, name, description, email
   `contact@sinabastani.dev`, socials list). Use it in root layout metadata, `feed.xml/route.ts`,
   contact, availability page, and later sitemap/robots/JSON-LD/Start menu.
4. **Theme store**: replace `hooks/useTheme.ts` with a shared external store (e.g. `src/lib/theme.ts`
   with `subscribe` / `getSnapshot` / `setTheme`) and a `useTheme()` hook built on `useSyncExternalStore`
   (server snapshot `null`). Source of truth is `document.documentElement.dataset.theme` set by the
   existing inline script. `setTheme` writes localStorage + attribute and notifies. Listen to the
   `matchMedia` change event (when nothing is saved) and to `storage` events. Delete `ThemeInitializer.tsx`
   and its usages. The toggle icon should be CSS-driven from `[data-theme]` so it never flickers.
5. **CSS scoping**: `globals.css` must be imported once. xp.css and the new site styles are imported
   **only** in `src/app/(main)/layout.tsx`. Move Tailwind directives so `/anita` keeps working
   (e.g. `src/app/anita/anita.css` imported by `anita/layout.tsx`) and `(main)` gets no Tailwind preflight.
   Verify `/anita` looks identical before and after (screenshot it first).
   Clean `tailwind.config.ts`: drop undefined font vars, unused animations, nonexistent content globs.
6. **`middleware.ts` → `proxy.ts`** (Next 16 name; export `proxy`). Extract the duplicated Basic Auth
   code from proxy and `admin/[[...path]]/route.ts` into `src/lib/basicAuth.ts`, comparing with
   `crypto.timingSafeEqual` over SHA-256 digests. Behaviour stays: fail closed when env vars are missing.
7. **Admin script pinning**: pin the Sveltia CMS unpkg URL to an exact version
   (in `admin/[[...path]]/route.ts`) and add `crossorigin` (+ `integrity` if feasible).
8. **next.config**: `poweredByHeader: false`; headers for all routes: `X-Content-Type-Options: nosniff`,
   `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`,
   `X-Frame-Options: DENY`, `Strict-Transport-Security: max-age=63072000; includeSubDomains`. No CSP in this task.
   Redirects (permanent): `/?tab=blogs` → `/blog`, `/?tab=contact` → `/contact` (use `has` query matching).
9. **CI** (`.github/workflows/ci.yml`): `bun-version-file: package.json`, `actions/setup-node` with
   Node 24, run lint, typecheck, test, build.

**Done when:** lint, typecheck, test and build all pass; `/anita` unchanged; admin still prompts for auth.

## Phase 2: Hill scene
1. Port the sketch generator into a pure module (e.g. `src/app/(main)/utils/hillScene.ts`): palettes
   (`THEMES.day/night` verbatim), Bayer dithering, `mulberry(1987)`, hill curves, clouds, shadows,
   glints/fireflies, stars, moon. Pure functions in, layer descriptions/dataURLs out, so it is testable.
2. `HillScene` client component, `mode: "intro" | "header"` (SPEC §3.1):
   - Theme from the shared theme store, re-render on change; no `prefers-color-scheme`/hash logic.
   - Solid themed sky fallback before the scene paints.
   - `intro`: sketch's scroll-shrink (100vh → 42vh, smoothstep fade to 45%, translateY afterward),
     rAF-throttled passive listener; exposes scroll progress (CSS var or callback) so the hero window
     can fade/lift. Below 760px, `intro` behaves as `header`.
   - `header`: static 42vh, fade 45%, no scroll JS.
   - Reduced motion disables all scene animation **and** the scroll hint.
   - `aria-hidden`, `pointer-events: none`.
3. Add the determinism test.

**Done when:** the scene matches the sketch visually in day and night (compare side by side), toggling
theme swaps scenes without reload, no console errors or hydration warnings.

## Phase 3: XP chrome
1. Fonts in `(main)/layout.tsx`: drop VT323, keep Ubuntu Sans and IBM Plex Mono; put font variables on
   `<html>`/`<body>` (root layout) so portals inherit them. Chrome uses the xp.css Tahoma stack;
   headings/meta use `ui-monospace, Menlo, monospace`.
2. Design tokens (SPEC §2.3) for both themes in the new stylesheet; night overrides for xp.css windows.
   Window bodies are **opaque** (no glass over dithered pixels). AA contrast for text, links, muted, accent,
   title-bar text and clock in both themes.
3. `XpWindow` + `XpWindowManager` (rename from Win98*), SPEC §4.2: xp.css markup, stable explicit ids,
   Minimize collapses, Maximize restores, Close hides, `aria-label` on controls, "you closed them all"
   card kept. Manager exposes registered windows and their state to the taskbar.
4. `Taskbar` (SPEC §4.1): fixed bottom; Start button + Start menu (Home, Blog, CV, Contact, RSS as
   `<Link>`, `aria-current="page"` via `usePathname`, `aria-expanded`/`aria-controls`, Escape closes and
   returns focus, outside click closes, closes on navigation); window buttons that restore windows;
   tray with theme toggle (`aria-label`, `aria-pressed`) and clock (client-only after mount).
   Compact on < 760px. Taskbar is `<nav aria-label="Primary">`; page content gets bottom padding.
5. Global: skip link ("Skip to content" → `#main`), `:focus-visible` styles visible in both themes and
   over the hills, `@media (prefers-reduced-motion: reduce)` covering scene, hint, status ping and
   smooth scroll.
6. Delete `Win98Nav`, `Win98Window`, `Win98WindowManager`, `HomeContent` and the old 98.css overrides
   in `globals.css` (rewrite the stylesheet; keep only what is still used).

## Phase 4: Pages and routes (SPEC §5)
Every route: server component page, `<main id="main">`, exactly one `<h1>`, own `metadata`
(`title`, `description`, `alternates.canonical`). Remove `alternates.canonical` and `openGraph.url`
from the root layout so they are not inherited.
1. **`/`**: `HillScene mode="intro"`, hero window (name + tagline) fading on scroll, then intro window
   (memoji via `next/image`, "i'm Sina.", hard-coded status pill, View CV) and latest-posts window
   (3 posts, "All posts" → `/blog`) side by side, stacked when narrow. No `useSearchParams`, no Suspense
   fallback; static HTML must contain the real content.
2. **`/blog`**: Explorer-style window "My Blog", RSS toolbar button, rows of title/date/excerpt,
   empty state.
3. **`/blog/[slug]`**: header scene; title window (title + uppercase mono date); body window with
   `.blog-post-content` (no repeated h1), "← All posts" and "Home" links. Use `notFound()` instead of the
   dead not-found branch; wrap `getBlogPost` in React `cache()` so metadata and page share one parse.
   Restyle all blog content elements for both themes (SPEC §5.3), including hljs day/night themes.
   Keep blog typography in its own file (e.g. `src/app/(main)/blog.css`).
4. **`/contact`**: new; port `ContactTab` content + `AvailabilityWidget` (SPEC §5.4). Add
   `aria-live="polite"` to the widget's loading/error status and `role="group"` where it uses
   `aria-label` on a div.
5. **`/cv`** and **`/availability`**: port to `XpWindow` + tokens, header scene. Keep `.cv-*` layout.
   On the CV download link, drop `target="_blank"` (keep `download`).
6. **`src/app/not-found.tsx`**: XP error-dialog style window ("This page cannot be displayed") with a Home link.
7. Dates: wrap in `<time dateTime=...>` everywhere. Year in copyright rendered on the server.
8. Delete `HomeTab`, `BlogsTab`, `ContactTab`, `LatestBlogsWindow` once ported (or rename/move them
   to their new homes).

## Phase 5: SEO and sharing
1. `src/app/sitemap.ts` (static routes + all non-hidden posts, `lastModified` = post date).
2. `src/app/robots.ts` (disallow `/admin/` and `/anita`, `Sitemap:` line); delete `public/robots.txt`.
3. `src/app/opengraph-image.tsx` (1200×630, XP window over the day hills, name + tagline) and
   per-post `blog/[slug]/opengraph-image.tsx` (title in a title bar). Twitter card `summary_large_image`.
4. JSON-LD: `Person` on `/` (with `sameAs` socials from `site.ts`), `BlogPosting` on posts.
5. RSS: add `<lastBuildDate>`, `dc:creator`, and `content:encoded` (rendered HTML in CDATA, escaping `]]>`).

## Phase 6: Optional polish (do only if Phases 1–5 are done and green)
- Sanitizer: restrict `class` to `hljs*`, `language-*`, `blog-*`; `img` gets `loading="lazy"` and
  `decoding="async"`; https-only image sources (plus relative).
- Separate `new Marked()` instances for blog and CV (no shared global options).
- Sveltia CMS preview style: serve `/admin/preview.css` through the authed admin route with the
  blog typography and call `CMS.registerPreviewStyle`.
- Renovate: majors via dependency dashboard approval instead of disabled; group `@types/*` and eslint.

## Phase 7: Docs
- `README.md`: replace Win98/98.css mentions with XP/xp.css; route list; scripts.
- `AGENTS.md`: remove the "lint is broken" note; update commands (`bun run lint|typecheck|test`),
  component examples (no `Win98Nav`/tab union), theme store guidance, styling section (xp.css, tokens,
  Tailwind only for `/anita`), CV section, proxy.ts, redirects, route list.
- `docs/howto/ADDING_BLOG_POSTS.md`: replace the "Styling with 98.css" section.
- Move `docs/changelogs/2026-07-05-upcoming-pr.md` to `docs/archive/` and add a new dated changelog
  for this redesign in the compact list format.

---

## Final acceptance checklist

Verified against the production build in local Chrome and via HTTP. Sveltia reached its sign-in screen with test Basic Auth; no CMS content was changed.
- [x] `bun run lint`, `bun run typecheck`, `bun run test`, `bun run build` all pass
- [x] `98.css`, VT323, `framer-motion`, `tailwind-merge` gone; no `Win98*` components remain
- [x] `/`: full-screen hill shrinks to faded header on scroll (desktop), hero window fades; static on mobile; view-source shows real content
- [x] `/blog`, `/blog/[slug]`, `/cv`, `/contact`, `/availability`: static faded hill header + XP windows
- [x] `/?tab=blogs` → 308 `/blog`; `/?tab=contact` → 308 `/contact`
- [x] Theme toggle in tray swaps day/night scene and page palette without reload, persists, no flash on load, syncs across tabs
- [x] Start menu: keyboard operable, Escape closes, `aria-current` on current route
- [x] Close every window → joke card → Restore all works; taskbar restores windows
- [x] Reduced motion: no scene animation, no hint bounce, no ping
- [x] No hydration warnings or console errors on any route, either theme
- [x] 375px width: no horizontal scroll, windows stacked, compact taskbar
- [x] Unknown URL shows XP 404 with 404 status
- [x] `/sitemap.xml`, `/robots.txt`, `/feed.xml`, OG images render
- [x] `/admin` still requires Basic Auth and loads the CMS
- [x] `/anita` visually unchanged
- [x] Docs updated

## Decisions log
- User requested one commit made personally after review; implementation is left unstaged and uncommitted.
- Installed xp.css in foundations; removed 98.css and the old components only after the last route migrated.
- All three legacy redirects use a `has` matcher in `src/proxy.ts` so they can remove `tab` without losing unrelated query parameters or looping on `/?tab=home`.
- Window state resets on navigation. Mobile can restore individual windows from the Start menu; Contact shows availability without a toggle.
- Reduced motion uses the static 42vh scene, even on desktop. The night star count follows the sketch's 160 attempts (points behind the hills are skipped).
- Public-page CSS and Anita's existing Tailwind and inherited dark-mode styles are scoped separately; the latter is a visual-compatibility shim.
- Optional Phase 6 CMS, sanitizer, and Renovate changes are deferred to keep this change focused.
