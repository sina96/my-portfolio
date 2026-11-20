import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";
import { getAllBlogPosts } from "./(main)/data/blogPosts";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...["/", "/blog", "/cv", "/contact", "/availability"].map((path) => ({ url: `${SITE_URL}${path}` })),
    ...getAllBlogPosts().map(({ slug, date }) => ({
      url: `${SITE_URL}/blog/${slug}`,
      lastModified: date,
    })),
  ];
}
