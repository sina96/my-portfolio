import { existsSync, readFileSync } from "node:fs";
import { afterEach, describe, expect, it, vi } from "vitest";
import { previousXpPath, recordXpPath } from "@/app/(main)/components/returnPath";
import { getBuildInfo, INFRA_SETTINGS, SECURITY_CHECKS } from "@/app/(main)/data/system";
import type { SecurityCheckId } from "@/app/(main)/data/system";

function capture(source: string, pattern: RegExp, key: string, file: string): string {
  const value = source.match(pattern)?.[1];
  if (value === undefined) throw new Error(`Cannot check data/system.ts ${key}: expected ${pattern} in ${file}`);
  return value;
}

function onOff(value: string): string {
  return value === "on" ? "On" : value === "off" ? "Off" : value;
}

function expectSetting(key: keyof typeof INFRA_SETTINGS, actual: string, file: string) {
  const { value } = INFRA_SETTINGS[key];
  expect(value, `data/system.ts ${key} is ${value} but ${file} has ${actual}; update ${key} in data/system.ts`).toBe(actual);
}

function expectCheck(id: SecurityCheckId, actual: boolean, file: string) {
  const done = SECURITY_CHECKS.find((check) => check.id === id)?.done;
  expect(done, `data/system.ts check “${id}” is ${done} but ${file} implies ${actual}; update SECURITY_CHECKS in data/system.ts`).toBe(actual);
}

describe("System Properties snapshot", () => {
  it("matches Cloudflare TLS and DNSSEC settings", () => {
    const file = "infra/security.tf";
    const infra = readFileSync(file, "utf8");
    const setting = (key: keyof typeof INFRA_SETTINGS, field: string) =>
      capture(infra, new RegExp(`^\\s*${field}\\s*=\\s*"([^"\\n]+)"`, "m"), key, file);
    expectSetting("minTls", setting("minTls", "min_tls_version"), file);
    const ssl = setting("sslMode", "ssl");
    expectSetting("sslMode", ssl === "strict" ? "Full (strict)" : ssl, file);
    expectSetting("alwaysHttps", onOff(setting("alwaysHttps", "always_use_https")), file);
    expectSetting("tls13", onOff(setting("tls13", "tls_1_3")), file);
    const dnssec = capture(infra, /resource\s+"cloudflare_zone_dnssec"\s+"[^"]+"\s*\{([^}]+)\}/, "dnssec", file);
    const status = capture(dnssec, /\bstatus\s*=\s*"([^"]+)"/, "dnssec", file);
    expectSetting("dnssec", status === "active" ? "On" : status === "disabled" ? "Off" : status, file);
  });

  it("matches the DMARC and SPF records", () => {
    const file = "infra/email.tf";
    const infra = readFileSync(file, "utf8");
    expectSetting("dmarcPolicy", capture(infra, /^\s*content\s*=.*v=DMARC1;[^\n]*?\bp=([a-z]+);/m, "dmarcPolicy", file), file);
    expectSetting("spfAll", capture(infra, /^\s*content\s*=.*v=spf1\b[^\n]*\s([+?~-]?all)\\?"/m, "spfAll", file), file);
  });

  it("matches the HSTS preload policy and security.txt presence", () => {
    const config = readFileSync("next.config.mjs", "utf8");
    const hsts = config.match(/key:\s*"Strict-Transport-Security",\s*value:\s*"([^"]+)"/)?.[1];
    expectCheck("hsts", hsts?.split(";").some((directive) => directive.trim() === "preload") ?? false, "next.config.mjs");
    const securityTxt = "public/.well-known/security.txt";
    expectCheck("securityTxt", existsSync(securityTxt), securityTxt);
  });
});

describe("getBuildInfo", () => {
  const now = new Date("2026-11-25T14:05:00Z");

  it("uses the deploy SHA, first message line, branch and UTC timestamp", () => {
    expect(getBuildInfo({
      VERCEL_GIT_COMMIT_SHA: "1234567890abcdef",
      VERCEL_GIT_COMMIT_MESSAGE: "Publish System Properties\r\n\r\nBody",
      VERCEL_GIT_COMMIT_REF: "main",
    }, now)).toEqual({
      sha: "1234567890abcdef",
      shortSha: "1234567",
      message: "Publish System Properties",
      branch: "main",
      builtAt: "2026-11-25T14:05:00.000Z",
      local: false,
    });
  });

  it("falls back to a local build without logging in tests", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    try {
      expect(getBuildInfo({}, now)).toEqual({
        sha: null, shortSha: null, message: null, branch: null, builtAt: now.toISOString(), local: true,
      });
      expect(warn).not.toHaveBeenCalled();
    } finally {
      warn.mockRestore();
    }
  });
});

describe("System Properties return path", () => {
  function fakeStorage(initial: Record<string, string> = {}) {
    const store = new Map(Object.entries(initial));
    vi.stubGlobal("window", {
      sessionStorage: {
        getItem: (key: string) => store.get(key) ?? null,
        setItem: (key: string, value: string) => void store.set(key, value),
      },
    });
  }
  afterEach(() => { vi.unstubAllGlobals(); });

  it("returns to the XP page visited before the dialog", () => {
    fakeStorage();
    recordXpPath("/blog/hello");
    recordXpPath("/system");
    expect(previousXpPath("/system")).toBe("/blog/hello");
  });

  it("keeps the previous page across a reload of the dialog", () => {
    fakeStorage();
    recordXpPath("/cv");
    recordXpPath("/system");
    recordXpPath("/system");
    expect(previousXpPath("/system")).toBe("/cv");
  });

  it("falls back to the desktop for a first visit, foreign values or blocked storage", () => {
    fakeStorage();
    recordXpPath("/system");
    expect(previousXpPath("/system")).toBe("/");
    fakeStorage({ "xp:path:previous": "//evil.example" });
    expect(previousXpPath("/system")).toBe("/");
    vi.stubGlobal("window", { get sessionStorage(): Storage { throw new Error("blocked"); } });
    expect(() => recordXpPath("/cv")).not.toThrow();
    expect(previousXpPath("/system")).toBe("/");
  });
});
