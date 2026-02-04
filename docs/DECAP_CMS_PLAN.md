# Decap CMS Integration Plan

## Overview

This document outlines the long-term plan for integrating [Decap CMS](https://decapcms.org) (formerly Netlify CMS) into the portfolio blog. Decap CMS provides a Git-based content management system with a visual editor interface, allowing non-technical users to create and edit blog posts without touching Markdown files directly.

---

## Why Decap CMS?

- **Git-based**: Content is stored as Markdown files in your repository (no external database)
- **Free & Open Source**: No hosting costs or vendor lock-in
- **Visual Editor**: Non-technical users can write blog posts through a web UI
- **Version Control**: All content changes are tracked via Git commits
- **Works with Current Setup**: Integrates seamlessly with our existing Markdown-based blog structure

---

## Prerequisites

Before implementing Decap CMS, ensure you have:

1. **Git Repository**: Your code must be in a Git repository (GitHub, GitLab, or Bitbucket)
2. **Authentication Provider**: Choose one of:
   - **GitHub OAuth** (recommended for GitHub repos)
   - **GitLab OAuth** (for GitLab repos)
   - **Netlify Identity** (if deploying to Netlify)
   - **Bitbucket OAuth** (for Bitbucket repos)
3. **Deployment Platform**: Your site should be deployed (Vercel, Netlify, etc.)

---

## Integration Steps

### 1. Install Decap CMS

```bash
npm install decap-cms-app
```

Or use the CDN approach (recommended for simplicity):

Add to `public/admin/index.html` (we'll create this file).

### 2. Create Admin Interface

Create `public/admin/index.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Content Manager</title>
  <script src="https://identity.netlify.com/v1/netlify-identity-widget.js"></script>
</head>
<body>
  <!-- Include the script that builds the page and powers Decap CMS -->
  <script src="https://unpkg.com/decap-cms@^3.0.0/dist/decap-cms.js"></script>
  <script>
    if (window.netlifyIdentity) {
      window.netlifyIdentity.on("init", user => {
        if (!user) {
          window.netlifyIdentity.on("login", () => {
            document.location.href = "/admin/";
          });
        }
      });
    }
  </script>
</body>
</html>
```

### 3. Create Configuration File

Create `public/admin/config.yml`:

```yaml
backend:
  name: git-gateway
  branch: main # Branch to update (optional; defaults to master)

media_folder: "public/images/blog" # Media files will be stored in the repo under public/images/blog
public_folder: "/images/blog" # The src attribute for uploaded media will be /images/blog/...

collections:
  - name: "blog" # Used in routes, e.g., /admin/collections/blog
    label: "Blog Posts"
    folder: "src/content/blog" # The path to the folder where the documents are stored
    create: true # Allow users to create new documents in this collection
    slug: "{{slug}}" # Filename template, e.g., YYYY-MM-DD-title.md
    fields: # The fields for each document, usually in front matter
      - { label: "Title", name: "title", widget: "string" }
      - { label: "Publish Date", name: "date", widget: "datetime" }
      - { label: "Excerpt", name: "excerpt", widget: "text" }
      - { label: "Body", name: "body", widget: "markdown" }
```

**Important**: The `body` field maps to the Markdown content (after frontmatter). Our current structure uses `content` in the frontmatter, but Decap CMS expects the body to be separate. We'll need to adjust our data layer to handle this, or update the config to match our current structure.

### 4. Update Data Layer (if needed)

If Decap CMS stores content differently (e.g., `body` instead of `content` in frontmatter), update `src/app/(main)/data/blogPosts.ts` to handle both formats or migrate existing posts.

### 5. Add Admin Route (Optional)

Create `src/app/admin/[[...slug]]/page.tsx` to serve the admin interface:

```typescript
import { redirect } from "next/navigation";

export default function AdminPage() {
  // In production, you might want to add authentication here
  redirect("/admin/index.html");
}
```

Or simply access `/admin/index.html` directly.

### 6. Configure Authentication

#### Option A: GitHub OAuth (Recommended)

1. Create a GitHub OAuth App:
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Register a new OAuth application
   - Set Authorization callback URL: `https://your-site.com/admin/`

2. Update `public/admin/config.yml`:
```yaml
backend:
  name: github
  repo: your-username/your-repo-name
  branch: main
```

#### Option B: Netlify Identity (If deploying to Netlify)

1. Enable Netlify Identity in your Netlify dashboard
2. Enable Git Gateway
3. The `git-gateway` backend in config.yml will work automatically

#### Option C: GitLab OAuth

Similar to GitHub, but use `name: gitlab` in the backend config.

### 7. Update .gitignore

Ensure blog images directory is tracked:

```
# Don't ignore blog images
!public/images/blog/
```

---

## Content Schema

The Decap CMS config should match our `BlogPost` interface:

```typescript
interface BlogPost {
  slug: string;      // Derived from filename
  title: string;      // From frontmatter
  date: string;       // From frontmatter (YYYY-MM-DD format)
  excerpt: string;    // From frontmatter
  content: string;    // Markdown body converted to HTML
}
```

**Note**: Decap CMS will create files like `hello-world.md` with frontmatter:
```yaml
---
title: "Hello World"
date: 2026-02-01T00:00:00.000Z
excerpt: "Welcome to my blog..."
---
```

And the body content follows after the frontmatter.

---

## Deployment Considerations

### Vercel

1. Use GitHub OAuth for authentication
2. Ensure the `public/admin/` directory is included in the build
3. Set up GitHub OAuth app with Vercel deployment URL

### Netlify

1. Enable Netlify Identity and Git Gateway
2. Use `git-gateway` backend (simplest option)
3. Admin interface automatically available at `/admin/`

### Other Platforms

- Ensure static files in `public/` are served correctly
- Configure OAuth with your Git provider
- Set callback URLs to match your deployment domain

---

## Migration Path

1. **Phase 1**: Set up Decap CMS alongside existing Markdown files
2. **Phase 2**: Test creating/editing posts through the CMS
3. **Phase 3**: Migrate existing posts if format differs
4. **Phase 4**: Update documentation for content editors

---

## Security Considerations

- **Authentication**: Always use OAuth or Netlify Identity (never store credentials)
- **Access Control**: Consider restricting `/admin/` route to authenticated users only
- **Content Validation**: Decap CMS validates content structure, but ensure your data layer handles edge cases
- **Git Permissions**: Use a GitHub App or deploy key with minimal permissions (read/write to content directory only)

---

## Resources

- [Decap CMS Documentation](https://decapcms.org/docs/)
- [Git Gateway Setup](https://decapcms.org/docs/authentication-backends/#git-gateway)
- [GitHub OAuth Setup](https://decapcms.org/docs/authentication-backends/#github-backend)
- [Configuration Options](https://decapcms.org/docs/configuration-options/)

---

## Future Enhancements

- **Image Uploads**: Configure media library for blog post images
- **Draft Posts**: Add `published: false` field for draft management
- **Categories/Tags**: Extend schema to support blog categories
- **Author Information**: Add author field if multiple contributors
- **Preview URLs**: Configure preview URLs for draft posts

---

## Notes

- Decap CMS works best with a static site generator (like Next.js with static exports)
- For dynamic Next.js apps, ensure the admin interface is served statically
- Consider adding a "Save Draft" workflow if you want unpublished posts
- The CMS UI is customizable via CSS if you want to match your Windows 98 theme!
