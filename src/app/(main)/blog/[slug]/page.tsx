import Link from "next/link";
import { getBlogPost } from "../../data/blogPosts";
import { ThemeInitializer } from "../../components/ThemeInitializer";

interface BlogPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function BlogPost({ params }: BlogPostPageProps) {
  // In Next.js 15+, params is a Promise in Server Components
  const { slug } = await params;
  const post = getBlogPost(slug);

  if (!post) {
    return (
      <>
        <ThemeInitializer />
        <div style={{ padding: "20px", minHeight: "100vh" }}>
          <div className="window" style={{ maxWidth: "600px", margin: "0 auto" }}>
            <div className="title-bar">
              <div className="title-bar-text">Post Not Found</div>
              <div className="title-bar-controls">
                <button aria-label="Close"></button>
              </div>
            </div>
            <div className="window-body">
              <p>Sorry, this blog post could not be found.</p>
              <div className="field-row" style={{ marginTop: "20px" }}>
                <Link
                  href="/"
                  className="button"
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Marked converts our trusted Markdown files to HTML, which is safe to render
  // Content comes from our own .md files in src/content/blog/

  return (
    <>
      <ThemeInitializer />
      <div style={{ padding: "20px", minHeight: "100vh" }}>
        <div className="window" style={{ maxWidth: "800px", margin: "0 auto" }}>
          <div className="title-bar">
            <div className="title-bar-text">{post.title}</div>
            <div className="title-bar-controls">
              <button aria-label="Minimize"></button>
              <button aria-label="Maximize"></button>
              <button aria-label="Close"></button>
            </div>
          </div>
          <div className="window-body">
            <div
              style={{
                marginBottom: "16px",
                paddingBottom: "12px",
                borderBottom: "1px solid var(--win98-border-dark, #C0C0C0)",
              }}
            >
              <div style={{ fontSize: "11px", color: "var(--win98-text-secondary, #808080)", marginBottom: "8px" }}>
                Published: {post.date}
              </div>
              <h1 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "8px", color: "var(--win98-text, black)" }}>
                {post.title}
              </h1>
            </div>

            <div
              className="blog-post-content"
              style={{
                fontSize: "12px",
                lineHeight: "1.6",
                color: "var(--win98-text, black)",
              }}
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            <div className="field-row" style={{ marginTop: "24px", display: "flex", gap: "8px" }}>
              <Link
                href="/?tab=blogs"
                className="button default"
                style={{ textDecoration: "none", color: "var(--win98-text, black)" }}
              >
                Back to Blog Archive
              </Link>
              <Link
                href="/"
                className="button default"
                style={{ textDecoration: "none", color: "var(--win98-text, black)" }}
              >
                Back to Homepage
              </Link>
            </div>
          </div>
          <div className="status-bar">
            <p className="status-bar-field">Blog Post</p>
            <p className="status-bar-field">{post.date}</p>
          </div>
        </div>
      </div>
    </>
  );
}
