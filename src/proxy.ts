import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { adminAuthFailure } from "./lib/basicAuth";

export function proxy(request: NextRequest): NextResponse {
  if (request.nextUrl.pathname !== "/") {
    return adminAuthFailure(request.headers.get("authorization")) ?? NextResponse.next();
  }

  // Config redirects forward the original query and would loop for /?tab=home.
  const target = request.nextUrl.clone();
  const tab = target.searchParams.get("tab");
  if (tab !== "home" && tab !== "blogs" && tab !== "contact") return NextResponse.next();
  target.pathname = tab === "blogs" ? "/blog" : tab === "contact" ? "/contact" : "/";
  target.searchParams.delete("tab");
  return NextResponse.redirect(target, 308);
}

export const config = {
  matcher: [
    "/admin/:path*",
    { source: "/", has: [{ type: "query", key: "tab", value: "home|blogs|contact" }] },
  ],
};
