import type { Metadata } from "next";
import { SHARE_IMAGE_SIZE } from "@/lib/shareImage";
import { SITE_NAME, SITE_TAGLINE, siteAlternates } from "@/lib/site";
import { HillScene } from "../components/HillScene";
import { AUTOMATION, getBuildInfo, SECURITY_CHECKS, SECURITY_SCANS, SYSTEM } from "../data/system";
import type { BuildInfo, IconItem } from "../data/system";
import { NetworkDiagram } from "./NetworkDiagram";
import { SystemDialog } from "./SystemDialog";
import { SystemGlyph } from "./SystemGlyph";
import type { SystemGlyphName } from "./SystemGlyph";
import { SystemMark } from "./SystemMark";
import { SystemTabs } from "./SystemTabs";

const title = "System Properties";
const description = "How sinabastani.dev is built and run: Cloudflare, Zero Trust, OpenTofu and automated deploys.";

export const metadata: Metadata = {
  title,
  description,
  alternates: siteAlternates("/system"),
  openGraph: {
    type: "website",
    title,
    description,
    url: "/system",
    siteName: SITE_NAME,
    images: [{ url: "/opengraph-image", ...SHARE_IMAGE_SIZE, type: "image/png", alt: `${SITE_NAME} — ${SITE_TAGLINE}` }],
  },
};

function ExternalButton({ href, icon, label }: Readonly<{ href: string; icon: SystemGlyphName; label: string }>) {
  return (
    <a href={href} className="xp-button-link xp-nav-link" target="_blank" rel="noopener noreferrer">
      <SystemGlyph icon={icon} />{label}
    </a>
  );
}

function IconList({ items, className }: Readonly<{ items: readonly IconItem[]; className: string }>) {
  return (
    <ul className={`system-icon-list ${className}`}>
      {items.map(({ icon, label }) => <li key={label}><SystemGlyph icon={icon} size={24} /><span>{label}</span></li>)}
    </ul>
  );
}

function GeneralPanel({ shortSha }: Readonly<{ shortSha: BuildInfo["shortSha"] }>) {
  return (
    <>
      <div className="system-general">
        <SystemMark />
        <p>
          <strong className="system-name">{SYSTEM.name}</strong><br />
          {shortSha ? <>Version <code>{shortSha}</code></> : "Local build"}<br />
          <span className="system-muted">{SYSTEM.owner} · {SYSTEM.location}</span>
        </p>
      </div>
      <h2 className="xp-sr-only">Stack</h2>
      <IconList items={SYSTEM.stack} className="system-stack" />
      <div className="system-buttons">
        <ExternalButton href={SYSTEM.links.infrastructure} icon="github" label="View the code" />
        <ExternalButton href={SYSTEM.links.guide} icon="blog" label="How it works" />
      </div>
    </>
  );
}

function NetworkPanel() {
  return <NetworkDiagram />;
}

function SecurityPanel({ scanned }: Readonly<{ scanned: string }>) {
  return (
    <>
      <h2 className="xp-sr-only">Scan results</h2>
      <ul className="system-grades">
        {SECURITY_SCANS.map(({ scanner, short, result, url }) => (
          <li key={scanner}>
            <a href={url} target="_blank" rel="noopener noreferrer" title={`Re-run ${scanner}`}
              aria-label={`${scanner}: ${result}. Re-run the scan`}>
              <strong>{result}</strong><span>{short}</span>
            </a>
          </li>
        ))}
      </ul>
      <p className="system-note">Scanned {scanned}. Select a grade to re-run it.</p>
      <h2 className="xp-sr-only">Checklist</h2>
      <ul className="system-checklist">
        {SECURITY_CHECKS.map(({ id, label, done }) => (
          <li key={id} className={done ? undefined : "system-pending"}>
            <span className="system-check" aria-hidden="true">{done ? "✓" : ""}</span>
            {label}<span className="xp-sr-only">: {done ? "done" : "not yet"}</span>
          </li>
        ))}
      </ul>
    </>
  );
}

function UpdatesPanel({ build, date, time }: Readonly<{ build: BuildInfo; date: string; time: string }>) {
  return (
    <>
      <h2 className="xp-sr-only">Last deploy</h2>
      <div className="system-deploy">
        <SystemGlyph icon="system" size={32} />
        <p>
          {build.sha ? (
            <a href={`${SYSTEM.links.commits}${encodeURIComponent(build.sha)}`} target="_blank" rel="noopener noreferrer"><code>{build.shortSha}</code></a>
          ) : <code>local build</code>}
          {build.message && <span className="system-commit-message" title={build.message}> {build.message}</span>}
          <br />
          <span className="system-muted">
            {build.branch && <>{build.branch} · </>}<time dateTime={build.builtAt}>{date}, {time} UTC</time>
          </span>
        </p>
      </div>
      <h2 className="xp-sr-only">Automation</h2>
      <IconList items={AUTOMATION} className="system-automation" />
      <div className="system-buttons">
        <ExternalButton href={SYSTEM.links.workflow} icon="github" label="Workflows" />
      </div>
    </>
  );
}

/** Render the public infrastructure snapshot at build time. */
export default function SystemPage() {
  const build = getBuildInfo();
  const instant = new Date(build.builtAt);
  const formatDate = (value: Date) => new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeZone: "UTC" }).format(value);
  const date = formatDate(instant);
  const time = build.builtAt.slice(11, 16);
  const scanned = formatDate(new Date(`${SECURITY_SCANS[0].scannedOn}T00:00:00Z`));
  return (
    <>
      <HillScene mode="header" />
      <main id="main" className="xp-content system-page" tabIndex={-1}>
        <SystemDialog title={title}>
          <h1 className="xp-sr-only">{title}</h1>
          <SystemTabs tabs={[
            { id: "general", label: "General", content: <GeneralPanel shortSha={build.shortSha} /> },
            { id: "network", label: "Network", content: <NetworkPanel /> },
            { id: "security", label: "Security", content: <SecurityPanel scanned={scanned} /> },
            { id: "updates", label: "Automatic Updates", shortLabel: "Updates", content: <UpdatesPanel build={build} date={date} time={time} /> },
          ]} />
          <p className="system-note system-snapshot">System setup as of deploy {build.shortSha ? <code>{build.shortSha}</code> : "local build"} · <time dateTime={build.builtAt}>{date}</time></p>
        </SystemDialog>
      </main>
    </>
  );
}
