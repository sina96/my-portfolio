import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { JsonLd } from "@/lib/jsonLd";
import { SITE_NAME, SITE_URL, siteAlternates } from "@/lib/site";
import { BlogDate } from "../../components/BlogList";
import { HillScene } from "../../components/HillScene";
import { XpNavLink } from "../../components/XpNavLink";
import { XpWindow } from "../../components/XpWindow";
import { getAllBlogPosts, getBlogPost } from "../../data/blogPosts";
import { MailToolbar } from "../MailToolbar";

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
        <XpWindow id="post-article" icon="blog" title={`${post.title} - Message`} className="xp-mail-window">
          <MailToolbar post={{ slug: post.slug, title: post.title }} />
          <dl className="xp-mail-fields xp-message-header">
            <dt>From:</dt><dd>{SITE_NAME}</dd>
            <dt>To:</dt><dd>you</dd>
            <dt>Date:</dt><dd><BlogDate date={post.date} /></dd>
            <dt>Subject:</dt><dd><h1>{post.title}</h1></dd>
          </dl>
          <div className="blog-post-content" dangerouslySetInnerHTML={{ __html: post.content }} />
          <div className="xp-actions">
            <XpNavLink href="/blog" label="Inbox" icon="back" />
            <XpNavLink href="/" label="Home" icon="home" />
          </div>
        </XpWindow>
      </main>
    </>
  );
}
