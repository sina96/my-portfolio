"use client";
import Link from "next/link";
import { BlogPost } from "../types/blog";

interface BlogsTabProps {
  posts: BlogPost[];
}

export function BlogsTab({ posts }: BlogsTabProps) {
  return (
    <div>
      <h2 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "16px", color: "var(--win98-text)" }}>
        Blog Archive
      </h2>
      <ul className="tree-view">
        {posts.map((post) => (
          <li key={post.slug}>
            <details open>
              <summary style={{ color: "var(--win98-text)" }}>{post.date}</summary>
              <ul>
                <li>
                  <Link
                    href={`/blog/${post.slug}`}
                    style={{ color: "var(--win98-link-color, blue)", textDecoration: "underline" }}
                  >
                    {post.title}
                  </Link>
                </li>
              </ul>
            </details>
          </li>
        ))}
      </ul>
    </div>
  );
}
