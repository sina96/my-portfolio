# Task 11: Security hardening (from the pre-review audit, 2026-11-20)

**Branch:** `redesign-xp-hills`. Leave changes uncommitted. Read `AGENTS.md` (Security rules) first.
After the task: `bun run lint && bun run typecheck && bun run test && bun run build`, plus `bun audit`.

Already done during the audit: `next` 16.3.1 → 16.4.6 (critical advisories, including RCE in
`next/og` ImageResponse, which `opengraph-image.tsx` uses), `eslint-config-next` 16.4.6, and
`sanitize-html` 2.17.7 → 2.18.2. Build, tests and a browser smoke test pass on the new versions.

## 1. Refuse weak or placeholder admin credentials (medium)
`.env.example` ships `ADMIN_USERNAME=admin` and `ADMIN_PASSWORD=replace-with-a-long-random-password`.
A copied example file currently unlocks `/admin` with publicly known credentials.
- In `src/lib/basicAuth.ts`, treat credentials as "not configured" (503, fail closed, one `console.warn`)
  when the password equals the example placeholder or is shorter than 16 characters.
- Add unit tests: placeholder rejected, short password rejected, valid credentials accepted, malformed
  header → 401.
- Update `.env.example` comments ("generate with `openssl rand -base64 24`") and the howto if it
  mentions admin setup.

## 2. Cache availability so the public API can't be used to hammer calendars (medium)
`/api/availability` is `force-dynamic` and refetches every ICS source (up to 2MB, 7s timeout each) on
every request. Anyone can loop it to burn function time and hit the calendar provider.
- Cache parsed busy blocks per source in memory for ~5 minutes (module-level map with timestamp),
  and coalesce concurrent fetches (share one in-flight promise).
- Send `Cache-Control: public, s-maxage=300, stale-while-revalidate=600` on the JSON response so the
  CDN absorbs repeats (`weekOffset` is already clamped by `normalizeWeekOffset`).
- Mock fallback: same headers, but don't cache a failed fetch for longer than ~60s.
- Test the cache helper (second call within TTL doesn't refetch; expired TTL refetches).

## 3. Content-Security-Policy (low, defence in depth)
No CSP today. Content is owner-written and sanitized, so this is a backstop.
- Add a CSP in `next.config.mjs` for public pages, first as `Content-Security-Policy-Report-Only`. Check
  the console on every route in dev and prod, then switch to enforcing if clean. Must allow the inline
  pre-paint theme script (hash or nonce, per the Next 16 docs in `node_modules/next/dist/docs/`), Next's
  own scripts, Vercel Speed Insights, `data:`/`blob:` images (hill scene canvases), and `frame-ancestors 'none'`.
- `/admin` needs its own policy (unpkg Sveltia script with SRI, GitHub API for the CMS backend). If that
  gets complicated, exclude `/admin` and record why.

## 4. Smaller items (low)
- Sanitizer (`utils/sanitizeHtml.ts`): restrict `class` to `hljs*`, `language-*`, `blog-*`; drop the
  `http` scheme for images (https and relative only); add `loading="lazy" decoding="async"` to `img`.
  Make sure all showcase posts still render the same.
- Build warnings: "Dynamic filesystem access causes tracing of the whole project" (5×, Next 16.4) from
  the `contentDirectory` parameter in `data/blogPosts.ts`. Keep the public functions using the fixed
  posts directory (e.g. a separate internal function for tests, or `turbopackIgnore`) so the build has
  no tracing warnings and functions don't bundle the whole repo.
- Remaining `bun audit` findings are transitive dev/build tools (brace-expansion, browserslist,
  source-map-js, js-yaml via gray-matter/eslint, zod, glob). Run `bun update` within ranges and see which
  clear. Don't force overrides that break the build. Record what's left and why it's acceptable.

## Acceptance
- [x] Placeholder or short admin passwords fail closed; tests cover it
- [x] Availability is cached (memory + CDN headers); repeated requests don't refetch ICS within the TTL
- [x] CSP added (enforced or report-only with a recorded reason); no CSP violations on any public route
- [x] Sanitizer tightened without visual changes to posts; no tracing warnings in the build
- [x] `bun audit` has no critical/high advisories in runtime dependencies; leftovers recorded
- [x] lint, typecheck, test, build pass; `/anita` unchanged

## Decisions log
- Missing, blank, placeholder and short credentials fail closed with a warning once per module instance and no credential values logged. Verified HTTP 503, 401 and 200 with local test credentials.
- Each configured source caches the parsed calendar and a bounded set of expanded week ranges. In-flight loads are shared across both weeks. Healthy CDN responses use 300s freshness and 600s stale revalidation; partial/mock responses use 60s with no stale window so recovering sources become visible promptly.
- Used Next's documented nonce-free CSP to preserve static generation. The theme initializer and Next's inline hydration need inline scripts; a per-request nonce would turn these routes dynamic. Production enforces the policy after clean Chrome report-only checks in dev and production. /admin is excluded: the external Sveltia CMS has its own CDN/backend needs and remains behind Basic Auth with its existing pinned SRI script. Speed Insights only mounts on Vercel; ingestion was not tested against a live deployment.
- Blog loaders now read the fixed content directory; tests exercise the pure parser. The production build emitted no tracing warnings. CSS classes and images are limited to the documented safe styling and source rules.
- `bun audit --production`: no vulnerabilities. Full audit retains 8 findings through development tools: Browserslist and Zod (high), humanfs, Glob and PostCSS selector parsing (moderate), Babel and PostCSS selector parsing (low). These process repo-controlled build/lint inputs and are not part of the production graph; no incompatible overrides were forced.
- Lint, typecheck, 26 tests and build pass. Chrome reported no public-page CSP violations; both Anita screenshots matched their baselines.
