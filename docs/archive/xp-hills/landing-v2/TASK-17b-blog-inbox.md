# Task 17b: The blog as a mail program (`inbox.exe`)

**Branch:** `landing-v2`, on top of uncommitted Tasks 12–17. Leave changes uncommitted. Do this **before
Task 18**.
**Read first:** `LANDING-V2.md`, `SPEC.md` §6 (blog rows), `AGENTS.md` "Content → Blog" and "Security rules",
`blog/page.tsx`, `blog/[slug]/page.tsx`, `components/BlogList.tsx`, `blog.css`.
After the task: `bun run lint && bun run typecheck && bun run test && bun run build`. Update `SPEC.md` §6 and
the AGENTS.md blog notes.

Owner: "CV has its own style, Contact has its own style, but the blog is the normal one." Decision
(2026-11-21): style `/blog` and posts as an **original XP-era mail client**. Start with it, then evaluate.
Folders are **years** (no new frontmatter). **RSS is an icon-only button.**

**Ownership rule:** generic mail-client layout only. No Outlook Express name, logo, icons or exact
chrome; draw our own pixel icons (reuse the `DesktopIcon` drawing approach).

## 1. `/blog` = `inbox.exe`
```
┌ inbox.exe ─────────────────────────────────────── _ □ x ┐
│ [✉ Reply] [↪ Forward] [rss-icon]                        │  toolbar
├──────────┬──────────────────────────────────────────────┤
│ 📥 Inbox │ ● Subject                         Received   │  list header
│ 📁 2026  │ ● your health is the skills.md…   19 Aug 2026 │  bold + dot = unread
│ 📁 2025  │   Slow the Fuck Down              20 Apr 2026 │
│          ├──────────────────────────────────────────────┤
│          │ From: Sina Bastani   Subject: …               │  preview pane
│          │ excerpt…                    [Open message →]  │
└──────────┴──────────────────────────────────────────────┘
status bar: "4 messages, 1 unread"
```
- Window title `inbox.exe`; taskbar button uses an envelope/inbox icon (new pixel glyph, not Contact's
  envelope if they'd look identical: e.g. an inbox tray).
- **Toolbar** (XP toolbar buttons, icon + label on desktop, icon + short label on mobile like the CV toolbar):
  - **Reply**: `mailto:` to `SITE_EMAIL` with subject `Re: <selected post title>` (encode properly).
  - **Forward**: `navigator.share({ title, url })` when available, else copy the post URL to the clipboard
    with a small XP tooltip "link copied" (try/catch; fall back to a prompt-free no-op message on failure).
  - **RSS: icon only** (the existing orange RSS glyph style), `aria-label="RSS feed"`, `title="RSS feed"`,
    links to `/feed.xml`. Replace the current top-right RSS glyph with this.
- **Folder pane** (desktop ≥760px): `Inbox` (all posts, default) and one folder per year that has posts,
  newest first, with counts. Selecting a folder filters the list client-side (URL `?folder=2026` is
  optional; if you add it, keep `/blog` static and read it after mount). Mobile: folders become a compact
  `<select>`-style row or are omitted; record the choice.
- **Message list**: columns Subject and Received (date via `BlogDate`), sorted newest first. Rows are
  real links to `/blog/<slug>` (keyboard/screen-reader friendly). Desktop: single click/focus selects a
  row and fills the preview pane; Enter or double-click opens it; the "Open message →" button opens it.
  Mobile: tapping a row opens the post directly (no preview pane).
- **Preview pane** (desktop): From, Date, Subject, the excerpt, "Open message →".
- **Unread state**: a post is "read" once its page has been opened. Store read slugs in localStorage
  (`blog-read`, JSON array, try/catch, cap ~200). Render the unread dot/bold **after mount only** (server
  and first client render show everything as read-neutral, no hydration mismatch). Status bar shows
  "{n} messages, {u} unread" after mount ("{n} messages" before).
- Hidden/invalid posts stay excluded (existing loader rules). Page stays statically rendered.

## 2. Post page = message window
- Window title: `<post title> - Message`. Under the title bar, the same toolbar (Reply / Forward / RSS
  icon) for this post, then a **header block** styled like a mail header (label column muted, mono-ish):
  `From: Sina Bastani`, `To: you`, `Date: <date>`, `Subject: <title>` (the subject is the page `<h1>`).
- Body: the existing `blog-post-content` (sanitized HTML, highlight.js, tables) with today's readable
  typography. Don't switch the article to monospace.
- Bottom nav row stays (← Inbox · Home), with the label "All posts" renamed "Inbox".
- Opening the post marks it read (after mount).
- Mobile: header block wraps cleanly; toolbar fits 375px; sticky title bar (14b) still works.

## 2b. Smaller list text on mobile, one-line excerpts on the landing (owner, 2026-11-21)
Owner: "the text in the Latest posts and About me windows, and the blog, can be a little smaller on mobile,
because longer post titles wrap onto two lines … and in Latest posts the excerpt should be only one line
and end in '…' on mobile. On /blog that's not important, but on the main page it is."
- **Mobile (<760px) text sizes:** in the landing Latest posts and About me windows and the `/blog` inbox
  list, step the text down ~10–15%: post titles ~0.95rem (from ~1.05–1.1rem), excerpts/body ~0.88rem,
  dates ~0.8rem. Keep ≥ 14px for titles and ≥ 13px for meta, keep tap targets ≥ 44px tall, and keep AA
  contrast. Blog **post articles** keep their current reading size.
- **Landing Latest posts excerpt: one line** on mobile: `white-space: nowrap; overflow: hidden;
  text-overflow: ellipsis` (full excerpt stays in the DOM for screen readers; no `title` needed). Titles may
  still wrap to two lines but should do so less often at the smaller size; if the date sits on the same row
  as the title, let the date drop below the title on mobile so the title gets the full width.
- `/blog` list excerpts aren't required to clamp (the inbox list shows subjects; the excerpt lives in the
  preview pane on desktop).
- Check at 375×812 and 360×740 with the longest current title ("your health is the skills.md that you
  should care about").

## 3. Keep
- Taskbar/minimize/close behaviour, header hill, RSS feed, sitemap, OG images, JSON-LD unchanged.
- Landing "Latest posts" window keeps its current look (optional: unread dots there too; record choice).

## Acceptance
- [x] Mobile: smaller list text in Latest posts / About me / inbox; landing excerpts are one line with "…"
- [x] `/blog` at 1440: toolbar (Reply, Forward, icon-only RSS), year folders with counts, message list,
      preview pane; selecting/filtering works with mouse and keyboard
- [x] `/blog` at 375: list full width, tap opens the post, toolbar fits, no horizontal scroll
- [x] Unread dots appear after mount, clear after opening a post, survive reload, no hydration warnings,
      work with storage blocked (everything just shows as read)
- [x] Post: message header (From/To/Date/Subject h1), Reply mailto with "Re: title", Forward shares/copies
- [x] Day and night readable; lint/typecheck/test/build pass (add a unit test for the year grouping and
      the read-state helper)

## Decisions log

- Mobile uses a native folder select, with no preview or selected-row treatment at rest. Desktop preserves real links (including modifier-click and Enter) while ordinary clicks or focus select a preview. No query-param state. All four currently published messages are from 2026; the grouping test covers multiple years.
- The server and hydration snapshot are read-neutral; a blocked read also stays neutral. Opening a message records its slug, capped at 200. Landing has no unread markers; its complete excerpts remain in the DOM and ellipsize visually on phones.
- Forward uses the canonical post URL; a cancelled native share does nothing, unavailable/failed share falls back to clipboard, and clipboard failure shows a short inline status without a prompt.
- Playwright verified day/night desktop, 375×812 and 360×740 mobile, the longest current subject, keyboard and touch navigation, sticky post title bar, reload and blocked storage, and the Web Share payload and clipboard paths with browser API stubs. No hydration warnings were observed.
- Lint (two existing Anita warnings), typecheck, all 42 tests and production build passed. The inbox and posts remain static, RSS still works, and /anita matched both screenshot baselines.
