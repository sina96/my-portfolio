# Adding New Blog Posts

This guide explains how to add new blog posts to the portfolio website using the current Markdown-based setup.

---

## Quick Start

1. Create a new `.md` file in `src/content/blog/`
2. Add frontmatter with required fields
3. Write your content in Markdown
4. The post appears automatically on the site

---

## Step-by-Step Guide

### 1. Create the Markdown File

Create a new file in the `src/content/blog/` directory. The filename becomes the URL slug.

**Naming rules:**
- Use only **letters, numbers, hyphens, and underscores**
- No spaces or special characters
- Lowercase recommended for consistency

```text
src/content/blog/my-new-post.md        →  /blog/my-new-post       ✓
src/content/blog/post_2026.md          →  /blog/post_2026         ✓
src/content/blog/my post.md            →  (invalid filename)      ✗
src/content/blog/post@home.md          →  (invalid filename)      ✗
```

### 2. Add Frontmatter

Every post must start with YAML frontmatter between `---` markers:

```markdown
---
title: "Your Post Title"
date: "YYYY-MM-DD"
excerpt: "A brief summary of your post (1-2 sentences). Shown in blog lists."
---
```

**Required fields (all are validated):**

| Field | Description | Example |
|-------|-------------|---------|
| `title` | Post title (non-empty string) | `"My New Blog Post"` |
| `date` | Publication date (must be valid date format) | `"2026-02-04"` |
| `excerpt` | Short summary (non-empty string) | `"A quick update on..."` |

**Note:** Posts with missing or invalid frontmatter are automatically skipped and won't appear on the site. Check the console for validation warnings.

### 3. Write Your Content

After the frontmatter, write your post content in standard Markdown:

```markdown
---
title: "My New Post"
date: "2026-02-04"
excerpt: "This is my latest blog post about web development."
---

Welcome to my new post!

## A Heading

Here's some content with **bold** and *italic* text.

### A Subheading

- Bullet point 1
- Bullet point 2
- Bullet point 3

Here's a [link](https://example.com) and some `inline code`.

```javascript
// Code blocks work too
const greeting = "Hello, World!";
console.log(greeting);
```

> Blockquotes are also supported.
```

### 4. Supported Markdown Features

The blog supports standard Markdown syntax:

- **Headings:** `#`, `##`, `###`, etc.
- **Bold:** `**text**` or `__text__`
- **Italic:** `*text*` or `_text_`
- **Links:** `[text](url)` — external links automatically open in new tab with `rel="noopener noreferrer"`
- **Images:** `![alt](url)`
- **Lists:** `-` or `1.` for bullets/numbers
- **Code:** `` `inline` `` or fenced blocks with ` ``` `
- **Blockquotes:** `> quoted text`
- **Horizontal rules:** `---`

**Security note:** All HTML content is sanitized before rendering. Only safe tags (paragraphs, headings, lists, links, code blocks, etc.) are allowed.

---

## Example Post

Here's a complete example:

**File:** `src/content/blog/learning-nextjs.md`

```markdown
---
title: "What I Learned Building with Next.js"
date: "2026-02-04"
excerpt: "Reflections on building my portfolio with Next.js App Router and the lessons learned along the way."
---

Building this portfolio has been an incredible learning experience. Here are my key takeaways.

## The App Router

Next.js 13+ introduced the App Router, which changes how we think about routing:

- File-based routing with folders
- Server Components by default
- Layouts that persist across pages

## Styling with 98.css

I wanted a retro Windows 98 aesthetic, so I used the [98.css](https://jdan.github.io/98.css/) library.

## What's Next

I'm planning to:

1. Add more blog posts
2. Integrate a CMS for easier editing
3. Add a projects showcase

Stay tuned!
```

---

## How It Works

The blog system reads Markdown files at build/request time:

1. **`getAllBlogPosts()`** - Scans `src/content/blog/`, validates frontmatter, returns metadata sorted by date (newest first)
2. **`getBlogPost(slug)`** - Validates slug, reads file, validates frontmatter, converts Markdown to sanitized HTML

**Processing pipeline:**
1. Validate filename (alphanumeric, hyphens, underscores only)
2. Parse YAML frontmatter with `gray-matter`
3. Validate required fields (title, date, excerpt)
4. Convert Markdown to HTML with `marked`
5. Sanitize HTML output (strips unsafe tags/attributes)
6. Add security attributes to external links

Posts automatically appear in:
- **Home page** → "Latest Blogs" sidebar (first 3 posts)
- **Blogs tab** → Full archive tree-view
- **`/blog/[slug]`** → Individual post pages

---

## Tips

- **Date sorting:** Posts are sorted by date descending (newest first)
- **Drafts:** Currently no draft system—all `.md` files are published. To hide a post, rename it to `.md.draft` or move it out of the folder.
- **Images:** Place images in `public/images/blog/` and reference them as `/images/blog/your-image.png`
- **Preview:** Run `npm run dev` and visit `http://localhost:3000/blog/your-slug` to preview

---

## Troubleshooting

**Post not showing up?**
- Ensure the file has `.md` extension
- Check frontmatter syntax (YAML is whitespace-sensitive)
- Verify all required fields are present and non-empty
- Check the console for `[Blog] Invalid frontmatter` warnings
- Restart the dev server if needed

**Formatting looks wrong?**
- Check for unclosed Markdown syntax
- Ensure blank lines between different elements (paragraphs, lists, code blocks)

**404 on post page?**
- Verify the filename uses only allowed characters (letters, numbers, hyphens, underscores)
- Check for spaces or special characters in the filename
- Verify the filename matches the URL slug exactly
- Check the console for validation errors

---

## File Structure

```text
src/
└── content/
    └── blog/
        ├── hello-world.md        → /blog/hello-world
        ├── my-second-post.md     → /blog/my-second-post
        └── another-post.md       → /blog/another-post
```

---

## Future: CMS Integration

For a visual editor experience without touching Markdown files directly, see [DECAP_CMS_PLAN.md](./DECAP_CMS_PLAN.md) for the planned Decap CMS integration.
