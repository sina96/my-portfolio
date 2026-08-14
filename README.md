# Portfolio Website

[![Build](https://github.com/sina96/my-portfolio/actions/workflows/ci.yml/badge.svg)](https://github.com/sina96/my-portfolio/actions/workflows/ci.yml)

A personal portfolio website built with Next.js featuring a retro Windows 98 theme.

## Getting Started

This project uses [Bun](https://bun.sh) as the package manager. Install dependencies and run the development server:

```bash
bun install
cp .env.example .env.local
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

Edit `.env.local` with private calendar ICS URLs or local `.ics` file paths if you want live availability data.
Set `ADMIN_USERNAME` and `ADMIN_PASSWORD` to access the `/admin` CMS password gate. Restart the dev server after changing env files.

### Alternative: Use npm

If you prefer npm, you can use:
```bash
npm install
npm run dev
```

## Theme

This project uses [98.css](https://github.com/jdan/98.css) - a CSS framework for building faithful recreations of old UIs. The site features a Windows 98-inspired design with dark mode support.

## Documentation

Project docs are organized by purpose:

- [How to add blog posts](./docs/howto/ADDING_BLOG_POSTS.md)
- [Upcoming PR changelog](./docs/changelogs/2026-07-05-upcoming-pr.md)
- [Archive](./docs/archive/) - older plans, implementation notes, and reference docs

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) 16 with App Router
- **Bundler:** [Turbopack](https://turbo.build/pack) (Next.js's Rust-based bundler)
- **Package Manager:** [Bun](https://bun.sh)
- **Styling:** [98.css](https://github.com/jdan/98.css) + Tailwind CSS
- **Content:** Markdown files in `src/content/blog/`
- **Language:** TypeScript

## Deploy

Deploy on [Vercel](https://vercel.com) or your preferred platform. Vercel automatically detects Bun via the `bun.lock` file and uses it for builds. The site builds as a standard Next.js application with Turbopack.

For availability in production, add `AVAILABILITY_ICS_URLS_JSON` and any optional availability env vars in the deployment platform as server-side environment variables.
For Sveltia CMS in production, add `ADMIN_USERNAME` and `ADMIN_PASSWORD` in Vercel before visiting `/admin`.
