/** A public signing key as published at `https://<team>/cdn-cgi/access/certs`. */
export interface AccessJwk extends JsonWebKey {
  kid: string;
}

export interface AccessVerifyOptions {
  /** Team domain without scheme, e.g. `sinabastani.cloudflareaccess.com`. */
  teamDomain: string;
  /** Application Audience (AUD) tag of the protected Access application. */
  audience: string;
  /** Current time in seconds; injectable for tests. */
  now?: number;
  /** Loads the team's signing keys; injectable for tests. `force` bypasses any cache. */
  loadKeys?: (teamDomain: string, force: boolean) => Promise<AccessJwk[]>;
}

export type AccessVerifyResult = { valid: true; email: string } | { valid: false; reason: string };

interface JwtHeader {
  alg?: unknown;
  kid?: unknown;
}

interface JwtPayload {
  aud?: unknown;
  iss?: unknown;
  exp?: unknown;
  nbf?: unknown;
  email?: unknown;
}

const CLOCK_SKEW_SECONDS = 60;
const KEY_CACHE_MS = 60 * 60 * 1000;
const FORCED_REFRESH_MIN_MS = 60 * 1000;

const keyCache = new Map<string, { keys: AccessJwk[]; fetchedAt: number }>();
const keyRequests = new Map<string, Promise<AccessJwk[]>>();
const lastForcedRefresh = new Map<string, number>();

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  return Uint8Array.from(atob(base64), (char) => char.charCodeAt(0));
}

function decodeJson<T>(segment: string): T | null {
  try {
    const parsed: unknown = JSON.parse(new TextDecoder().decode(base64UrlToBytes(segment)));
    return parsed && typeof parsed === "object" ? (parsed as T) : null;
  } catch {
    return null;
  }
}

function isAccessJwk(value: unknown): value is AccessJwk {
  return Boolean(value) && typeof value === "object" && typeof (value as AccessJwk).kid === "string";
}

async function requestAccessKeys(teamDomain: string): Promise<AccessJwk[]> {
  const response = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Access certs returned ${response.status}`);
  const body: unknown = await response.json();
  const rawKeys: unknown = body && typeof body === "object" ? (body as { keys?: unknown }).keys : undefined;
  const keys = Array.isArray(rawKeys) ? rawKeys.filter(isAccessJwk) : [];
  keyCache.set(teamDomain, { keys, fetchedAt: Date.now() });
  return keys;
}

/**
 * Fetches the team's signing keys, cached for an hour. Forced refreshes are limited to one per minute,
 * and concurrent callers share one in-flight request.
 */
export async function fetchAccessKeys(teamDomain: string, force: boolean): Promise<AccessJwk[]> {
  const nowMs = Date.now();
  const cached = keyCache.get(teamDomain);
  if (cached) {
    const lastRefresh = Math.max(cached.fetchedAt, lastForcedRefresh.get(teamDomain) ?? 0);
    if (force ? nowMs - lastRefresh < FORCED_REFRESH_MIN_MS : nowMs - cached.fetchedAt < KEY_CACHE_MS) {
      return cached.keys;
    }
  }

  const pending = keyRequests.get(teamDomain);
  if (pending) return pending;

  // Reserve the forced refresh before the await so overlapping callers can't start their own.
  if (force) lastForcedRefresh.set(teamDomain, nowMs);
  const request = requestAccessKeys(teamDomain).finally(() => keyRequests.delete(teamDomain));
  keyRequests.set(teamDomain, request);
  return request;
}

/**
 * Verifies a Cloudflare Access JWT (`Cf-Access-Jwt-Assertion`): RS256 signature against the team's
 * published keys, issuer, audience, expiry and not-before.
 */
export async function verifyAccessJwt(token: string, options: AccessVerifyOptions): Promise<AccessVerifyResult> {
  const { teamDomain, audience, loadKeys = fetchAccessKeys } = options;

  const parts = token.split(".");
  if (parts.length !== 3) return { valid: false, reason: "malformed token" };
  const [headerSegment, payloadSegment, signatureSegment] = parts;

  const header = decodeJson<JwtHeader>(headerSegment);
  const payload = decodeJson<JwtPayload>(payloadSegment);
  if (!header || !payload) return { valid: false, reason: "malformed token" };
  if (header.alg !== "RS256") return { valid: false, reason: "unexpected algorithm" };
  if (typeof header.kid !== "string") return { valid: false, reason: "missing key id" };

  let keys: AccessJwk[];
  try {
    keys = await loadKeys(teamDomain, false);
    if (!keys.some((key) => key.kid === header.kid)) keys = await loadKeys(teamDomain, true);
  } catch {
    return { valid: false, reason: "signing keys unavailable" };
  }
  const jwk = keys.find((key) => key.kid === header.kid);
  if (!jwk) return { valid: false, reason: "unknown key id" };

  let signatureValid = false;
  try {
    const key = await crypto.subtle.importKey(
      "jwk",
      { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: "RS256", ext: true },
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
    signatureValid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      key,
      base64UrlToBytes(signatureSegment),
      new TextEncoder().encode(`${headerSegment}.${payloadSegment}`),
    );
  } catch {
    signatureValid = false;
  }
  if (!signatureValid) return { valid: false, reason: "bad signature" };

  if (payload.iss !== `https://${teamDomain}`) return { valid: false, reason: "wrong issuer" };
  const audiences = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
  if (!audiences.includes(audience)) return { valid: false, reason: "wrong audience" };

  // Read the clock after the async key loading and signature check.
  const now = options.now ?? Math.floor(Date.now() / 1000);
  if (typeof payload.exp !== "number" || payload.exp + CLOCK_SKEW_SECONDS < now) {
    return { valid: false, reason: "expired" };
  }
  if (typeof payload.nbf === "number" && payload.nbf - CLOCK_SKEW_SECONDS > now) {
    return { valid: false, reason: "not yet valid" };
  }

  return { valid: true, email: typeof payload.email === "string" ? payload.email : "" };
}
