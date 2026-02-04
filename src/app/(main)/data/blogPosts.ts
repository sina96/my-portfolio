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

// Validate frontmatter data
interface FrontmatterData {
  title?: unknown;
  date?: unknown;
  excerpt?: unknown;
}

// Validate slug to prevent path traversal and ensure consistency
function isValidSlug(slug: string): boolean {
  // Only allow alphanumeric characters, hyphens, and underscores
  // Reject any path separators or traversal patterns
  return /^[a-zA-Z0-9_-]+$/.test(slug);
}

function isValidFrontmatter(
  data: FrontmatterData,
  filename: string
): { valid: true; title: string; date: string; excerpt: string } | { valid: false } {
  const { title, date, excerpt } = data;

  // Validate title is a non-empty string
  if (typeof title !== "string" || title.trim() === "") {
    console.warn(`[Blog] Invalid frontmatter in ${filename}: missing or empty "title"`);
    return { valid: false };
  }

  // Validate excerpt is a non-empty string
  if (typeof excerpt !== "string" || excerpt.trim() === "") {
    console.warn(`[Blog] Invalid frontmatter in ${filename}: missing or empty "excerpt"`);
    return { valid: false };
  }

  // Validate and normalize date
  // gray-matter parses unquoted YAML dates as Date objects
  let dateStr: string;
  if (date instanceof Date) {
    // Check if Date object is valid before calling toISOString()
    // Invalid dates (e.g., from "2026-13-01") have NaN timestamp
    if (isNaN(date.getTime())) {
      console.warn(`[Blog] Invalid frontmatter in ${filename}: invalid "date" value`);
      return { valid: false };
    }
    // Format valid Date object to YYYY-MM-DD
    dateStr = date.toISOString().split("T")[0];
  } else if (typeof date === "string") {
    // Validate string date format
    const parsed = Date.parse(date);
    if (isNaN(parsed)) {
      console.warn(`[Blog] Invalid frontmatter in ${filename}: invalid "date" format`);
      return { valid: false };
    }
    dateStr = date;
  } else if (date === undefined || date === null) {
    console.warn(`[Blog] Invalid frontmatter in ${filename}: missing "date" field`);
    return { valid: false };
  } else {
    console.warn(`[Blog] Invalid frontmatter in ${filename}: "date" must be a string or Date`);
    return { valid: false };
  }

  return {
    valid: true,
    title: title.trim(),
    date: dateStr,
    excerpt: excerpt.trim(),
  };
}

// Helper function to get all posts as an array (for list views)
export function getAllBlogPosts(): BlogPost[] {
  if (!fs.existsSync(postsDirectory)) {
    return [];
  }

  const files = fs.readdirSync(postsDirectory);
  const posts: BlogPost[] = [];

  for (const file of files) {
    if (!file.endsWith(".md")) continue;

    const slug = file.replace(/\.md$/, "");

    // Validate slug to ensure consistency with getBlogPost
    if (!isValidSlug(slug)) {
      console.warn(`[Blog] Invalid filename "${file}": only letters, numbers, hyphens, and underscores allowed`);
      continue; // Skip files with invalid names
    }

    const fullPath = path.join(postsDirectory, file);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data } = matter(fileContents);

    // Validate frontmatter before adding to list
    const validation = isValidFrontmatter(data, file);
    if (!validation.valid) {
      continue; // Skip malformed posts
    }

    posts.push({
      slug,
      title: validation.title,
      date: validation.date,
      excerpt: validation.excerpt,
    });
  }

  // Sort by date descending (stable: preserve file order for ties)
  return posts.sort((a, b) => {
    const aTime = new Date(a.date).getTime();
    const bTime = new Date(b.date).getTime();

    if (bTime !== aTime) return bTime - aTime;
    // Stable sort: maintain original order for same dates
    return 0;
  });
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

  // Validate frontmatter before returning
  const validation = isValidFrontmatter(data, `${slug}.md`);
  if (!validation.valid) {
    return undefined;
  }

  const htmlContent = marked(content) as string;

  return {
    slug,
    title: validation.title,
    date: validation.date,
    excerpt: validation.excerpt,
    content: sanitizeHtml(htmlContent),
  };
}
