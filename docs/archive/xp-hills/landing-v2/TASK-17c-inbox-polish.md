# Task 17c: Inbox follow-ups: scrolling, a clearer mobile mail UI, toolbar actions

**Branch:** `landing-v2`, on top of uncommitted Tasks 12–17b. Leave changes uncommitted. Do this **before
Task 18**.
**Read first:** `TASK-17b-blog-inbox.md` (+ Decisions log), `blog/BlogInbox.tsx`, `blog/MailToolbar.tsx`,
`blog/mailState.ts`, `blog.css`.
After the task: `bun run lint && bun run typecheck && bun run test && bun run build`. Update `SPEC.md` §6.

Owner (after 17b): "On mobile I like that we don't show the preview. On desktop, if we have a lot more posts,
how does scrolling work with the preview? Wouldn't it look weird?" / "On mobile the folder dropdown is
unclear; on desktop it's obviously a joke/redo of a mail app, on mobile not so much. Redesign it for mobile to
make it clearer." / "Move the Home button to the top, especially on mobile and inside posts." / "Forwarding:
maybe just 'Copy link' is better." / "Reply is a fun thing, not sure it should do anything, especially on
mobile."

## 1. Desktop: list scrolls inside the window, preview stays put
Today the list grows with every post and the preview pane sits under the last row, so with 30 posts a click
near the top shows its preview far below the fold.
- The desktop (≥760px) inbox body gets a bounded height: `clamp(420px, calc(100dvh - <header overlap> -
  <taskbar> - 140px), 720px)`; the folder pane runs full height; the **message list scrolls inside its
  own pane** (`overflow-y: auto`, list header row sticky at its top); the **preview pane is pinned** below
  the list at a fixed height (~180px, its own scroll if an excerpt is long).
- The selected row is scrolled into view when moved to with the keyboard (Arrow Up/Down move the
  selection, Enter opens; Home/End jump). Wheel over the list scrolls the list, not the page.
- With few posts (like now) the list pane shows the rows and empty space, like a real mail client. Test
  with a fake fixture of ~30 posts (test-only, not committed content) to confirm.

## 2. Mobile (<760px): make it read as a phone mail app
- **Header strip** at the top of the window body: inbox icon + "Inbox" + "4 messages · 1 unread" (after
  mount; "4 messages" before). Remove the bottom status-bar line on mobile.
- **Folders as tabs** instead of the native select: a horizontal row of small XP tabs `Inbox (4)` `2026`
  `2025` …, scrollable sideways inside the row if there are many (the page itself never scrolls
  sideways). Selected tab looks raised/active; keyboard: tablist with arrow keys.
- **Mail-style rows** (three lines, like any phone mail list):
  1. pixel **envelope icon** (closed = unread, open = read; read state after mount, neutral before) +
     `Sina Bastani` (small, muted) + date right-aligned;
  2. **subject** (bold when unread);
  3. **excerpt** on one line with "…".
  Whole row is the link; ≥ 56px tall. Keep 17b's smaller mobile type sizes.
- No preview pane on mobile (as now).

## 3. Toolbar: Home on top, Copy link, Reply only where it makes sense (all widths)
- **Inbox toolbar:** `Home` (house icon, first), `RSS` (icon only, last). Remove Reply and Forward from the
  inbox: there's no single message to reply to or link.
- **Message (post) toolbar:** `← Inbox`, `Home`, `Copy link`, `Reply`, `RSS` (icon only).
  - **Copy link** replaces Forward: always copies the canonical post URL to the clipboard (no share sheet),
    shows a small XP tooltip "link copied" for ~2s, and a short inline error if the clipboard is
    unavailable. Label "Copy link" (mobile short label "Copy").
  - **Reply** stays on the post only: `mailto:` with subject `Re: <title>`. (It's the one real way to answer
    a post. Owner may drop it after testing; keep it trivially removable.)
  - Mobile: icon over short label (like the CV toolbar), fits 360px in one row without horizontal scroll.
- The bottom nav rows ("Inbox" · Home) can stay for desktop; on mobile remove the bottom Home on the inbox
  (it's now at the top) but keep the end-of-post "← Inbox · Home" row (handy after reading).

## 4. Status bar alignment (bug)
- The desktop status bar text ("4 messages, 4 unread") sits flush against the window's left border with no
  padding, and the bar spans oddly into the window frame. Give it the XP status-bar treatment (sunken
  pane, ~3px 8px padding, inside the window body like WordPad's).

## Acceptance
- [x] Desktop with ~30 fixture posts: list scrolls inside its pane, preview stays pinned and visible,
      keyboard selection scrolls into view; with 4 posts it still looks right
- [x] Mobile inbox: header strip with counts, folder tabs, three-line mail rows with envelope icons,
      one-line excerpts; clearly reads as a mail app at 375 and 360
- [x] Toolbars: inbox = Home + RSS icon; post = ← Inbox, Home, Copy link, Reply, RSS icon; copy shows
      "link copied"; fits 360px
- [x] Status bar padded and inside the window; lint/typecheck/test/build pass

## Decisions log

- The desktop list and preview have independent scroll regions; the preview stays 180px tall. Keyboard navigation moves focus and scrolls only the list. Chrome passed wheel and keyboard checks with 34 messages (30 temporary fixtures plus the four real posts). Fixtures were removed and production rebuilt.
- Mobile uses a horizontally scrollable tablist with roving focus and automatic activation, an Inbox count strip, and full-row links. Chrome passed at 375×812 and 360×740, including keyboard tab selection, envelope variants, ellipsis, and no horizontal overflow.
- Home and RSS are the only inbox tools. Posts retain Reply and gain top Inbox/Home and Copy link; clipboard success/failure were verified with a stub, and Web Share was not called. The desktop status bar is inset and padded.
- Lint (two existing Anita warnings), typecheck, all 42 tests and the production build passed.
- Verification fix (Claude, 2026-11-21): xp.css styles `[role=tabpanel]` with a fixed light gradient, so the mobile message list stayed white in dark mode with light text (unreadable). `blog.css` now resets `.xp-desktop .xp-mail-list[role="tabpanel"]` to `var(--mail-surface)` with no border/shadow/padding. Checked 375 and 1440, day and night.
