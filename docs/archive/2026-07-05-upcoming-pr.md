# Upcoming PR Changelog

## 2026-07-05

- Added Sveltia CMS admin at `/admin/` with GitHub backend, PAT flow, slug cleanup, media uploads, and table template editor component.
- Added Basic Auth protection for `/admin` CMS routes via `ADMIN_USERNAME` and `ADMIN_PASSWORD`.
- Added `hidden` blog frontmatter support and Sveltia Hidden toggle; hidden posts are excluded from archive, latest posts, RSS, direct pages, and static generation.
- Added RSS feed at `/feed.xml` with metadata discovery, static generation, XML escaping, and CDN cache headers.
- Improved blog rendering: readable article typography, paragraph/headings rhythm, dividers, tables, images, blockquotes, code blocks, and syntax highlighting.
- Added Markdown authoring helpers: `{{spacer}}`, `{{spacer-lg}}`, `{{divider}}`, reliable `---`/`***`/`___` dividers, and GFM tables.
- Added syntax highlighting with `highlight.js/lib/common`, theme-aware CSS, and sanitized highlighted HTML.
- Made blog post pages statically generated with `generateStaticParams()`.
- Split CV rendered styling from blog article styling to avoid cross-page CSS regressions.
- Added temporary Sveltia Markdown showcase post for CMS deletion/rendering tests.
- Reorganized docs into `docs/howto/`, `docs/changelogs/`, and `docs/archive/`.
