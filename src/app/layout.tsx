import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://sinabastani.dev"),
  title: {
    default: "Sina Bastani",
    template: "%s | Sina Bastani",
  },
  description: "Software developer focused on backend systems, cloud migration, and modern delivery. Blog and CV.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    url: "/",
    title: "Sina Bastani",
    description: "Software developer focused on backend systems, cloud migration, and modern delivery. Blog and CV.",
    siteName: "Sina Bastani",
  },
  twitter: {
    card: "summary",
    title: "Sina Bastani",
    description: "Software developer focused on backend systems, cloud migration, and modern delivery.",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
