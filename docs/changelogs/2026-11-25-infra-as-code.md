# Cloudflare as code

## 2026-11-25

- All Cloudflare settings for the domain (DNS, email routing, TLS, DNSSEC, redirects, Zero Trust
  Access) are now described in `infra/` with OpenTofu, with state in a private R2 bucket.
- Changes go through pull requests: each PR gets a plan comment, and merging applies after approval.
- A weekly drift check flags any change made by hand in the dashboard.
- First change through the pipeline: minimum TLS 1.2 and Always Use HTTPS on the proxied hosts,
  HttpOnly Cloudflare Access cookies, and a tidier `www` redirect rule.
