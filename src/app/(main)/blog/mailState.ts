import type { BlogPost } from "../types/blog";

export const BLOG_READ_KEY = "blog-read";
const READ_LIMIT = 200;

/** Group published posts by their ISO year, with newest years and messages first. */
export function groupBlogYears(posts: readonly BlogPost[]) {
  const groups = new Map<string, BlogPost[]>();
  for (const post of [...posts].sort((a, b) => b.date.localeCompare(a.date))) {
    const year = post.date.slice(0, 4);
    const entries = groups.get(year) ?? [];
    entries.push(post);
    groups.set(year, entries);
  }
  return [...groups].map(([year, entries]) => ({ year, posts: entries }));
}

/** Treat malformed storage as empty; accept only unique, valid slugs. */
export function parseBlogRead(raw: string): string[] {
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return [...new Set(value.filter((slug): slug is string => typeof slug === "string" && /^[a-zA-Z0-9_-]+$/.test(slug)))].slice(0, READ_LIMIT);
  } catch {
    return [];
  }
}

/** Move the most recently opened post to the front of the bounded history. */
export function addBlogRead(raw: string, slug: string): string {
  const before = parseBlogRead(raw).filter((entry) => entry !== slug);
  return JSON.stringify([slug, ...before].slice(0, READ_LIMIT));
}

// A failed write makes stored read state unreliable (the opened post would still look unread), so the
// inbox stays neutral, like blocked storage, until a later write succeeds.
let writeFailed = false;

export function readBlogSnapshot(): string | null {
  if (writeFailed) return null;
  try { return localStorage.getItem(BLOG_READ_KEY) ?? "[]"; } catch { return null; }
}

export const readBlogServerSnapshot = () => null;

export function subscribeToBlogRead(listener: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === null || event.key === BLOG_READ_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  window.addEventListener("pageshow", listener);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener("pageshow", listener);
  };
}

export function markBlogRead(slug: string): void {
  let raw: string;
  try { raw = localStorage.getItem(BLOG_READ_KEY) ?? "[]"; } catch { return; }
  try {
    localStorage.setItem(BLOG_READ_KEY, addBlogRead(raw, slug));
    writeFailed = false;
  } catch {
    writeFailed = true;
  }
}
