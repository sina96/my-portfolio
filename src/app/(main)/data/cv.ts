import { readFileSync } from "node:fs";
import { join } from "node:path";
import matter from "gray-matter";
import { Marked } from "marked";
import sanitize from "sanitize-html";
import { SITE_NAME } from "@/lib/site";
import { sanitizeHtml } from "../utils/sanitizeHtml";

export interface CVLink {
  label: string;
  href: string;
  kind: "email" | "github" | "site";
}

export interface CVSection {
  id: string;
  title: string;
  html: string;
}

export interface CVData {
  header: { name: string; role: string; links: CVLink[] };
  sections: CVSection[];
  skills: { label: string; items: string[] }[];
  skillsSection?: CVSection;
  languages?: { label: string; items: string[] };
  lastUpdated?: string;
  copyMarkdown: string;
}

const CV_PATH = join(process.cwd(), "src/content/cv/sina-cv.md");
const markdown = new Marked({ gfm: true, breaks: true });
const PHONE = /(?:\(\s*\+\d{1,3}\s*\)|\+\d{1,3})[\t .-]*(?:\d[\t .-]*){7,14}\d|\b\d{9,15}\b/g;
const PHONE_HEADER = /(?:tel:|(?:phone|telephone|mobile)\b|(?:\d[\s().+-]*){7,})/i;

function cleanText(value: string): string {
  return sanitize(value, { allowedTags: [], allowedAttributes: {} }).replace(/&amp;/g, "&").trim();
}

function parseHeader(data: Record<string, unknown>): CVData["header"] {
  const name = typeof data.name === "string" && cleanText(data.name) ? cleanText(data.name) : SITE_NAME;
  const links: CVLink[] = [];
  let role = "";
  if (!Array.isArray(data.header) || typeof data.name !== "string") {
    console.warn("[CV] Missing or invalid résumé header; using the fallback name and available details.");
  }
  for (const item of Array.isArray(data.header) ? data.header : []) {
    if (!item || typeof item.text !== "string") continue;
    const label = cleanText(item.text);
    const href = typeof item.link === "string" ? item.link.trim() : "";
    if (!label || PHONE_HEADER.test(`${item.text} ${href}`)) continue;
    if (!href) {
      if (!role) role = label;
      continue;
    }
    let url: URL;
    try {
      if (/\s|[<>]/.test(href)) throw new Error("Invalid URL");
      url = new URL(href);
    } catch {
      console.warn("[CV] Ignoring an invalid header link.");
      continue;
    }
    if (url.protocol === "mailto:" && /^[^@]+@[^@]+$/.test(url.pathname) && !url.search && !url.hash) {
      links.push({ label, href, kind: "email" });
    } else if (url.protocol === "https:" && !url.username && !url.password) {
      links.push({ label, href, kind: url.hostname === "github.com" ? "github" : "site" });
    }
  }
  return { name, role, links };
}

const SKILLS_SECTION = /^(?:skills|skills-merits|core-skills)$/;
const LANGUAGES_SECTION = "languages";
const DATE_LIKE = /\d/;

function renderSection(body: string): string {
  const compact = body.replace(/^\s*(?:<br\s*\/?>\s*)+$/gim, "\n");
  return sanitizeHtml(markdown.parse(compact, { async: false }))
    // OhMyCV "~ meta" lines, either after a line break or as their own paragraph (e.g. under an h3).
    .replace(/<br\s*\/>\s*~\s*([^\n<]*(?:<em>[^<]*<\/em>[^\n<]*)?)/g, '<br /><span class="cv-entry-meta">$1</span>')
    .replace(/<p>\s*~\s*([^<]*(?:<em>[^<]*<\/em>[^<]*)?)<\/p>/g, '<p class="cv-entry-meta">$1</p>');
}

/** Parses `**Label:** a, b, c` lines; returns undefined when any line has another shape. */
function parseSkillGroups(content: string): CVData["skills"] | undefined {
  const lines = content.split("\n").filter((line) => line.trim());
  const groups = lines.map((line) => /^\*\*(.+?):\*\*\s*(.+)$/.exec(line.trim()));
  if (!groups.length || groups.some((group) => group === null)) return undefined;
  return groups.map((group) => ({
    label: cleanText(group![1]),
    items: group![2].replace(/\.$/, "").split(/[,;]/).map(cleanText).filter(Boolean),
  }));
}

/** Parses a plain comma-separated list (e.g. `Swedish (fluent), English (fluent)`). */
function parseList(content: string): string[] | undefined {
  const text = content.trim();
  if (!text || text.includes("\n") || /^[-*#]/.test(text)) return undefined;
  const items = text.replace(/\.$/, "").split(",").map(cleanText).filter(Boolean);
  return items.length ? items : undefined;
}

function emptyCV(): CVData {
  return { header: { name: SITE_NAME, role: "", links: [] }, sections: [], skills: [], copyMarkdown: `# ${SITE_NAME}` };
}

/** Parses the public résumé without carrying phone details into rendered HTML or clipboard text. */
export function parseCV(source: string): CVData {
  try {
    const { data, content } = matter(source);
    const header = parseHeader(data);
    // Ignore placeholders such as "update before exporting"; only show values that look like a date.
    const updated = cleanText(content.match(/<!--\s*LAST UPDATED:\s*([^\n]*?)\s*-->/i)?.[1] ?? "");
    const lastUpdated = DATE_LIKE.test(updated) ? updated : undefined;
    const body = content.replace(/<!--[\s\S]*?-->/g, "")
      .replace(/\[[^\]\n]*\]\(tel:[^\n)]*\)/gi, "")
      .replace(/^.*(?:href\s*=\s*["']tel:|data-icon\s*=\s*["'][^"']*phone).*$/gim, "")
      .replace(PHONE, "").trim();
    const sections: CVSection[] = [];
    let skillsSection: CVSection | undefined;
    let skills: CVData["skills"] = [];
    let languages: CVData["languages"];
    let currentTitle = "Profile";
    let currentContent = "";
    const store = () => {
      if (!currentContent.trim()) return;
      const title = cleanText(currentTitle) || "Profile";
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
      const section = { id, title, html: renderSection(currentContent) };
      const languageItems = id === LANGUAGES_SECTION && !languages ? parseList(currentContent) : undefined;
      if (SKILLS_SECTION.test(id) && !skillsSection) {
        skillsSection = section;
        skills = parseSkillGroups(currentContent) ?? [];
      } else if (languageItems) {
        // A standalone one-line Languages section moves to the sidebar; anything richer stays in the main column.
        languages = { label: title, items: languageItems };
      } else sections.push(section);
    };
    // Marked identifies true H2 headings without splitting a code fence.
    for (const token of markdown.lexer(body)) {
      if (token.type === "heading" && "depth" in token && token.depth === 2) {
        store();
        currentTitle = "text" in token ? String(token.text) : "Profile";
        currentContent = "";
      } else currentContent += token.raw;
    }
    store();
    const copyHeader = [
      `# ${header.name}`,
      header.role,
      header.links.map(({ label, href }) => `- [${label.replace(/[\[\]\\]/g, "\\$&")}](<${href}>)`).join("\n"),
    ].filter(Boolean).join("\n\n");
    return { header, sections, skills, skillsSection, languages, lastUpdated, copyMarkdown: [copyHeader, body].filter(Boolean).join("\n\n") };
  } catch {
    console.warn("[CV] Unable to parse the résumé; using the fallback.");
    return emptyCV();
  }
}

/** Loads the structured résumé from the canonical Markdown file. */
export function getCVContent(): CVData {
  try {
    return parseCV(readFileSync(CV_PATH, "utf8"));
  } catch {
    console.warn("[CV] Unable to read the résumé; using the fallback.");
    return emptyCV();
  }
}
