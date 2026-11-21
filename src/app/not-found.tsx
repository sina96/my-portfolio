import { SITE_NAME } from "@/lib/site";
import XpShell from "./(main)/XpShell";
import { HillScene } from "./(main)/components/HillScene";
import { XpNavLink } from "./(main)/components/XpNavLink";
import { XpWindow } from "./(main)/components/XpWindow";

export default function NotFound() {
  return (
    <XpShell>
      <title>{`Page not found | ${SITE_NAME}`}</title>
      <HillScene mode="header" />
      <main className="xp-content xp-error-content" id="main" tabIndex={-1}>
        <XpWindow id="error-404" icon="desktop" title={`${SITE_NAME} — Error 404`}>
          <div className="xp-error-body">
            <span aria-hidden="true" className="xp-error-icon">×</span>
            <div>
              <h1>This page cannot be displayed</h1>
              <p>The page you requested could not be found.</p>
            </div>
          </div>
          <div className="xp-actions"><XpNavLink href="/" label="Home" icon="home" /></div>
        </XpWindow>
      </main>
    </XpShell>
  );
}
