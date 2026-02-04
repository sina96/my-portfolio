import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { marked } from "marked";
import { BlogPost } from "../types/blog";

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

// Helper function to get a single post by slug (for detail pages)
export function getBlogPost(slug: string): (BlogPost & { content: string }) | undefined {
  const fullPath = path.join(postsDirectory, `${slug}.md`);
  if (!fs.existsSync(fullPath)) {
    return undefined;
  }

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);
  const htmlContent = marked(content);

  return {
    slug,
    title: data.title,
    date: data.date,
    excerpt: data.excerpt,
    content: htmlContent as string,
  };
}
