import { createHash, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";

const EXAMPLE_PASSWORD = "replace-with-a-long-random-password";
let warnedAboutCredentials = false;

function digest(value: string): Buffer {
  return createHash("sha256").update(value).digest();
}

/** Returns an auth failure, or null when the admin request is authorized. */
export function adminAuthFailure(authorization: string | null): NextResponse | null {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  const headers = { "Cache-Control": "no-store" };

  if (!username?.trim() || !password || password.trim().length < 16 || password.trim() === EXAMPLE_PASSWORD) {
    if (!warnedAboutCredentials) {
      warnedAboutCredentials = true;
      console.warn("[Admin] Basic Auth is disabled until real credentials and a password of at least 16 characters are configured.");
    }
    return new NextResponse("Admin credentials are not configured.", { status: 503, headers });
  }

  if (authorization?.startsWith("Basic ")) {
    try {
      const bytes = Uint8Array.from(atob(authorization.slice(6)), (char) => char.charCodeAt(0));
      const decoded = new TextDecoder().decode(bytes);
      const separator = decoded.indexOf(":");
      if (separator !== -1) {
        const userMatches = timingSafeEqual(digest(decoded.slice(0, separator)), digest(username));
        const passwordMatches = timingSafeEqual(digest(decoded.slice(separator + 1)), digest(password));
        if (userMatches && passwordMatches) return null;
      }
    } catch {
      // A malformed header gets the same challenge as invalid credentials.
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { ...headers, "WWW-Authenticate": 'Basic realm="Sveltia CMS", charset="UTF-8"' },
  });
}
