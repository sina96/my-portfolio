"use client";
import Link from "next/link";
import { BlogPost } from "../types/blog";

interface BlogsTabProps {
  posts: BlogPost[];
}

export function BlogsTab({ posts }: BlogsTabProps) {
  return (
    <div>
      <h2 className="win98-section-title">
        Blog Archive
      </h2>
      <ul className="tree-view">
        {posts.map((post) => (
          <li key={post.slug}>
            <details open>
              <summary>{post.date}</summary>
              <ul>
                <li>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="win98-link"
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
