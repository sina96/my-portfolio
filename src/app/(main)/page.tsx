import type { Metadata } from "next";
import { Suspense } from "react";
import { getAllBlogPosts } from "./data/blogPosts";
import { HomeContent } from "./components/HomeContent";

export const metadata: Metadata = {
  title: "Home",
  description: "Portfolio, blog posts, and contact info for Sina Bastani.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  // Fetch blog posts inside the component to ensure fresh data on each request
  const blogPosts = getAllBlogPosts();

  return (
    <Suspense fallback={<div style={{ padding: "20px" }}>Loading...</div>}>
      <HomeContent blogPosts={blogPosts} />
    </Suspense>
  );
}
