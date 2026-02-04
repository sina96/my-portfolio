"use client";
import Link from "next/link";

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
}

interface LatestBlogsWindowProps {
  posts: BlogPost[];
}

export function LatestBlogsWindow({ posts }: LatestBlogsWindowProps) {
  return (
    <div className="window win98-latest-blogs">
      <div className="title-bar">
        <div className="title-bar-text">Latest Blogs</div>
        <div className="title-bar-controls">
          <button aria-label="Minimize"></button>
          <button aria-label="Maximize"></button>
          <button aria-label="Close"></button>
        </div>
      </div>
      <div className="window-body">
        {posts.slice(0, 3).map((post) => (
          <div
            key={post.slug}
            style={{
              marginBottom: "12px",
              paddingBottom: "12px",
              borderBottom: "1px solid #C0C0C0",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "4px" }}>
              <Link
                href={`/blog/${post.slug}`}
                style={{
                  color: "blue",
                  textDecoration: "underline",
                  fontWeight: "bold",
                  fontSize: "12px",
                }}
              >
                {post.title}
              </Link>
              <span style={{ fontSize: "11px", color: "#808080", marginLeft: "8px" }}>
                {post.date}
              </span>
            </div>
            <p style={{ fontSize: "11px", color: "#808080", marginTop: "4px" }}>
              {post.excerpt}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
