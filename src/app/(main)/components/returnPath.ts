const CURRENT = "xp:path:current";
const PREVIOUS = "xp:path:previous";

/**
 * What this document last recorded. A back/forward-cache restore brings the JS heap back with the
 * page, so this is the return path the restored page had when it was shown.
 */
let shown: { current: string; previous: string | null } | null = null;

/** Remember the XP page being shown so dialogs can return to the one before it. */
export function recordXpPath(pathname: string): void {
  try {
    const current = window.sessionStorage.getItem(CURRENT);
    if (current && current !== pathname) window.sessionStorage.setItem(PREVIOUS, current);
    window.sessionStorage.setItem(CURRENT, pathname);
    shown = { current: pathname, previous: window.sessionStorage.getItem(PREVIOUS) };
  } catch {
    // Storage can be unavailable (private mode, blocked); dialogs then return to the desktop.
  }
}

/**
 * After a back/forward-cache restore (effects don't re-run), put back the restored page's own
 * return path instead of the one written by the newer page the user came back from.
 */
export function restoreXpPath(): void {
  if (!shown) return;
  try {
    window.sessionStorage.setItem(CURRENT, shown.current);
    if (shown.previous) window.sessionStorage.setItem(PREVIOUS, shown.previous);
    else window.sessionStorage.removeItem(PREVIOUS);
  } catch {
    // Fall back to whatever storage holds.
  }
}

/** The XP page visited before `pathname` in this tab, or the desktop when unknown. */
export function previousXpPath(pathname: string): string {
  try {
    const previous = window.sessionStorage.getItem(PREVIOUS);
    // Same-origin paths only ("/x", never "//host"), and never the dialog's own page.
    if (previous && /^\/(?!\/)/.test(previous) && previous !== pathname) return previous;
  } catch {
    // Fall through to the desktop.
  }
  return "/";
}
