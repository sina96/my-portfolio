# CMS behind Cloudflare Access

## 2026-11-25

- The CMS moved to `admin.sinabastani.dev`; `/admin` on any other host redirects there.
- Signing in now goes through Cloudflare Access with GitHub. The admin password is gone in production.
- The site checks Cloudflare's signed login token itself (in the proxy and the admin route), so requests
  that skip Cloudflare are refused.
- "Sign in with GitHub" in the CMS now works, through a small Cloudflare Worker and a GitHub App
  limited to this repo, so no personal access token is needed.
- Basic Auth remains only for local development and as an emergency fallback.
- `security.txt` added, and HSTS now includes `preload`.
