import { NextRequest } from "next/server";
import { afterEach, beforeAll, expect, test, vi } from "vitest";
import { adminAccessFailure } from "@/lib/adminAccess";
import { verifyAccessJwt } from "@/lib/cfAccess";
import type { AccessJwk } from "@/lib/cfAccess";

const TEAM = "test-team.cloudflareaccess.com";
const AUD = "test-audience-tag";
const ADMIN_HOST = "admin.example.com";
const NOW = 1_800_000_000;

let signingKey: CryptoKey;
let otherKey: CryptoKey;
let publicJwk: AccessJwk;

const rsa = { name: "RSASSA-PKCS1-v1_5", modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: "SHA-256" };

beforeAll(async () => {
  const pair = await crypto.subtle.generateKey(rsa, true, ["sign", "verify"]);
  const other = await crypto.subtle.generateKey(rsa, true, ["sign", "verify"]);
  signingKey = pair.privateKey;
  otherKey = other.privateKey;
  publicJwk = { ...(await crypto.subtle.exportKey("jwk", pair.publicKey)), kid: "key-1" };
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

function base64Url(bytes: Uint8Array | string): string {
  const raw = typeof bytes === "string" ? bytes : String.fromCharCode(...bytes);
  return btoa(raw).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function sign(
  payload: Record<string, unknown>,
  { kid = "key-1", alg = "RS256", key = signingKey }: { kid?: string; alg?: string; key?: CryptoKey } = {},
): Promise<string> {
  const head = base64Url(JSON.stringify({ alg, kid, typ: "JWT" }));
  const body = base64Url(JSON.stringify(payload));
  const signature = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(`${head}.${body}`));
  return `${head}.${body}.${base64Url(new Uint8Array(signature))}`;
}

const goodClaims = { iss: `https://${TEAM}`, aud: [AUD], exp: NOW + 600, nbf: NOW - 10, email: "me@example.com" };
const loadKeys = vi.fn(async () => [publicJwk]);
const verify = (token: string, now = NOW) => verifyAccessJwt(token, { teamDomain: TEAM, audience: AUD, now, loadKeys });

test("accepts a valid Access token", async () => {
  expect(await verify(await sign(goodClaims))).toEqual({ valid: true, email: "me@example.com" });
});

test.each([
  ["wrong audience", { ...goodClaims, aud: ["someone-else"] }],
  ["wrong issuer", { ...goodClaims, iss: "https://evil.cloudflareaccess.com" }],
  ["expired", { ...goodClaims, exp: NOW - 3600 }],
  ["not yet valid", { ...goodClaims, nbf: NOW + 3600 }],
])("rejects a token with %s", async (reason, claims) => {
  expect(await verify(await sign(claims))).toEqual({ valid: false, reason });
});

test("rejects a token signed by another key", async () => {
  expect(await verify(await sign(goodClaims, { key: otherKey }))).toEqual({ valid: false, reason: "bad signature" });
});

test("rejects an unknown key id after one forced refresh", async () => {
  loadKeys.mockClear();
  expect(await verify(await sign(goodClaims, { kid: "key-2" }))).toEqual({ valid: false, reason: "unknown key id" });
  expect(loadKeys).toHaveBeenLastCalledWith(TEAM, true);
});

test.each([
  ["unexpected algorithm", () => sign(goodClaims, { alg: "none" })],
  ["malformed token", async () => "not-a-jwt"],
])("rejects %s", async (reason, makeToken) => {
  expect(await verify(await makeToken())).toEqual({ valid: false, reason });
});

function adminRequest(host: string, headers: Record<string, string> = {}, path = "/admin/config.yml?x=1"): NextRequest {
  return new NextRequest(`https://${host}${path}`, { headers: { host, ...headers } });
}

function stubAccessEnv({ team = TEAM, aud = AUD }: { team?: string; aud?: string } = {}): void {
  vi.stubEnv("ADMIN_HOST", ADMIN_HOST);
  vi.stubEnv("CF_ACCESS_TEAM_DOMAIN", team);
  vi.stubEnv("CF_ACCESS_AUD", aud);
}

test("Access mode lets a valid token through without Basic Auth", async () => {
  stubAccessEnv();
  vi.spyOn(Date, "now").mockReturnValue(NOW * 1000);
  const token = await sign(goodClaims);
  expect(await adminAccessFailure(adminRequest(ADMIN_HOST, { "cf-access-jwt-assertion": token }), loadKeys)).toBeNull();
});

test("Access mode redirects other hosts to the admin host", async () => {
  stubAccessEnv();
  const response = await adminAccessFailure(adminRequest("example.com"), loadKeys);
  expect(response?.status).toBe(308);
  expect(response?.headers.get("location")).toBe(`https://${ADMIN_HOST}/admin/config.yml?x=1`);
});

test("Access mode never falls back to Basic Auth", async () => {
  stubAccessEnv();
  vi.stubEnv("ADMIN_USERNAME", "test-admin");
  vi.stubEnv("ADMIN_PASSWORD", "test-only-long-password");
  const basic = `Basic ${btoa("test-admin:test-only-long-password")}`;
  const response = await adminAccessFailure(adminRequest(ADMIN_HOST, { authorization: basic }), loadKeys);
  expect(response?.status).toBe(403);
});

test("Access mode rejects an invalid token", async () => {
  stubAccessEnv();
  const token = await sign({ ...goodClaims, aud: ["someone-else"] });
  vi.spyOn(console, "warn").mockImplementation(() => {});
  const response = await adminAccessFailure(adminRequest(ADMIN_HOST, { "cf-access-jwt-assertion": token }), loadKeys);
  expect(response?.status).toBe(403);
  expect(response?.headers.get("Cache-Control")).toBe("no-store");
});

test("Access mode fails closed when team or audience is missing", async () => {
  stubAccessEnv({ aud: "" });
  vi.spyOn(console, "warn").mockImplementation(() => {});
  const token = await sign(goodClaims);
  const response = await adminAccessFailure(adminRequest(ADMIN_HOST, { "cf-access-jwt-assertion": token }), loadKeys);
  expect(response?.status).toBe(503);
});

test("without ADMIN_HOST, Basic Auth applies as before", async () => {
  vi.stubEnv("ADMIN_HOST", "");
  vi.stubEnv("ADMIN_USERNAME", "test-admin");
  vi.stubEnv("ADMIN_PASSWORD", "test-only-long-password");
  const basic = `Basic ${btoa("test-admin:test-only-long-password")}`;
  expect(await adminAccessFailure(adminRequest("localhost:3000", { authorization: basic }), loadKeys)).toBeNull();
  expect((await adminAccessFailure(adminRequest("localhost:3000"), loadKeys))?.status).toBe(401);
});
