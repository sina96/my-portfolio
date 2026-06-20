import type { Metadata } from "next";
import Link from "next/link";
import { getBlogPost } from "../../data/blogPosts";
import { ThemeInitializer } from "../../components/ThemeInitializer";
import { Win98Window } from "../../components/Win98Window";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return {
      title: "Post Not Found",
      description: "This blog post could not be found.",
      robots: { index: false, follow: false },
    };
  }

  return {
    title: post.title,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      type: "article",
      url: `/blog/${post.slug}`,
      title: post.title,
      description: post.excerpt,
      publishedTime: `${post.date}T00:00:00.000Z`,
    },
    twitter: {
      card: "summary",
      title: post.title,
      description: post.excerpt,
    },
  };
}

export default async function BlogPost({ params }: BlogPostPageProps) {
  // In Next.js 15+, params is a Promise in Server Components
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return (
      <>
        <ThemeInitializer />
        <div className="win98-page-shell">
          <Win98Window title="Post Not Found" className="blog-not-found-window">
            <p>Sorry, this blog post could not be found.</p>
            <div className="field-row blog-actions">
              <Link
                href="/"
                className="button button-link"
              >
                Back to Home
              </Link>
            </div>
          </Win98Window>
        </div>
      </>
    );
  }

  // Marked converts our trusted Markdown files to HTML, which is safe to render
  // Content comes from our own .md files in src/content/blog/

  return (
    <>
      <ThemeInitializer />
      <div className="win98-page-shell">
        <Win98Window
          title={post.title}
          className="blog-post-window"
          showMinimize
          showMaximize
          statusBar={
            <div className="status-bar">
              <p className="status-bar-field">Blog Post</p>
              <p className="status-bar-field">{post.date}</p>
            </div>
          }
        >
          <div className="blog-post-header">
            <div className="blog-post-date">
              Published: {post.date}
            </div>
            <h1 className="blog-post-title">
              {post.title}
            </h1>
          </div>

          <div
            className="blog-post-content"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <div className="field-row blog-post-actions">
            <Link
              href="/?tab=blogs"
              className="button default button-link"
            >
              Back to Blog Archive
            </Link>
            <Link
              href="/"
              className="button default button-link"
            >
              Back to Homepage
            </Link>
          </div>
        </Win98Window>
      </div>
    </>
  );
}
