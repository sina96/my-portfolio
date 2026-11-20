import type { Metadata } from "next";
import Link from "next/link";
import { siteAlternates } from "@/lib/site";
import { BlogList } from "../components/BlogList";
import { HillScene } from "../components/HillScene";
import { XpWindow } from "../components/XpWindow";
import { getAllBlogPosts } from "../data/blogPosts";

export const metadata: Metadata = {
  title: "Blog",
  description: "Browse all posts by Sina Bastani.",
  alternates: siteAlternates("/blog"),
};

export default function BlogPage() {
  return (
    <>
      <HillScene mode="header" />
      <main id="main" className="xp-content" tabIndex={-1}>
        <XpWindow id="blog-archive" title="My Blog">
          <div className="xp-rss">
            <Link href="/feed.xml" aria-label="RSS feed" title="RSS feed">
              <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
                <rect width="14" height="14" rx="2" fill="#ff8c00" />
                <path d="M3 6a5 5 0 0 1 5 5M3 3a8 8 0 0 1 8 8" fill="none" stroke="white" strokeWidth="1.4" />
                <circle cx="3.4" cy="10.6" r="1.2" fill="white" />
              </svg>
            </Link>
          </div>
          <h1 className="xp-sr-only">My Blog</h1>
          <BlogList posts={getAllBlogPosts()} />
          <div className="xp-actions"><Link href="/" className="xp-button-link">Home</Link></div>
        </XpWindow>
      </main>
    </>
  );
}
