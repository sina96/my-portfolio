import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import { sanitizeHtml } from "../utils/sanitizeHtml";

const cvFilePath = path.join(process.cwd(), "src/content/cv/sina-cv.md");

// Configure marked for safe HTML output
marked.setOptions({
  breaks: true,
  gfm: true,
});

/**
 * Helper function to get CV content as both raw Markdown and rendered HTML.
 * Returns empty strings on error with a warning logged to console.
 */
export function getCVContent(): { rawMarkdown: string; renderedHtml: string } {
  try {
    if (!fs.existsSync(cvFilePath)) {
      console.warn("[CV] CV file not found at:", cvFilePath);
      return { rawMarkdown: "", renderedHtml: "" };
    }

    const fileContents = fs.readFileSync(cvFilePath, "utf8");
    const { content } = matter(fileContents);

    const htmlContent = marked(content) as string;

    return {
      rawMarkdown: content,
      renderedHtml: sanitizeHtml(htmlContent),
    };
  } catch (error) {
    console.warn("[CV] Error reading CV file:", error);
    return { rawMarkdown: "", renderedHtml: "" };
  }
}