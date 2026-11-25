# Portfolio Website

[![Build](https://github.com/sina96/my-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/sina96/my-portfolio/actions/workflows/ci.yml)

A Next.js portfolio styled as a Windows XP desktop over procedural day and night pixel-art hills.

## Getting Started

Use Node 24 and the [Bun](https://bun.sh) version pinned in `package.json`. Install dependencies and run the development server:

```bash
bun install
cp .env.example .env.local
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

Edit `.env.local` with private calendar ICS URLs or local `.ics` file paths if you want live availability data.
Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` to access the `/admin` CMS password gate locally (used when `ADMIN_HOST` is unset). Restart the dev server after changing env files.

## Routes

- `/` — portfolio and latest posts; the hills shrink as you scroll on desktop.
- `/blog`, `/blog/[slug]`, `/feed.xml` — archive, articles, and RSS.
- `/cv`, `/cv.pdf` — rendered CV and PDF.
- `/contact`, `/availability` — social links and availability.
- `/admin` — protected Sveltia CMS.

Old `/?tab=home|blogs|contact` URLs redirect to their equivalent pages. On the landing page, use the Start menu on the hill and the Explorer task pane below it to navigate and switch themes. On mobile, the Places button opens the task pane as a drawer. Other pages use links inside their windows.

## Checks

```bash
bun run lint
bun run typecheck
bun run test
bun run build
```

## Documentation

Project docs are organized by purpose:

- [XP Hills design spec](./docs/specs/xp-hills/SPEC.md) - how the site looks and behaves
- [How to add blog posts](./docs/howto/ADDING_BLOG_POSTS.md)
- [XP Hills changelog](./docs/changelogs/2026-11-20-xp-hills.md)
- [Landing v2 changelog](./docs/changelogs/2026-11-21-landing-v2.md)
- [CMS access changelog](./docs/changelogs/2026-11-25-cms-access.md)
- [Archive](./docs/archive/) - older plans, implementation notes, and the XP Hills task handoffs

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) 16 with App Router
- **Bundler:** [Turbopack](https://turbo.build/pack) (Next.js's Rust-based bundler)
- **Package Manager:** [Bun](https://bun.sh)
- **Styling:** [xp.css](https://botoxparty.github.io/XP.css/) and theme tokens; Tailwind CSS only for `/anita`
- **Content:** Markdown files in `src/content/blog/`
- **Language:** TypeScript

## Deploy

Deploy on [Vercel](https://vercel.com) or your preferred platform. Vercel automatically detects Bun via the `bun.lock` file and uses it for builds. The site builds as a standard Next.js application with Turbopack.

For availability in production, add `AVAILABILITY_ICS_URLS_JSON` and any optional availability env vars in the deployment platform as server-side environment variables.
For Sveltia CMS in production, set `ADMIN_HOST`, `CF_ACCESS_TEAM_DOMAIN` and `CF_ACCESS_AUD` in Vercel: `/admin` then lives on the admin host behind Cloudflare Access (GitHub login, no password). Prerequisites:

- A Cloudflare Access self-hosted application for the admin hostname (its AUD tag is `CF_ACCESS_AUD`), plus a Bypass application for `/.well-known/acme-challenge/` so Vercel can renew the certificate.
- A GitHub identity provider in Cloudflare Zero Trust, and an Allow policy that admits only the permitted account.
- DNS for the admin hostname in Cloudflare pointing at Vercel and **proxied**, SSL/TLS mode Full (strict), and the hostname added to the Vercel project.

Step-by-step setup docs are pending. If Access locks you out, use the Basic Auth break-glass steps in [`docs/howto/ADDING_BLOG_POSTS.md`](docs/howto/ADDING_BLOG_POSTS.md#writing-in-sveltia-cms).
