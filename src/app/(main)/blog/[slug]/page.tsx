import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { JsonLd } from "@/lib/jsonLd";
import { SITE_NAME, SITE_URL, siteAlternates } from "@/lib/site";
import { BlogDate } from "../../components/BlogList";
import { HillScene } from "../../components/HillScene";
import { XpWindow } from "../../components/XpWindow";
import { getAllBlogPosts, getBlogPost } from "../../data/blogPosts";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

const getPost = cache(getBlogPost);

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return getAllBlogPosts().map(({ slug }) => ({ slug }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return {
    title: post.title,
    description: post.excerpt,
    alternates: siteAlternates(`/blog/${post.slug}`),
    openGraph: {
      type: "article",
      url: `/blog/${post.slug}`,
      title: post.title,
      description: post.excerpt,
      publishedTime: `${post.date}T00:00:00.000Z`,
    },
    twitter: { card: "summary_large_image", title: post.title, description: post.excerpt },
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  return (
    <>
      <JsonLd value={{
        "@context": "https://schema.org", "@type": "BlogPosting",
        headline: post.title, description: post.excerpt, datePublished: post.date,
        url: `${SITE_URL}/blog/${post.slug}`,
        author: { "@type": "Person", name: SITE_NAME, url: SITE_URL },
      }} />
      <HillScene mode="header" />
      <main id="main" className="xp-content xp-post" tabIndex={-1}>
        <XpWindow id="post-article" title={post.title}>
          <BlogDate date={post.date} />
          <h1>{post.title}</h1>
          <div className="blog-post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
          <div className="xp-actions">
            <Link href="/blog" className="xp-button-link">← All posts</Link>
            <Link href="/" className="xp-button-link">Home</Link>
          </div>
        </XpWindow>
      </main>
    </>
  );
}
