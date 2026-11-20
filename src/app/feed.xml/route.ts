import { getAllBlogPosts, getBlogPost } from "../(main)/data/blogPosts";

import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { escapeXml, xmlCdata } from "@/lib/xml";

export const dynamic = "force-static";

function formatRssDate(date: string): string {
  return new Date(`${date}T00:00:00Z`).toUTCString();
}

export function GET(): Response {
  const posts = getAllBlogPosts().flatMap(({ slug }) => getBlogPost(slug) ?? []);
  const lastBuildDate = posts[0] ? formatRssDate(posts[0].date) : new Date().toUTCString();

  const items = posts
    .map(
      (post) => `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${SITE_URL}/blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${post.slug}</guid>
      <description>${escapeXml(post.excerpt)}</description>
      <dc:creator>${escapeXml(SITE_NAME)}</dc:creator>
      <content:encoded>${xmlCdata(post.content)}</content:encoded>
      <pubDate>${formatRssDate(post.date)}</pubDate>
    </item>`
    )
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(SITE_NAME)}</title>
    <link>${SITE_URL}</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>en</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${SITE_URL}/feed.xml" rel="self" type="application/rss+xml"/>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800",
    },
  });
}
