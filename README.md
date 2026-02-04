# Portfolio Website

A personal portfolio website built with Next.js featuring a retro Windows 98 theme.

## Getting Started

This project uses [Bun](https://bun.sh) as the package manager. Install dependencies and run the development server:

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

### Alternative: Use npm

If you prefer npm, you can use:
```bash
npm install
npm run dev
```

## Theme

This project uses [98.css](https://github.com/jdan/98.css) - a CSS framework for building faithful recreations of old UIs. The site features a Windows 98-inspired design with dark mode support.

## Documentation

For more information, see the [`docs/`](./docs/) directory:

- [Adding Blog Posts](./docs/ADDING_BLOG_POSTS.md) - How to add new blog posts
- [Decap CMS Plan](./docs/DECAP_CMS_PLAN.md) - Future CMS integration roadmap

## Tech Stack

- **Framework:** [Next.js](https://nextjs.org/) 16 with App Router
- **Bundler:** [Turbopack](https://turbo.build/pack) (Next.js's Rust-based bundler)
- **Package Manager:** [Bun](https://bun.sh)
- **Styling:** [98.css](https://github.com/jdan/98.css) + Tailwind CSS
- **Content:** Markdown files in `src/content/blog/`
- **Language:** TypeScript

## Deploy

Deploy on [Vercel](https://vercel.com) or your preferred platform. Vercel automatically detects Bun via the `bun.lock` file and uses it for builds. The site builds as a standard Next.js application with Turbopack.
