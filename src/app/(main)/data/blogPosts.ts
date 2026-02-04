import { BlogPost } from "../types/blog";

// Single source of truth for all blog posts
// Each post contains both metadata (for lists) and full content (for detail pages)
export const blogPostsData: Record<
  string,
  BlogPost & { content: string }
> = {
  "hello-world": {
    slug: "hello-world",
    title: "Hello World - My First Blog Post",
    date: "2026-02-01",
    excerpt: "Welcome to my blog! This is my first post where I share my thoughts on web development and life.",
    content: `
      <p>Welcome to my blog! This is my first post where I share my thoughts on web development and life.</p>
      
      <p>I've been working on this portfolio website and decided to give it a retro Windows 98 theme. It's been a fun project combining modern web technologies with nostalgic design elements.</p>
      
      <p>In this blog, I'll be sharing:</p>
      <ul>
        <li>My experiences as a developer</li>
        <li>Projects I'm working on</li>
        <li>Thoughts on technology and coding</li>
        <li>Random musings about life</li>
      </ul>
      
      <p>Stay tuned for more posts!</p>
    `,
  },
};

// Helper function to get all posts as an array (for list views)
export function getAllBlogPosts(): BlogPost[] {
  // Sort newest -> oldest (stable: ties keep declaration order)
  return Object.values(blogPostsData)
    .map(({ content, ...post }, idx) => ({ post, idx }))
    .sort((a, b) => {
      const aTime = new Date(a.post.date).getTime();
      const bTime = new Date(b.post.date).getTime();

      if (bTime !== aTime) return bTime - aTime;
      return a.idx - b.idx;
    })
    .map(({ post }) => post);
}

// Helper function to get a single post by slug (for detail pages)
export function getBlogPost(slug: string): (BlogPost & { content: string }) | undefined {
  return blogPostsData[slug];
}
