import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { parse as parseYaml } from "yaml";
import hljs from "highlight.js/lib/common";
import { marked } from "marked";
import type { BlogPost } from "../types/blog";
import { sanitizeHtml } from "../utils/sanitizeHtml";

const postsDirectory = path.join(process.cwd(), "src/content/blog");

const blogMarkdownRenderer = new marked.Renderer();
// Keep YAML dates as strings so invalid calendar days aren't silently rolled over.
const matterOptions = { engines: { yaml: (input: string) => parseYaml(input) ?? {} } };

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

export function normalizeDateString(date: string): string | undefined {
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

/** Expands CMS shortcodes outside Markdown fenced code blocks. */
export function expandBlogAuthoringShortcodes(content: string): string {
  let fence = "";

  return content
    .split(/\r?\n/)
    .map((line) => {
      if (fence) {
        const closingFence = /^ {0,3}(`{3,}|~{3,})[ \t]*$/.exec(line)?.[1];
        if (closingFence?.[0] === fence[0] && closingFence.length >= fence.length) fence = "";
        return line;
      }

      const openingFence = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line);
      if (openingFence && (openingFence[1][0] === "~" || !openingFence[2].includes("`"))) {
        fence = openingFence[1];
        return line;
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
export function isValidSlug(slug: string): boolean {
  // Only allow alphanumeric characters, hyphens, and underscores
  // Reject any path separators or traversal patterns
  return /^[a-zA-Z0-9_-]+$/.test(slug);
}

export function isValidFrontmatter(
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

/** Read metadata from published Markdown, without filesystem access. */
export function parsePublicBlogPost(slug: string, markdown: string) {
  if (!isValidSlug(slug)) return undefined;
  const filename = `${slug}.md`;
  const { data, content } = matter(markdown, matterOptions);
  if (isHiddenPost(data, filename)) return undefined;
  const validation = isValidFrontmatter(data, filename);
  if (!validation.valid) return undefined;
  const { title, date, excerpt } = validation;
  return { post: { slug, title, date, excerpt }, content };
}

/** List public posts from the repository's blog directory. */
export function getAllBlogPosts(): BlogPost[] {
  if (!fs.existsSync(postsDirectory)) return [];
  const posts: BlogPost[] = [];
  for (const file of fs.readdirSync(postsDirectory)) {
    if (!file.endsWith(".md")) continue;
    const slug = file.slice(0, -3);
    if (!isValidSlug(slug)) {
      console.warn(`[Blog] Invalid filename "${file}": only letters, numbers, hyphens, and underscores allowed`);
      continue;
    }
    const parsed = parsePublicBlogPost(slug, fs.readFileSync(path.join(postsDirectory, file), "utf8"));
    if (parsed) posts.push(parsed.post);
  }
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

/** Get one published post by slug from the fixed blog directory. */
export function getBlogPost(slug: string): (BlogPost & { content: string }) | undefined {
  if (!isValidSlug(slug)) return undefined;
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) return undefined;
  const parsed = parsePublicBlogPost(slug, fs.readFileSync(fullPath, "utf8"));
  return parsed && { ...parsed.post, content: renderBlogMarkdown(parsed.content) };
}
