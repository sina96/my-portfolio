import { Suspense } from "react";
import { getAllBlogPosts } from "./data/blogPosts";
import { HomeContent } from "./components/HomeContent";

const blogPosts = getAllBlogPosts();

export default function Home() {
  return (
    <Suspense fallback={<div style={{ padding: "20px" }}>Loading...</div>}>
      <HomeContent blogPosts={blogPosts} />
    </Suspense>
  );
}
