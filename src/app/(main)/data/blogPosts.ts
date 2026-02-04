import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import { BlogPost } from "../types/blog";
import { sanitizeHtml } from "../utils/sanitizeHtml";

const postsDirectory = path.join(process.cwd(), "src/content/blog");

// Configure marked for safe HTML output
marked.setOptions({
  breaks: true,
  gfm: true,
});

// Helper function to get all posts as an array (for list views)
export function getAllBlogPosts(): BlogPost[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const files = fs.readdirSync(postsDirectory);
  const posts = files
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const slug = file.replace(/\.md$/, "");
      const fullPath = path.join(postsDirectory, file);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);
      return {
        slug,
        title: data.title,
        date: data.date,
        excerpt: data.excerpt,
      };
    });

  // Sort by date descending (stable: preserve file order for ties)
  return posts.sort((a, b) => {
    const aTime = new Date(a.date).getTime();
    const bTime = new Date(b.date).getTime();

    if (bTime !== aTime) return bTime - aTime;
    // Stable sort: maintain original order for same dates
    return 0;
  });
}

// Validate slug to prevent path traversal attacks
function isValidSlug(slug: string): boolean {
  // Only allow alphanumeric characters, hyphens, and underscores
  // Reject any path separators or traversal patterns
  return /^[a-zA-Z0-9_-]+$/.test(slug);
}

// Helper function to get a single post by slug (for detail pages)
export function getBlogPost(slug: string): (BlogPost & { content: string }) | undefined {
  // Validate slug format to prevent path traversal
  if (!isValidSlug(slug)) {
    return undefined;
  }

  const fullPath = path.resolve(postsDirectory, `${slug}.md`);

  // Double-check: ensure resolved path is within postsDirectory
  if (!fullPath.startsWith(postsDirectory + path.sep)) {
    return undefined;
  }

  if (!fs.existsSync(fullPath)) {
    return undefined;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const htmlContent = marked(content) as string;

  return {
    slug,
    title: data.title,
    date: data.date,
    excerpt: data.excerpt,
    content: sanitizeHtml(htmlContent),
  };
}
