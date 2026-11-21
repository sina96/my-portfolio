# XP Hills redesign — working notes (archived)

Handoff tasks and spec revisions from the 2026-11-20 redesign, kept for history. The current design is
[`docs/specs/xp-hills/SPEC.md`](../../specs/xp-hills/SPEC.md). Each task ends with the implementer's
decisions log.

| File | Scope |
|---|---|
| `SPEC-revisions.md` | The spec as it evolved through revs 1–6 and later polish (superseded) |
| `TASK.md` | Rev 1: XP shell, hill scene, routes, theme store, proxy, tests, CI, docs |
| `TASK-2.md` | Rev 2: `hi.exe`, desktop icon, tray balloon, taskbar ↔ task pane, single post window, fonts |
| `TASK-3.md` | Rev 3: glass teaser, two-state glide, overlapping windows, landing-only navigation |
| `TASK-4.md` | Rev 4: About me at the top, pane groups, Luna switch, centred rows, availability toggle, mobile hint |
| `TASK-5.md` | Rev 5: status config, pixel desk, scenery easter egg, subtle RSS |
| `TASK-6-CV.md` | CV as a WordPad document |
| `TASK-7.md` | Scenery dialog position, button sizes, CSS preloads |
| `TASK-8.md` | Scenery on mobile (moon, portrait composition) and resize replay |
| `TASK-9.md` | Landing Home, quieter `hi.exe`, terminal desk, Contact layout |
| `TASK-10.md` | Hero note, CV toolbar, landing scroll behaviour, Contact copy |
| `TASK-11-security.md` | Security hardening: admin credentials, availability cache, CSP, sanitizer, audit |

## Landing v2 (2026-11-21)

Second round, after feedback that the site didn't look different enough on phones. Overview and decisions:
[`landing-v2/LANDING-V2.md`](./landing-v2/LANDING-V2.md).

| File | Scope |
|---|---|
| `landing-v2/TASK-12-wallpaper.md` | Full-screen fixed wallpaper, scroll transition, dim veil, mobile snap |
| `landing-v2/TASK-13-hero-layout.md` | `sina.exe` hero with desktop icons; Latest posts + About me layout, `SITE_NOW` |
| `landing-v2/TASK-14-taskbar-easter-egg.md` | Always-on landing taskbar, bottom scroll hint, smoother wheel glide |
| `landing-v2/TASK-14b-windows.md` | Real minimize vs close, restore popup, sticky mobile title bars |
| `landing-v2/TASK-15-mobile-art.md` | Portrait hills, stars, pixel size, moon/clouds |
| `landing-v2/TASK-16-subpages.md` | Contact card table, social icons, icon nav buttons |
| `landing-v2/TASK-16a-taskbar-everywhere.md` | Taskbar on every page, auto-hiding while reading |
| `landing-v2/TASK-16b-contact-board.md` | Contact on the felt: slots, pixel Sina, no status |
| `landing-v2/TASK-17-day-night.md` | Stepped day/night transition; contact cards in slots |
| `landing-v2/TASK-17b-blog-inbox.md` | Blog as `inbox.exe`, message windows, mobile text sizes |
| `landing-v2/TASK-17c-inbox-polish.md` | Inbox scrolling, mobile mail UI, Home on top, Copy link |
| `landing-v2/TASK-18-polish.md` | Night sky density, sub-page wallpaper, inbox height, contact icon row |
| `landing-v2/TASK-18b-sun.md` | Sun at rest in the day sky, continuous sunset/sunrise |
