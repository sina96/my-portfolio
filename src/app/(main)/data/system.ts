import type { SystemGlyphName } from "../system/SystemGlyph";

export interface BuildInfo {
  sha: string | null;
  shortSha: string | null;
  message: string | null;
  branch: string | null;
  builtAt: string;
  local: boolean;
}

export interface SecurityScan {
  scanner: string;
  /** Tile label; `scanner` is the full name for links and screen readers. */
  short: string;
  result: string;
  scannedOn: string;
  url: string;
}

export type SecurityCheckId =
  | "hsts" | "tls" | "origin" | "dnssec" | "caa" | "mailAuth" | "dmarcReject" | "mtaSts" | "securityTxt" | "access";

export interface SecurityCheck {
  id: SecurityCheckId;
  label: string;
  done: boolean;
}

export interface IconItem {
  icon: SystemGlyphName;
  label: string;
}

interface InfraSetting {
  label: string;
  value: string;
}

type InfraSettingKey = "minTls" | "sslMode" | "alwaysHttps" | "tls13" | "dnssec" | "dmarcPolicy" | "spfAll";

const REPOSITORY = "https://github.com/sina96/my-portfolio";

export const SYSTEM = {
  name: "sinabastani.dev",
  owner: "Sina Bastani",
  location: "Stockholm",
  stack: [
    { icon: "globe", label: "Next.js 16 on Vercel" },
    { icon: "cloud", label: "Cloudflare DNS + DNSSEC" },
    { icon: "inbox", label: "Email routing" },
    { icon: "shield", label: "Zero Trust for the CMS" },
    { icon: "blog", label: "Sveltia CMS" },
    { icon: "gear", label: "OpenTofu + GitHub Actions" },
  ] satisfies readonly IconItem[],
  links: {
    infrastructure: `${REPOSITORY}/tree/main/infra`,
    guide: `${REPOSITORY}/blob/main/docs/howto/INFRA.md`,
    workflow: `${REPOSITORY}/blob/main/.github/workflows/infra.yml`,
    commits: `${REPOSITORY}/commit/`,
  },
} as const;

export type Provider = "you" | "cloudflare" | "vercel" | "github" | "app";

export interface FlowStep {
  icon: SystemGlyphName;
  label: string;
  /** Who runs this step; also picks the tile colour. */
  provider: Provider;
  by: string;
}

export const NETWORK: Readonly<Record<"visitor" | "admin", { label: string; steps: readonly FlowStep[] }>> = {
  visitor: {
    label: "Visitor",
    steps: [
      { icon: "desktop", label: "Browser", provider: "you", by: "Anyone" },
      { icon: "cloud", label: "DNS", provider: "cloudflare", by: "Cloudflare" },
      { icon: "globe", label: "Edge", provider: "vercel", by: "Vercel" },
      { icon: "home", label: "Site", provider: "app", by: "Next.js" },
    ],
  },
  admin: {
    label: "Admin",
    steps: [
      { icon: "desktop", label: "Browser", provider: "you", by: "Me" },
      { icon: "shield", label: "Access", provider: "cloudflare", by: "Cloudflare" },
      { icon: "key", label: "JWT check", provider: "app", by: "Next.js" },
      { icon: "blog", label: "CMS", provider: "app", by: "Sveltia" },
      { icon: "github", label: "Commit", provider: "github", by: "GitHub" },
      { icon: "globe", label: "Deploy", provider: "vercel", by: "Vercel" },
    ],
  },
};

export const SECURITY_SCANS: readonly SecurityScan[] = [
  { scanner: "SSL Labs", short: "SSL Labs", result: "A+", scannedOn: "2026-11-25", url: "https://www.ssllabs.com/ssltest/analyze.html?d=sinabastani.dev" },
  { scanner: "Mozilla Observatory", short: "Observatory", result: "B+", scannedOn: "2026-11-25", url: "https://developer.mozilla.org/en-US/observatory/analyze?host=sinabastani.dev" },
  { scanner: "internet.nl (website)", short: "internet.nl web", result: "86%", scannedOn: "2026-11-25", url: "https://internet.nl/site/sinabastani.dev/" },
  { scanner: "internet.nl (email)", short: "internet.nl mail", result: "93%", scannedOn: "2026-11-25", url: "https://internet.nl/mail/sinabastani.dev/" },
];

export const INFRA_SETTINGS: Readonly<Record<InfraSettingKey, InfraSetting>> = {
  minTls: { label: "Minimum TLS version", value: "1.2" },
  sslMode: { label: "Cloudflare → origin encryption", value: "Full (strict)" },
  alwaysHttps: { label: "Always use HTTPS (proxied hosts)", value: "On" },
  tls13: { label: "TLS 1.3", value: "On" },
  dnssec: { label: "DNSSEC", value: "On" },
  dmarcPolicy: { label: "DMARC policy", value: "none" },
  spfAll: { label: "SPF default", value: "~all" },
};

const setting = (key: InfraSettingKey) => INFRA_SETTINGS[key].value;

/** Short checklist rows; values come from INFRA_SETTINGS so the sync test covers them. */
export const SECURITY_CHECKS: readonly SecurityCheck[] = [
  { id: "hsts", label: "HSTS preload", done: true },
  { id: "tls", label: `TLS ${setting("minTls")}+ only`, done: Number(setting("minTls")) >= 1.2 },
  { id: "origin", label: `${setting("sslMode")} to origin`, done: setting("sslMode") === "Full (strict)" },
  { id: "dnssec", label: "DNSSEC", done: setting("dnssec") === "On" },
  { id: "caa", label: "CAA records", done: true },
  { id: "mailAuth", label: `SPF ${setting("spfAll")}, DKIM, DMARC`, done: true },
  { id: "dmarcReject", label: "DMARC reject", done: setting("dmarcPolicy") === "reject" },
  { id: "mtaSts", label: "MTA-STS", done: false },
  { id: "securityTxt", label: "security.txt", done: true },
  { id: "access", label: "CMS behind Zero Trust", done: true },
];

export const AUTOMATION: readonly IconItem[] = [
  { icon: "globe", label: "Push to main → deploy" },
  { icon: "box", label: "Renovate PRs on Mondays" },
  { icon: "gear", label: "Infra: plan on PR, apply on approval" },
  { icon: "clock", label: "Weekly drift check" },
];

let warnedAboutLocalBuild = false;

/** Read the Vercel deployment snapshot at prerender time, or describe a local build. */
export function getBuildInfo(env: Partial<NodeJS.ProcessEnv> = process.env, now: Date = new Date()): BuildInfo {
  const sha = env.VERCEL_GIT_COMMIT_SHA?.trim() || null;
  const builtAt = now.toISOString();
  if (!sha) {
    if (process.env.NODE_ENV !== "test" && !warnedAboutLocalBuild) {
      console.warn("[System] VERCEL_GIT_COMMIT_SHA missing; showing local build.");
      warnedAboutLocalBuild = true;
    }
    return { sha: null, shortSha: null, message: null, branch: null, builtAt, local: true };
  }
  return {
    sha,
    shortSha: sha.slice(0, 7),
    message: env.VERCEL_GIT_COMMIT_MESSAGE?.split(/\r\n?|\n/, 1)[0].trim() || null,
    branch: env.VERCEL_GIT_COMMIT_REF?.trim() || null,
    builtAt,
    local: false,
  };
}
