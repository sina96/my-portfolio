# CMS Integration Plan (Sveltia CMS)

## Overview

This document outlines the plan for adding a Git-based CMS to the portfolio blog, so new posts can be written in a web UI and published with a single save — no local checkout, branch, or PR required.

**History:** This plan originally targeted [Decap CMS](https://decapcms.org) (formerly Netlify CMS). As of 2026 that plan is outdated:

- **Netlify Identity and Git Gateway are deprecated.** The easiest Decap auth path no longer accepts new setups ([Netlify docs](https://docs.netlify.com/manage/security/secure-access-to-sites/git-gateway/)).
- **Decap is in maintenance mode.** Netlify stepped back; the project is community-maintained with slow feature development.
- **Decap's GitHub OAuth backend needs a server-side OAuth relay**, which Netlify used to host for free. On Vercel we would have to deploy and maintain one ourselves.

The revised plan uses **[Sveltia CMS](https://github.com/sveltia/sveltia-cms)** — the actively developed successor to Netlify/Decap CMS. It reads the same `config.yml` format, so almost everything from the original plan carries over.

---

## Why Sveltia CMS?

- **Git-based**: Content stays as Markdown files in this repository (no external database)
- **Free & Open Source**: No hosting costs or vendor lock-in
- **Decap-compatible config**: Same `config.yml` schema; existing knowledge/docs apply
- **Actively developed**: Regular releases; the de-facto replacement for Decap
- **Zero-infrastructure auth for solo use**: Supports signing in with a GitHub
  **Personal Access Token (PAT)** — no OAuth app, no relay server, nothing to deploy
- **Works with current setup**: Our data layer (`src/app/(main)/data/blogPosts.ts`)
  already reads frontmatter + Markdown body from `src/content/blog/`, which is
  exactly what Sveltia produces

### Publishing flow after integration

1. Open `https://sinabastani.dev/admin/` on any device
2. Sign in with GitHub (PAT)
3. Write/edit the post in the visual editor, hit **Publish**
4. Sveltia commits the `.md` file to `main` via the GitHub API
5. Vercel auto-deploys the commit → post is live

No PR, no local environment.

---

## Prerequisites

1. **Git repository on GitHub** ✅ (already the case)
2. **Deployed site** ✅ (Vercel)
3. **A GitHub fine-grained Personal Access Token** with read/write access to
   *Contents* on this repo only (create under GitHub → Settings → Developer
   settings → Fine-grained tokens). Set an expiry and rotate when it lapses.

No OAuth app and no serverless functions are needed for a single author.
(If co-authors are ever added, switch to the authorization-code flow with
[sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth) on Cloudflare
Workers — see "Future Enhancements".)

---

## Integration Steps

### 1. Create the admin page

Create `public/admin/index.html`:

```html
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex" />
    <title>Content Manager</title>
  </head>
  <body>
    <script src="https://unpkg.com/@sveltia/cms/dist/sveltia-cms.js" type="module"></script>
  </body>
</html>
```

That's the whole admin app — Sveltia is a single script that reads the config
below and talks to the GitHub API directly from the browser.

### 2. Create the configuration file

Create `public/admin/config.yml`:

```yaml
backend:
  name: github
  repo: <github-username>/my-portfolio # update to the real owner/repo
  branch: main

media_folder: "public/images/blog" # uploaded media stored in the repo
public_folder: "/images/blog"      # src attribute used in Markdown

collections:
  - name: "blog"
    label: "Blog Posts"
    folder: "src/content/blog"
    create: true
    slug: "{{slug}}" # filename = URL slug; keep to letters/numbers/hyphens/underscores
    fields:
      - { label: "Title", name: "title", widget: "string" }
      - { label: "Publish Date", name: "date", widget: "datetime", date_format: "YYYY-MM-DD", time_format: false }
      - { label: "Excerpt", name: "excerpt", widget: "text" }
      - { label: "Body", name: "body", widget: "markdown" }
```

Notes:

- The `body` widget maps to the Markdown content **after** the frontmatter —
  exactly how `gray-matter` parses our posts today. No data-layer changes needed.
- `date_format: "YYYY-MM-DD"` with `time_format: false` matches the format our
  frontmatter validation expects (see `isValidFrontmatter` in
  `src/app/(main)/data/blogPosts.ts`).
- Slug characters must satisfy the existing filename validation
  (`/^[a-zA-Z0-9_-]+$/`).

### 3. Sign in with a PAT

Visit `/admin/`, choose **Sign in with GitHub**, and use the
**"Use a personal access token"** option. The token is stored in the browser's
local storage on that device only.

### 4. Verify end-to-end

1. Create a test post in the CMS and publish
2. Confirm the commit lands on `main` with valid frontmatter
3. Confirm Vercel deploys and the post renders at `/blog/<slug>`
4. Delete the test post through the CMS (it commits the deletion too)

### 5. Housekeeping

- Ensure `public/images/blog/` exists and is tracked (add a `.gitkeep` if empty)
- Keep `/admin/` out of search results: the `noindex` meta tag above, plus
  optionally exclude it in `robots`

---

## Content Schema

Matches the existing `BlogPost` interface — unchanged from the original plan:

```typescript
interface BlogPost {
  slug: string;    // derived from filename
  title: string;   // frontmatter
  date: string;    // frontmatter (YYYY-MM-DD)
  excerpt: string; // frontmatter
  content: string; // Markdown body converted to sanitized HTML
}
```

Sveltia writes files like:

```yaml
---
title: Hello World
date: 2026-07-05
excerpt: Welcome to my blog...
---
Body content here.
```

---

## RSS Feed

An RSS feed helps promote the website: readers can subscribe directly, and it
gives Medium/other platforms a source to import from (always set the canonical
URL to sinabastani.dev when cross-posting). This works with the current
codebase today — it does not depend on the CMS work and can ship first.

### Implementation

Create `src/app/feed.xml/route.ts` (App Router route handler, no new
dependencies):

```typescript
import { getAllBlogPosts } from "../(main)/data/blogPosts";

const SITE_URL = "https://sinabastani.dev";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function GET() {
  const posts = getAllBlogPosts(); // already sorted newest-first

  const items = posts
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}/blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${post.slug}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Sina Bastani</title>
    <link>${SITE_URL}</link>
    <description>Software developer focused on backend systems, cloud migration, and modern delivery.</description>
    <language>en</language>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
```

### Make the feed discoverable

Add to the metadata in `src/app/layout.tsx`:

```typescript
alternates: {
  canonical: "/",
  types: {
    "application/rss+xml": [{ url: "/feed.xml", title: "Sina Bastani — Blog" }],
  },
},
```

Optionally add a visible "RSS" link in the site footer/nav.

### Verify

- `curl http://localhost:3000/feed.xml` returns valid XML
- Validate with https://validator.w3.org/feed/
- Subscribe in any feed reader and confirm posts appear

---

## Migration Path

1. **Phase 0**: Ship the RSS feed (independent of CMS)
2. **Phase 1**: Add `public/admin/` (Sveltia script + config) alongside existing posts
3. **Phase 2**: Create/edit a test post through the CMS; verify frontmatter passes validation
4. **Phase 3**: Use the CMS for real posts; keep the manual Markdown workflow
   ([ADDING_BLOG_POSTS.md](../howto/ADDING_BLOG_POSTS.md)) as a fallback — both write
   to the same files

No migration of existing posts is needed: Sveltia edits them in place.

---

## Security Considerations

- **PAT scope**: Fine-grained token, this repo only, *Contents: read/write*
  only, with an expiry date. Never commit the token; it lives only in the
  browser's local storage.
- **Shared devices**: Don't sign in to `/admin/` on shared machines; the token
  persists in local storage until sign-out.
- **Content validation**: The existing data layer already validates
  frontmatter and sanitizes HTML output — CMS-created posts go through the
  same pipeline.
- **Admin exposure**: `/admin/` is public HTML but useless without
  credentials; keep it `noindex`.

---

## Resources

- [Sveltia CMS repository](https://github.com/sveltia/sveltia-cms)
- [Sveltia GitHub backend / PAT auth](https://sveltiacms.app/en/docs/backends/github)
- [Sveltia CMS Authenticator (only needed for multi-user OAuth)](https://github.com/sveltia/sveltia-cms-auth)
- [Decap CMS config reference (schema is compatible)](https://decapcms.org/docs/configuration-options/)

---

## Future Enhancements

- **Draft posts**: implemented as a `hidden` boolean field + filter in `getAllBlogPosts()`
- **Categories/Tags**: extend schema and archive tree-view
- **Multi-user auth**: deploy [sveltia-cms-auth](https://github.com/sveltia/sveltia-cms-auth)
  on Cloudflare Workers and switch from PAT to OAuth
- **Theming**: the CMS UI is customizable via CSS if you want to match the Windows 98 theme
