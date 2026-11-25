import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminAuthFailure } from "./basicAuth";
import { verifyAccessJwt } from "./cfAccess";
import type { AccessVerifyOptions } from "./cfAccess";

const NO_STORE = { "Cache-Control": "no-store" };
let warnedAboutAccessConfig = false;

function requestHostname(request: NextRequest): string {
  return (request.headers.get("host") ?? request.nextUrl.host).toLowerCase().replace(/:\d+$/, "");
}

/**
 * Returns a response that blocks or redirects the admin request, or null when it is authorized.
 *
 * - `ADMIN_HOST` unset: Basic Auth (local dev and break-glass).
 * - `ADMIN_HOST` set: other hosts redirect there; on it, a valid Cloudflare Access JWT is required and
 *   Basic Auth is not used. Missing Access settings deny (fail closed).
 */
export async function adminAccessFailure(
  request: NextRequest,
  loadKeys?: AccessVerifyOptions["loadKeys"],
): Promise<NextResponse | null> {
  const adminHost = process.env.ADMIN_HOST?.trim().toLowerCase();
  if (!adminHost) return adminAuthFailure(request.headers.get("authorization"));

  if (requestHostname(request) !== adminHost) {
    const { pathname, search } = request.nextUrl;
    return NextResponse.redirect(`https://${adminHost}${pathname}${search}`, { status: 308, headers: NO_STORE });
  }

  const teamDomain = process.env.CF_ACCESS_TEAM_DOMAIN?.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
  const audience = process.env.CF_ACCESS_AUD?.trim();
  if (!teamDomain || !audience) {
    if (!warnedAboutAccessConfig) {
      warnedAboutAccessConfig = true;
      console.warn("[Admin] ADMIN_HOST is set but CF_ACCESS_TEAM_DOMAIN or CF_ACCESS_AUD is missing; admin is disabled.");
    }
    return new NextResponse("Admin access is not configured.", { status: 503, headers: NO_STORE });
  }

  const token = request.headers.get("cf-access-jwt-assertion");
  if (!token) return new NextResponse("Forbidden.", { status: 403, headers: NO_STORE });

  const result = await verifyAccessJwt(token, { teamDomain, audience, loadKeys });
  if (!result.valid) {
    console.warn(`[Admin] Rejected Cloudflare Access token: ${result.reason}.`);
    return new NextResponse("Forbidden.", { status: 403, headers: NO_STORE });
  }
  return null;
}
