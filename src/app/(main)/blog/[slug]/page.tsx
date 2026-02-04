"use client";
import Link from "next/link";
import { use, useEffect } from "react";

// Blog posts data - in a real app, this would come from a CMS or database
const blogPosts: Record<
  string,
  { title: string; date: string; content: string }
> = {
  "hello-world": {
    title: "Hello World! My blog debut",
    date: "2026-02-04",
    content: `
      <p>Testing posting a blog post!</p>
      
      <p>I've been working on this portfolio website and decided to give it a retro Windows 98 theme. Hits the retro nerves just right.</p>
      
      <p>Oh yeah, added blogs too. I might use them for:</p>
      <ul>
        <li>cool project ideas</li>
        <li>Review on a tool or product</li>
        <li>Rants and ramblings about coding or life</li>
        <li>who knows more</li>
      </ul>
    `,
  },
};

export default function BlogPost({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const post = blogPosts[slug];

  useEffect(() => {
    // Check localStorage for saved preference first
    const saved = localStorage.getItem("theme");
    if (saved) {
      // User has a saved preference
      document.documentElement.setAttribute("data-theme", saved === "dark" ? "dark" : "light");
    } else {
      // No saved preference, check system/browser preference
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.setAttribute("data-theme", prefersDark ? "dark" : "light");
    }
  }, []);

  if (!post) {
    return (
      <div style={{ padding: "20px", minHeight: "100vh" }}>
        <div className="window" style={{ maxWidth: "600px", margin: "0 auto" }}>
          <div className="title-bar">
            <div className="title-bar-text">Post Not Found</div>
            <div className="title-bar-controls">
              <button aria-label="Close"></button>
            </div>
          </div>
          <div className="window-body">
            <p>Sorry, this blog post could not be found.</p>
            <div className="field-row" style={{ marginTop: "20px" }}>
              <Link href="/">
                <button>Back to Home</button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: "20px", minHeight: "100vh" }}>
      <div className="window" style={{ maxWidth: "800px", margin: "0 auto" }}>
        <div className="title-bar">
          <div className="title-bar-text">{post.title}</div>
          <div className="title-bar-controls">
            <button aria-label="Minimize"></button>
            <button aria-label="Maximize"></button>
            <button aria-label="Close"></button>
          </div>
        </div>
        <div className="window-body">
          <div
            style={{
              marginBottom: "16px",
              paddingBottom: "12px",
              borderBottom: "1px solid var(--win98-border-dark, #C0C0C0)",
            }}
          >
            <div style={{ fontSize: "11px", color: "var(--win98-text-secondary, #808080)", marginBottom: "8px" }}>
              Published: {post.date}
            </div>
            <h1 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "8px", color: "var(--win98-text, black)" }}>
              {post.title}
            </h1>
          </div>

          <div
            className="blog-post-content"
            style={{
              fontSize: "12px",
              lineHeight: "1.6",
              color: "var(--win98-text, black)",
            }}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="field-row" style={{ marginTop: "24px", display: "flex", gap: "8px" }}>
            <Link href="/?tab=blogs">
              <button className="default" style={{ color: "var(--win98-text, black)" }}>Back to Blog Archive</button>
            </Link>
            <Link href="/">
              <button className="default" style={{ color: "var(--win98-text, black)" }}>Back to Homepage</button>
            </Link>
          </div>
        </div>
        <div className="status-bar">
          <p className="status-bar-field">Blog Post</p>
          <p className="status-bar-field">{post.date}</p>
        </div>
      </div>
    </div>
  );
}
