"use client";

import { useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import type { KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { SITE_NAME } from "@/lib/site";
import { BlogDate } from "../components/BlogList";
import { DesktopGlyph } from "../components/DesktopIcon";
import type { BlogPost } from "../types/blog";
import { MailToolbar } from "./MailToolbar";
import { groupBlogYears, parseBlogRead, readBlogServerSnapshot, readBlogSnapshot, subscribeToBlogRead } from "./mailState";

const INBOX = "inbox";
const DESKTOP = "(min-width: 760px)";
const desktop = () => window.matchMedia(DESKTOP).matches;
function subscribeDesktop(listener: () => void): () => void {
  const media = window.matchMedia(DESKTOP);
  media.addEventListener("change", listener);
  return () => media.removeEventListener("change", listener);
}

export function BlogInbox({ posts }: Readonly<{ posts: readonly BlogPost[] }>) {
  const router = useRouter();
  const isDesktop = useSyncExternalStore(subscribeDesktop, desktop, () => true);
  const panelId = useId();
  const list = useRef<HTMLDivElement>(null);
  const tabs = useRef<HTMLDivElement>(null);
  const [folder, setFolder] = useState(INBOX);
  const [selection, select] = useState<string>();
  const years = useMemo(() => groupBlogYears(posts), [posts]);
  const folders = [{ id: INBOX, label: "Inbox", posts }, ...years.map(({ year, posts }) => ({ id: year, label: year, posts }))];
  const messages = (folders.find(({ id }) => id === folder) ?? folders[0]).posts;
  const selected = messages.find(({ slug }) => slug === selection) ?? messages[0];
  const stored = useSyncExternalStore(subscribeToBlogRead, readBlogSnapshot, readBlogServerSnapshot);
  const read = useMemo(() => stored === null ? null : new Set(parseBlogRead(stored)), [stored]);
  const unread = read ? messages.filter(({ slug }) => !read.has(slug)).length : 0;
  const summary = `${messages.length} ${messages.length === 1 ? "message" : "messages"}${read ? `, ${unread} unread` : ""}`;

  function openFolder(id: string): void {
    setFolder(id);
    select(undefined);
    if (list.current) list.current.scrollTop = 0;
  }

  function onTabKey(event: KeyboardEvent<HTMLButtonElement>, index: number): void {
    const last = folders.length - 1;
    const next = event.key === "ArrowRight" ? (index + 1) % folders.length
      : event.key === "ArrowLeft" ? (index + last) % folders.length
      : event.key === "Home" ? 0 : event.key === "End" ? last : -1;
    if (next < 0) return;
    event.preventDefault();
    openFolder(folders[next].id);
    tabs.current?.querySelectorAll("button")[next]?.focus();
  }

  function onMessageKey(event: KeyboardEvent<HTMLAnchorElement>, index: number): void {
    if (!desktop() || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const last = messages.length - 1;
    const next = event.key === "ArrowDown" ? Math.min(last, index + 1)
      : event.key === "ArrowUp" ? Math.max(0, index - 1)
      : event.key === "Home" ? 0 : event.key === "End" ? last : -1;
    if (next < 0) return;
    event.preventDefault();
    const pane = list.current;
    const row = pane?.querySelectorAll<HTMLAnchorElement>(".xp-mail-row")[next];
    if (!pane || !row) return;
    row.focus({ preventScroll: true });
    const bounds = row.getBoundingClientRect();
    const viewport = pane.getBoundingClientRect();
    const top = pane.firstElementChild?.getBoundingClientRect().bottom ?? viewport.top;
    if (bounds.top < top) pane.scrollTop += bounds.top - top;
    else if (bounds.bottom > viewport.bottom) pane.scrollTop += bounds.bottom - viewport.bottom;
  }

  return (
    <>
      <MailToolbar />
      <div className="xp-mobile-inbox-heading">
        <DesktopGlyph icon="inbox" size={24} /><strong>Inbox</strong>
        <span>{summary.replace(", ", " · ")}</span>
      </div>
      <div className="xp-mail-layout">
        <div className="xp-mail-folders" role="group" aria-label="Mail folders">
          {folders.map(({ id, label, posts }) => <button key={id} type="button" aria-pressed={folder === id}
            onClick={() => openFolder(id)}>
            <DesktopGlyph icon={id === INBOX ? "inbox" : "folder"} size={16} />{label}<small>{posts.length}</small>
          </button>)}
        </div>
        <div className="xp-mail-tabs" role="tablist" aria-label="Mail folders" ref={tabs}>
          {folders.map(({ id, label, posts }, index) => <button key={id} id={`${panelId}-${id}`}
            type="button" role="tab" aria-selected={folder === id} aria-controls={panelId}
            tabIndex={folder === id ? 0 : -1} onClick={() => openFolder(id)} onKeyDown={(event) => onTabKey(event, index)}>
            {id === INBOX ? `${label} (${posts.length})` : label}
          </button>)}
        </div>
        <div className="xp-mail-messages">
          <div className="xp-mail-list" ref={list} id={panelId} role={isDesktop ? undefined : "tabpanel"}
            aria-labelledby={isDesktop ? undefined : `${panelId}-${folder}`}>
            <div className="xp-mail-columns" aria-hidden="true"><span>Subject</span><span>Received</span></div>
            {messages.length ? <ul aria-label="Messages">
              {messages.map((post, index) => {
                const href = `/blog/${post.slug}`;
                const isUnread = read !== null && !read.has(post.slug);
                return <li key={post.slug}>
                  <Link href={href} className="xp-mail-row" data-selected={selected?.slug === post.slug || undefined}
                    data-unread={isUnread || undefined} onKeyDown={(event) => onMessageKey(event, index)} onFocus={() => { if (desktop()) select(post.slug); }}
                    onClick={(event) => {
                      if (!desktop() || event.detail === 0 || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
                      event.preventDefault();
                      select(post.slug);
                    }} onDoubleClick={(event) => {
                      if (desktop() && !event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) router.push(href);
                    }}>
                    <span className="xp-mail-sender"><DesktopGlyph icon={read && !isUnread ? "mail-open" : "contact"} size={16} />{SITE_NAME}</span>
                    <span className="xp-mail-subject">
                      <i aria-hidden="true" />{isUnread && <span className="xp-sr-only">Unread: </span>}{post.title}
                    </span>
                    <BlogDate date={post.date} />
                    <span className="xp-mail-excerpt">{post.excerpt}</span>
                  </Link>
                </li>;
              })}
            </ul> : <p className="xp-mail-empty">No messages yet.</p>}
          </div>
          <section className="xp-mail-preview" aria-label="Message preview">
            {selected && <>
              <dl className="xp-mail-fields">
                <dt>From:</dt><dd>{SITE_NAME}</dd>
                <dt>Date:</dt><dd><BlogDate date={selected.date} /></dd>
                <dt>Subject:</dt><dd><strong>{selected.title}</strong></dd>
              </dl>
              <p>{selected.excerpt}</p>
              <Link className="xp-button-link" href={`/blog/${selected.slug}`}>Open message →</Link>
            </>}
          </section>
        </div>
      </div>
      <div className="status-bar xp-mail-status"><p className="status-bar-field">{summary}</p></div>
    </>
  );
}
