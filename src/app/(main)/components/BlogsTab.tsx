"use client";

import Link from "next/link";
import type { BlogPost } from "../types/blog";

interface BlogsTabProps {
  posts: BlogPost[];
}

export function BlogsTab({ posts }: BlogsTabProps) {
  return (
    <div className="blogs-tab">
      <div className="blogs-tab-header">
        <h2 className="win98-section-title">
          Blog Archive
        </h2>
        <a
          href="/feed.xml"
          className="button button-link rss-feed-button"
          type="application/rss+xml"
        >
          <span className="rss-feed-icon" aria-hidden="true" />
          RSS Feed
        </a>
      </div>

      {posts.length > 0 ? (
        <ul className="tree-view blog-archive-tree">
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
      ) : (
        <p className="blog-archive-empty">No blog posts yet.</p>
      )}
    </div>
  );
}
