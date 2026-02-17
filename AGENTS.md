# AGENTS.md

This file provides guidance for agentic coding agents working in this repository.

## Build, Lint, and Test Commands

```bash
# Development
bun run dev          # Start dev server with Turbopack (default)
bun run dev:webpack  # Start dev server with Webpack

# Production
bun run build        # Build for production
bun run start        # Start production server

# Code Quality
bun run lint         # Run ESLint
```

Note: `bun run lint` / `next lint` is currently failing with `Invalid project directory provided, no such directory: .../lint` in this repo. Until that is fixed, use `bun run build` as the primary sanity check.

**Note:** This project does not currently have test files. When adding tests, use Vitest or Jest and add test scripts to package.json.

## Code Style Guidelines

### Imports
- Use named imports: `import { useState } from "react"`
- Use `import type` for type-only imports: `import type { Metadata } from "next"`
- Relative imports use `../` pattern
- Group imports: React/Next.js → third-party → local types → local components

### Formatting
- 2-space indentation
- No trailing commas in single-line imports
- Standard TypeScript/React formatting

### Types
- TypeScript strict mode enabled
- Use interfaces for component props and data models
- Type annotations on function parameters and returns
- Use `Readonly<>` for immutable props
- Union types for string literals: `"home" | "blogs" | "contact"`

### Naming Conventions
- Components: PascalCase (`Win98Nav`, `HomeContent`)
- Functions: camelCase (`getAllBlogPosts`, `sanitizeHtml`)
- Constants: UPPER_SNAKE_CASE (`SANITIZE_CONFIG`)
- Hooks: camelCase with `use` prefix (`useTheme`)
- Interfaces: PascalCase (`BlogPost`, `Win98NavProps`)

### Error Handling
- Validation functions return discriminated unions: `{ valid: true; ... } | { valid: false }`
- Use `console.warn()` for invalid data (don't crash)
- Graceful fallbacks: return empty arrays or `undefined`
- Validate user input (slugs, paths) to prevent security issues

### React Patterns
- Add `"use client"` directive at top of client components
- Use functional components with hooks
- Define props interfaces before components
- Use `Suspense` for async loading
- Use `useLayoutEffect` for DOM mutations (prevents flicker)
- Use `useEffect` for side effects and cleanup
- Keep state initializers pure to avoid hydration issues

### Security
- Always sanitize HTML with `sanitizeHtml()` before `dangerouslySetInnerHTML`
- Validate slugs with regex: `/^[a-zA-Z0-9_-]+$/`
- Prevent path traversal: verify resolved paths stay within expected directories
- Add `rel="noopener noreferrer"` to external links

### Comments
- JSDoc-style comments for exported functions
- Inline comments for complex logic only
- Keep comments minimal and focused

### File Organization
- App Router structure with route groups: `(main)`, `(auth)`, etc.
- Subdirectories: `components/`, `hooks/`, `types/`, `data/`, `utils/`
- Place files close to where they're used

### ESLint
- Config: `next/core-web-vitals`
- When lint is working, run `bun run lint` before committing

## Project-Specific Patterns

### Blog Posts
- Markdown files in `src/content/blog/`
- Frontmatter: `title`, `date`, `excerpt` (all required)
- Use `getAllBlogPosts()` for lists, `getBlogPost(slug)` for details
- Posts sorted by date descending

### CV
- Markdown source: `src/content/cv/sina-cv.md` (frontmatter may exist; current loader ignores it)
- PDF source: `src/content/cv/sina-cv-pdf.pdf` served at `/cv.pdf` via `src/app/cv.pdf/route.ts`
- Data helper: `src/app/(main)/data/cv.ts` returns `{ rawMarkdown, renderedHtml }` (rendered HTML sanitized via `sanitizeHtml()`)
- Route: `src/app/(main)/cv/page.tsx` uses the Win98 window pattern; responsive layout controlled by `.cv-*` classes in `src/app/globals.css`

### Theme
- Dark mode stored in `localStorage` key `"theme"` (values: `"dark"` or `"light"`)
- Theme applied via `data-theme` attribute on `html` element
- Use `useTheme()` hook for theme state

### Styling
- 98.css for Windows 98 aesthetic
- Tailwind CSS for utility classes
- Custom animations in `tailwind.config.ts`

## Component Examples

### Client Component Pattern
```tsx
"use client";

import { useState } from "react";

interface MyComponentProps {
  title: string;
}

export function MyComponent({ title }: MyComponentProps) {
  const [isOpen, setIsOpen] = useState(false);

  return <div>{title}</div>;
}
```

### Server Component Pattern
```tsx
import { Suspense } from "react";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AsyncContent />
    </Suspense>
  );
}
```

## Data Fetching Patterns
- Server components: fetch data directly in component body
- Client components: use `useEffect` for data fetching
- Validate all external data before use
- Use discriminated unions for validation results

## Accessibility
- Use semantic HTML elements
- Add `aria-label` to icon-only buttons
- Use `aria-current` for active navigation states
- Ensure keyboard navigation works for all interactive elements

## Running Single Tests (When Added)
When tests are added to this project, use:
```bash
# Run all tests
bun test

# Run single test file
bun test path/to/test.spec.ts

# Run tests matching a pattern
bun test --grep "test name"
```
