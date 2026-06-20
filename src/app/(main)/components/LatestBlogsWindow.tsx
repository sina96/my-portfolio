"use client";
import Link from "next/link";
import { BlogPost } from "../types/blog";
import { Win98Window } from "./Win98Window";

interface LatestBlogsWindowProps {
  posts: BlogPost[];
}

export function LatestBlogsWindow({ posts }: LatestBlogsWindowProps) {
  return (
    <Win98Window title="Latest Blogs" className="win98-latest-blogs" showMinimize showMaximize>
      {posts.slice(0, 3).map((post) => (
        <div key={post.slug} className="latest-blog-item">
          <div className="latest-blog-header">
            <Link
              href={`/blog/${post.slug}`}
              className="latest-blog-link"
            >
              {post.title}
            </Link>
            <span className="latest-blog-date">
              {post.date}
            </span>
          </div>
          <p className="latest-blog-excerpt">
            {post.excerpt}
          </p>
        </div>
      ))}
    </Win98Window>
  );
}
