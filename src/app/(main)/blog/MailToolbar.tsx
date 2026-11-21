"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SITE_EMAIL, SITE_URL } from "@/lib/site";
import { DesktopGlyph } from "../components/DesktopIcon";
import type { BlogPost } from "../types/blog";
import { markBlogRead } from "./mailState";

interface MailToolbarProps {
  post?: Pick<BlogPost, "title" | "slug">;
}

/** Route navigation and, on a message only, copy and reply actions. */
export function MailToolbar({ post }: Readonly<MailToolbarProps>) {
  const [feedback, setFeedback] = useState<{ slug: string; text: string }>();
  const slug = post?.slug;
  useEffect(() => {
    if (slug) markBlogRead(slug);
  }, [slug]);
  useEffect(() => {
    if (!feedback) return;
    const timer = window.setTimeout(() => setFeedback(undefined), 2200);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  async function copyLink(): Promise<void> {
    if (!post) return;
    const { slug } = post;
    const url = `${SITE_URL}/blog/${slug}`;
    try {
      await navigator.clipboard.writeText(url);
      setFeedback({ slug, text: "link copied" });
    } catch {
      setFeedback({ slug, text: "couldn’t copy link" });
    }
  }

  return (
    <div className="xp-mail-toolbar" role="group" aria-label="Message actions">
      {post && <Link className="xp-mail-tool" href="/blog" aria-label="Back to Inbox">
        <DesktopGlyph icon="back" size={16} /><span>Inbox</span>
      </Link>}
      <Link className="xp-mail-tool" href="/">
        <DesktopGlyph icon="home" size={16} /><span>Home</span>
      </Link>
      {post && <>
        <div className="xp-mail-copy">
          <button type="button" className="xp-mail-tool" aria-label="Copy link" onClick={() => void copyLink()}>
            <DesktopGlyph icon="copy" size={16} /><span>Copy<span className="xp-mail-long-label"> link</span></span>
          </button>
          <span className="xp-mail-tip" role="status">{feedback?.slug === slug ? feedback?.text : ""}</span>
        </div>
        <a className="xp-mail-tool" href={`mailto:${SITE_EMAIL}?subject=${encodeURIComponent(`Re: ${post.title}`)}`}>
          <DesktopGlyph icon="contact" size={16} /><span>Reply</span>
        </a>
      </>}
      <a className="xp-mail-tool" href="/feed.xml" aria-label="RSS feed" title="RSS feed">
        <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <rect width="14" height="14" rx="2" fill="#ff8c00" />
          <path d="M3 6a5 5 0 0 1 5 5M3 3a8 8 0 0 1 8 8" fill="none" stroke="white" strokeWidth="1.4" />
          <circle cx="3.4" cy="10.6" r="1.2" fill="white" />
        </svg>
      </a>
    </div>
  );
}
