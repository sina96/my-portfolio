const CURRENT = "xp:path:current";
const PREVIOUS = "xp:path:previous";

/** Remember the XP page being shown so dialogs can return to the one before it. */
export function recordXpPath(pathname: string): void {
  try {
    const current = window.sessionStorage.getItem(CURRENT);
    if (current && current !== pathname) window.sessionStorage.setItem(PREVIOUS, current);
    window.sessionStorage.setItem(CURRENT, pathname);
  } catch {
    // Storage can be unavailable (private mode, blocked); dialogs then return to the desktop.
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
