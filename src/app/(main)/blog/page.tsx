import type { Metadata } from "next";
import { siteAlternates } from "@/lib/site";
import { HillScene } from "../components/HillScene";
import { XpWindow } from "../components/XpWindow";
import { getAllBlogPosts } from "../data/blogPosts";
import { BlogInbox } from "./BlogInbox";

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
        <XpWindow id="blog-archive" icon="inbox" title="inbox.exe" className="xp-mail-window">
          <h1 className="xp-sr-only">Blog inbox</h1>
          <BlogInbox posts={getAllBlogPosts()} />
        </XpWindow>
      </main>
    </>
  );
}
