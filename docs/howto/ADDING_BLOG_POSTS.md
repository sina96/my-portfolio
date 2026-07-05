# Adding New Blog Posts

This guide explains how to add new blog posts to the portfolio website using the current Markdown-based setup.

---

## Quick Start

1. Create a new `.md` file in `src/content/blog/`
2. Add frontmatter with required fields
3. Write your content in Markdown
4. Leave `hidden` unset/false when the post should appear on the site

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
hidden: false
---
```

**Required fields (all are validated):**

| Field | Description | Example |
|-------|-------------|---------|
| `title` | Post title (non-empty string) | `"My New Blog Post"` |
| `date` | Publication date (valid YYYY-MM-DD format) | `"2026-02-04"` or `2026-02-04` |
| `excerpt` | Short summary (non-empty string) | `"A quick update on..."` |

**Optional fields:**

| Field | Description | Example |
|-------|-------------|---------|
| `hidden` | Hide the post from the site while keeping it in the repo/CMS | `true` or `false` |

Hidden posts are skipped everywhere:

- Home page latest posts
- Blog archive
- Individual `/blog/[slug]` pages
- RSS feed
- Static generation

In Sveltia, use the **Hidden** toggle. This is the supported draft-like workflow for this site. Sveltia’s upstream editorial workflow is not yet implemented, so saving a hidden post still commits the file, but the website does not publish it.

**Date format notes:**
- Both quoted (`"2026-02-04"`) and unquoted (`2026-02-04`) dates work
- Invalid dates like `2026-13-01` or `2026-02-30` are rejected
- The date is normalized to `YYYY-MM-DD` format for display

**Note:** Posts with missing or invalid frontmatter are automatically skipped and won't appear on the site. Check the console for validation warnings like:
- `[Blog] Invalid frontmatter in post.md: missing "date" field`
- `[Blog] Invalid frontmatter in post.md: invalid "date" value`

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

### Writing in Sveltia CMS

Open `/admin/`, edit or create a post, and use the **Body** field.

- `/admin/` is protected by Basic Auth. Set `ADMIN_USERNAME` and
  `ADMIN_PASSWORD` locally or in Vercel before using Sveltia. Restart the dev
  server after changing env files.
- After Basic Auth, Sveltia still requires GitHub PAT login to publish commits.
- Use the rich text toolbar for common formatting.
- Use raw Markdown mode when you need precise table/divider syntax.
- Use the **Table** editor component to insert a starter table template.
- Use the **Hidden** toggle to save a post without publishing it on the site.

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
- **Horizontal rules:** `---`, `***`, or `___`
- **Tables:** GitHub-flavored Markdown tables

### Extra Spacing and Dividers

Markdown collapses repeated blank lines, so adding more empty lines in Sveltia
does not create more visual space on the site. Use these explicit markers
instead:

```markdown
First paragraph.

{{spacer}}

Second paragraph with a little extra space above it.

{{spacer-lg}}

Third paragraph with a larger gap above it.
```

For a reliable divider line, prefer:

```markdown
Text above the divider.

---

Text below the divider.
```

The blog renderer also accepts `***`, `___`, and `{{divider}}`.

### Tables

Use GitHub-flavored Markdown table syntax, or insert the **Table** component in
Sveltia and edit the generated Markdown:

```markdown
| Feature | Status | Notes |
| --- | ---: | --- |
| RSS | Done | `/feed.xml` |
| CMS | Done | Sveltia |
| Tables | Done | Scrolls on mobile |
```

Table alignment markers work:

- `---` = left/default
- `---:` = right
- `:---:` = center

Tables keep their columns on desktop and scroll horizontally on narrow mobile
screens when needed.

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
2. **`getBlogPost(slug)`** - Validates slug, reads file, validates frontmatter, skips hidden posts, converts Markdown to sanitized HTML

**Processing pipeline:**
1. Validate filename (alphanumeric, hyphens, underscores only)
2. Parse YAML frontmatter with `gray-matter`
3. Validate required fields (title, date, excerpt)
4. Skip posts with `hidden: true`
5. Convert Markdown to HTML with `marked`
6. Sanitize HTML output (strips unsafe tags/attributes)
7. Add security attributes to external links

Posts automatically appear in:
- **Home page** → "Latest Blogs" sidebar (first 3 posts)
- **Blogs tab** → Full archive tree-view
- **`/blog/[slug]`** → Individual post pages

---

## Tips

- **Date sorting:** Posts are sorted by date descending (newest first)
- **Drafts/hidden posts:** Set `hidden: true` or turn on **Hidden** in Sveltia.
- **Images:** Place images in `public/images/blog/` and reference them as `/images/blog/your-image.png`
- **Preview:** Run `npm run dev` and visit `http://localhost:3000/blog/your-slug` to preview

---

## Troubleshooting

**Post not showing up?**
- Ensure the file has `.md` extension
- Check frontmatter syntax (YAML is whitespace-sensitive)
- Verify all required fields are present and non-empty
- Check that `hidden` is not set to `true`
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

**Date validation errors?**
- Use valid dates only (e.g., `2026-02-04`, not `2026-13-01` or `2026-02-30`)
- Both quoted (`"2026-02-04"`) and unquoted (`2026-02-04`) formats work
- Check the console for `[Blog] Invalid frontmatter ... invalid "date"` warnings

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

For implementation background on the visual editor, see [CMS_PLAN.md](../archive/CMS_PLAN.md).
