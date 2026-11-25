import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = dirname(fileURLToPath(import.meta.url));
const dev = process.env.NODE_ENV === "development";

// Next's nonce-free policy keeps prerendering and its inline hydration scripts.
const publicCsp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline' https://va.vercel-scripts.com${dev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https: data: blob:",
  "font-src 'self'",
  `connect-src 'self' https://vitals.vercel-insights.com${dev ? " ws: wss:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  async headers() {
    return [{
      source: "/:path*",
      headers: [
        { key: "X-Content-Type-Options", value: "nosniff" },
        { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        { key: "X-Frame-Options", value: "DENY" },
        { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
      ],
    }, {
      source: "/((?!admin(?:/|$)|_next/static/|_next/image).*)",
      headers: [{ key: dev ? "Content-Security-Policy-Report-Only" : "Content-Security-Policy", value: publicCsp }],
    }];
  },
  serverExternalPackages: ["node-ical"],
  turbopack: {
    root: rootDir,
  },
};

export default nextConfig;
