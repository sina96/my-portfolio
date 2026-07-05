import fs from "fs";
import path from "path";
import matter from "gray-matter";
import hljs from "highlight.js/lib/common";
import { marked } from "marked";
import type { BlogPost } from "../types/blog";
import { sanitizeHtml } from "../utils/sanitizeHtml";

const postsDirectory = path.join(process.cwd(), "src/content/blog");

const blogMarkdownRenderer = new marked.Renderer();

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeCodeLanguage(language: string | undefined): string | undefined {
  const normalized = language?.trim().split(/\s+/)[0].toLowerCase();

  if (!normalized || !/^[a-z0-9_+-]+$/.test(normalized)) {
    return undefined;
  }

  return normalized;
}

function normalizeDateString(date: string): string | undefined {
  const trimmedDate = date.trim();
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmedDate);

  if (!match) {
    return undefined;
  }

  const [, year, month, day] = match;
  const parsedDate = new Date(`${trimmedDate}T00:00:00Z`);

  if (
    Number.isNaN(parsedDate.getTime()) ||
    parsedDate.getUTCFullYear() !== Number(year) ||
    parsedDate.getUTCMonth() + 1 !== Number(month) ||
    parsedDate.getUTCDate() !== Number(day)
  ) {
    return undefined;
  }

  return trimmedDate;
}

function highlightCode(code: string, language: string | undefined): { html: string; language?: string } {
  const normalizedLanguage = normalizeCodeLanguage(language);

  if (normalizedLanguage && hljs.getLanguage(normalizedLanguage)) {
    const result = hljs.highlight(code, {
      language: normalizedLanguage,
      ignoreIllegals: true,
    });

    return { html: result.value, language: normalizedLanguage };
  }

  return { html: escapeHtml(code) };
}

blogMarkdownRenderer.code = ({ text, lang }) => {
  const highlighted = highlightCode(text, lang);
  const languageClass = highlighted.language ? ` language-${highlighted.language}` : "";

  return `<pre><code class="hljs${languageClass}">${highlighted.html}</code></pre>`;
};

function expandBlogAuthoringShortcodes(content: string): string {
  let inCodeFence = false;

  return content
    .split("\n")
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        inCodeFence = !inCodeFence;
        return line;
      }

      if (inCodeFence) {
        return line;
      }

      if (/^\s{0,3}([-*_])(?:\s*\1){2,}\s*$/.test(line)) {
        return "\n<hr>\n";
      }

      if (/^\s*\{\{divider\}\}\s*$/.test(line)) {
        return "<hr>";
      }

      if (/^\s*\{\{spacer\}\}\s*$/.test(line)) {
        return '<div class="blog-spacer"></div>';
      }

      if (/^\s*\{\{spacer-lg\}\}\s*$/.test(line)) {
        return '<div class="blog-spacer blog-spacer-lg"></div>';
      }

      return line;
    })
    .join("\n");
}

function wrapBlogTables(html: string): string {
  return html.replace(/<table>/g, '<div class="blog-table-scroll"><table>').replace(/<\/table>/g, "</table></div>");
}

/**
 * Converts blog Markdown to sanitized HTML.
 */
export function renderBlogMarkdown(content: string): string {
  const htmlContent = marked(expandBlogAuthoringShortcodes(content), {
    async: false,
    breaks: true,
    gfm: true,
    renderer: blogMarkdownRenderer,
  });

  return sanitizeHtml(wrapBlogTables(htmlContent));
}

// Validate frontmatter data
interface FrontmatterData {
  title?: unknown;
  date?: unknown;
  excerpt?: unknown;
  hidden?: unknown;
}

function isHiddenPost(data: FrontmatterData, filename: string): boolean {
  const { hidden } = data;

  if (hidden === undefined || hidden === null || hidden === false) {
    return false;
  }

  if (hidden === true) {
    return true;
  }

  console.warn(`[Blog] Invalid frontmatter in ${filename}: "hidden" must be a boolean`);
  return false;
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
    const normalizedDate = normalizeDateString(date);
    if (!normalizedDate) {
      console.warn(`[Blog] Invalid frontmatter in ${filename}: "date" must use valid YYYY-MM-DD format`);
      return { valid: false };
    }
    dateStr = normalizedDate;
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

    if (isHiddenPost(data, file)) {
      continue;
    }

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

  if (isHiddenPost(data, `${slug}.md`)) {
    return undefined;
  }

  // Validate frontmatter before returning
  const validation = isValidFrontmatter(data, `${slug}.md`);
  if (!validation.valid) {
    return undefined;
  }

  return {
    slug,
    title: validation.title,
    date: validation.date,
    excerpt: validation.excerpt,
    content: renderBlogMarkdown(content),
  };
}
