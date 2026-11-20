import Link from "next/link";
import type { BlogPost } from "../types/blog";

const POST_DATE = new Intl.DateTimeFormat("en-GB", {
  day: "numeric", month: "short", year: "numeric", timeZone: "UTC",
});

export function BlogDate({ date }: Readonly<{ date: string }>) {
  return <time className="xp-meta" dateTime={date}>{POST_DATE.format(new Date(`${date}T00:00:00Z`))}</time>;
}

export function BlogList({ posts }: Readonly<{ posts: readonly BlogPost[] }>) {
  if (!posts.length) return <p>No blog posts yet.</p>;

  return (
    <ul className="xp-post-list">
      {posts.map((post) => (
        <li key={post.slug}>
          <div className="xp-post-row">
            <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            <BlogDate date={post.date} />
          </div>
          <p>{post.excerpt}</p>
        </li>
      ))}
    </ul>
  );
}
