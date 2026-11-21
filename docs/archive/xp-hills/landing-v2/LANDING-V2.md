# Landing v2 — "it should feel like a desktop, on a phone too" (archived)

> Shipped and archived on 2026-11-21. The current design is
> [`docs/specs/xp-hills/SPEC.md`](../../../specs/xp-hills/SPEC.md). Decisions below were revised during the
> round (e.g. the taskbar moved to every page in Task 16a); the task files' Decisions logs record what shipped.

Planned on 2026-11-21 in a grilling session with the owner. Builds on the shipped XP Hills design
([`SPEC.md`](../../../specs/xp-hills/SPEC.md)). Each task updates `SPEC.md` / `AGENTS.md` for the behaviour it changes; when
all tasks are verified this file and the tasks move to `docs/archive/xp-hills/`.

## Why

Feedback: "I don't see a difference from the old site." On mobile (where most visitors arrive, mainly
from LinkedIn) the hill was a 42vh strip, `hi.exe` had no actions, the taskbar turned into a "Places"
button, and below the hill the page was flat light blue: a stack of cards with blue title bars. The
difference has to come from a **full-screen scene, a felt scroll transition and a persistent desktop**,
not from card styling.

## Decisions

1. **Hero = `sina.exe`**: see-through XP window over the hills with name, role line
   "Developer (human) · Stockholm" and three **desktop icons**: CV, Contact, Blog (equal weight). No social
   icon row (LinkedIn visitors just came from LinkedIn). No status dot in the hero. Close button works.
2. **Below the hills**: Latest posts is the main, wide, centred window (5 posts). About me moves to a
   narrow side window (desktop) / below posts (mobile) with bio, status and a "now" list the owner fills
   in `site.ts`. "View CV" leaves About me (the hero has CV).
3. **Wallpaper**: the hills fill the first screen on mobile and desktop and stay fixed behind every
   landing window as the desktop wallpaper. No flat page background on `/`.
4. **Transition**: tied to native scroll on mobile (stepped parallax, hero lifts and fades, a dim veil
   settles); desktop keeps its glide. Light snap so it never rests mid-transition (mobile). Scene layers
   get a little life during the transition (moon/stars/clouds drift at different depths).
5. **Not annoying**: motion only during the transition; at rest in the content view the scene pauses;
   flat ~60% dim (no blur); opaque window bodies below the hills; transition finishes within ~half a
   screen; snap only at the hill/content boundary; cheap (transform/opacity, one fixed layer); reduced
   motion = static wallpaper.
6. **Taskbar on every XP page**: always visible on the landing; auto-hides while reading on
   sub-pages, with keyboard access and the tray theme toggle everywhere. The Places pane stays
   landing-only, and the in-window sub-page navigation stays.
   **Taskbar on `/` only, always visible** (mobile and desktop). The mobile "Places" launcher, drawer and
   "your menu lives here" balloon go. Sub-pages stay focused (no taskbar).
7. **Minimize and close are distinct**: on `/`, minimize sends the window to its task button;
   close removes its button. Closing both content windows opens the shared “Desktop” popup; the
   hero doesn't count. “Show me the hills” enters undimmed scenery with the tray, theme toggle,
   and corner restore control. Mobile title bars stick within their windows, and minimize goes
   to the taskbar on sub-pages too.
8. **Mobile art**: portrait composition (hills in the bottom ~45%, 3–4 ridges), evenly spaced stars in 2–3
   sizes, chunkier pixels on small screens, moon and clouds inside safe margins. Determinism tests
   change on purpose.
9. **Later in the same PR**: social icons on Contact and more playful sub-page buttons; a CV review
   (Claude brings findings first, then a task); a stepped day/night transition on theme switch.

## Tasks (one PR, verified chunk by chunk, in order)

| Task | Scope |
|---|---|
| [TASK-12](./TASK-12-wallpaper.md) | Full-screen wallpaper, scroll transition, dim, snap, pause |
| [TASK-13](./TASK-13-hero-layout.md) | `sina.exe` hero with desktop icons, layout below the hills, "now" |
| [TASK-14](./TASK-14-taskbar-easter-egg.md) | Always-on landing taskbar, one easter-egg rule |
| [TASK-14b](./TASK-14b-windows.md) | Real minimize vs close, restore popup, sticky mobile title bars |
| [TASK-14b](./TASK-14b-windows.md) | Separate minimize and close, shared popup, sticky mobile title bars |
| [TASK-15](./TASK-15-mobile-art.md) | Portrait hills, stars, pixel size, moon/clouds, tests |
| [TASK-16a](./TASK-16a-taskbar-everywhere.md) | Taskbar on every page (auto-hides while reading), one minimize rule |
| [TASK-16](./TASK-16-subpages.md) | Card-table board on Contact, contact icons, playful sub-page buttons |
| [TASK-16b](./TASK-16b-contact-board.md) | Contact on the felt: empty top-row slots, clickable mini Sina, no status |
| [TASK-17](./TASK-17-day-night.md) | Stepped day/night transition on theme switch |
| [TASK-17b](./TASK-17b-blog-inbox.md) | Blog as a mail program (`inbox.exe`), year folders, unread dots, icon-only RSS |
| [TASK-17c](./TASK-17c-inbox-polish.md) | Inbox: scrolling list + pinned preview, mobile mail UI, Home on top, Copy link |
| [TASK-18](./TASK-18-polish.md) | Final polish (collected items, e.g. memoji LCP warning) |
| [TASK-18b](./TASK-18b-sun.md) | Sun in the day sky at rest; sets/rises continuously in the transition |

Open: owner to confirm the role line wording and fill the "now" placeholders before merge.
