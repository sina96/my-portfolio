# Task 9: Home goes to content, quieter hi.exe, terminal desk, contact layout (post-review of Task 8)

**Branch:** `redesign-xp-hills`, on top of the uncommitted Task 1–8 work. Leave changes uncommitted.
**Read first:** `SPEC.md` (§4, §9, §10), Decisions logs of `TASK-5.md`, `TASK-7.md`, `TASK-8.md`.
Task 8 was verified on 2026-11-20. After the task: `bun run lint && bun run typecheck && bun run test && bun run build`.
Update SPEC/AGENTS where behaviour changes.

## 1. "Home" on the landing page goes to the content (owner request)
Owner: "In the taskbar, clicking Home should scroll down to the main stuff on the landing page. This should
also work in the easter egg and should restore the windows as well."
Today `XP_PLACES` "Home" (`components/navPlaces.ts`) is a plain `<Link href="/">` in the Start menu
(`Taskbar.tsx:80`) and the task pane (`TaskPane.tsx:54`); on `/` it does nothing.
- On `/` only, activating Home (Start menu, task pane, mobile drawer) should:
  1. close the Start menu / drawer;
  2. if scenery mode is on, or the "wanna enjoy the scenery instead?" dialog is showing (all content
     windows closed), **restore all content windows** first (same code path as "restore windows");
  3. take the visitor to the content: desktop glide → the same glide as the ▼ SCROLL hint
     (`glideToContent` / `useLandingGlide`); mobile and reduced motion → scroll to `#main`
     (smooth unless reduced motion);
  4. move focus to `#main` (`preventScroll`), as the glide already does.
- Already at the content: scroll to the top of the content (About me aligned), no reload.
- Other routes: Home stays a normal link to `/` (unchanged). Keep `aria-current` behaviour.
- Expose one function from the window manager / landing (e.g. a small context or event) rather than
  duplicating restore + glide logic in Taskbar and TaskPane.
- No hydration warnings; keyboard (Enter) works the same as click; `hi.exe` state is untouched.

## 2. Quieter hi.exe (owner request)
Owner: "make the hi and emoji text smaller and the text under it lower opacity."
- `hero.css`: `.xp-hero-greeting` ("hi! 👋") 28px → ~20–22px (emoji follows the text size).
- `.xp-hero-note` "(you can close me, the view is nicer)": opacity ~.65–.7 (keep AA-large contrast over
  the glass in both themes; if needed reduce via color mix instead of opacity), size ~12px.
- The memoji image stays as is unless it now looks oversized next to the smaller text (then ~60px);
  record the choice. Check desktop and 375px, day and night.

## 3. Pixel desk monitor shows a terminal / code screen (owner request)
Owner: "I like the computer but maybe it should show a terminal style rather than green dots, or a code style…
It says hi but in dark mode it is weird."
Cause of "green dots": `utils/pixelDesk.ts:24` dithers the screen with colour 7 (`#9bf5ce`) at ratio .07
in night mode, which scatters bright green pixels over the screen; the "hi" glyph is the same colour, so
it gets lost.
- Replace the screen contents (19×10 cells at x 21, y 8) with a **tiny terminal/code editor**:
  - Solid dark screen in both themes (no dithering noise on the screen), e.g. `#0f1a24`–`#132030`,
    slight glow in night mode only around the bezel, not as noise.
  - Line 1: a prompt `>` (or `$`) in green + a short bar; then 3–4 "code" lines drawn as 1-cell-tall bars
    of varying lengths and small indents, in 2–3 syntax colours (e.g. green, amber, light blue/pink)
    so it reads as code at a glance; last line ends with the existing blinking cursor (`steps()`).
  - Optional: a 1-cell title strip at the top of the screen (editor tab feel).
  - Don't keep the "hi" glyph (it's illegible at this size).
- Use an original design (no recreation of a specific existing character/scene such as "lofi girl").
- Keep: deterministic, `aria-hidden`, crisp, no layout shift, reduced motion = no animation.
  Update the determinism test if output changes.

## 4. Contact window layout like About me on desktop (owner request)
Owner: "I want the contact window to act like the About me window: on full desktop the art goes to the right
and text and buttons to the left. On mobile centred as it is."
- `/contact` main window (`contact/page.tsx` → `ContactWindows`): at ≥760px a two-column row:
  **left** = h1 "Let's link up!", the line under it, "Contact me" button, socials, the movies/music line,
  all **left-aligned**; **right** = the pixel desk (~260–300px), vertically centred.
  Match About me's spacing/gap feel (`.xp-intro` in `site.css:93`).
- The in-window nav buttons (Home / Blog) and the availability disclosure stay full width below the row,
  centred as today.
- <760px: unchanged (desk on top, everything centred).
- Keep a single `<h1>`, the DOM order sensible for screen readers (text before the decorative art is fine),
  and no horizontal scroll at 760–900px.

## Acceptance
- [x] `/` Home (Start menu + pane + mobile drawer) glides/scrolls to the content and focuses `#main`; from
      scenery mode and from the "enjoy the scenery" dialog it restores all content windows first; works
      with keyboard; Home on other pages still navigates to `/`
- [x] hi.exe greeting smaller, note quieter, readable in day and night, desktop and mobile
- [x] Pixel desk screen reads as a terminal/code editor in both themes; no green noise; cursor blinks
      (not under reduced motion); deterministic test updated and passing
- [x] `/contact` ≥760px: text and buttons left, desk right, like About me; <760px unchanged; no overflow
- [x] lint, typecheck, test, build pass; no console warnings; `/anita` unchanged

## Decisions log
- Landing Home and the scroll hint share the window-manager request and restore operation; hi.exe is untouched.
- Kept the 72px memoji. The reduced-opacity 12px note uses a translucent backing for legibility.
- Terminal pixels are independent of the desk's dither seed. The decorative illustration follows the copy in DOM order and moves above it on mobile.
- Verified with mouse and Enter, both themes, reduced motion, and 375, 760, 900 and 1440px Contact widths. All 18 tests passed; Anita screenshot baselines matched.
