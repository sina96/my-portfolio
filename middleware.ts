import { NextResponse, type NextRequest } from "next/server";

const ADMIN_REALM = "Sveltia CMS";

function getUnauthorizedResponse(): NextResponse {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": `Basic realm="${ADMIN_REALM}", charset="UTF-8"`,
      "Cache-Control": "no-store"
    }
  });
}

function getMissingCredentialsResponse(): NextResponse {
  return new NextResponse("Admin credentials are not configured.", {
    status: 503,
    headers: {
      "Cache-Control": "no-store"
    }
  });
}

function parseBasicAuth(authorization: string | null): { username: string; password: string } | undefined {
  if (!authorization?.startsWith("Basic ")) {
    return undefined;
  }

  try {
    const decodedCredentials = atob(authorization.slice("Basic ".length));
    const separatorIndex = decodedCredentials.indexOf(":");

    if (separatorIndex === -1) {
      return undefined;
    }

    return {
      username: decodedCredentials.slice(0, separatorIndex),
      password: decodedCredentials.slice(separatorIndex + 1)
    };
  } catch {
    return undefined;
  }
}

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) {
    return false;
  }

  let diff = 0;

  for (let index = 0; index < left.length; index += 1) {
    diff |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return diff === 0;
}

export function middleware(request: NextRequest): NextResponse {
  const adminUsername = process.env.ADMIN_USERNAME;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminUsername || !adminPassword) {
    return getMissingCredentialsResponse();
  }

  const credentials = parseBasicAuth(request.headers.get("authorization"));

  if (
    credentials &&
    constantTimeEqual(credentials.username, adminUsername) &&
    constantTimeEqual(credentials.password, adminPassword)
  ) {
    return NextResponse.next();
  }

  return getUnauthorizedResponse();
}

export const config = {
  matcher: ["/admin/:path*"]
};
