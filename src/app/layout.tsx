import type { Metadata } from "next";
import { Fira_Sans, IBM_Plex_Mono, PT_Sans } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { RSS_ALTERNATE, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";
// The root 404 also uses the XP shell. Load its scoped styles here so Next
// won't emit unused stylesheet preloads for that boundary on other routes.
import "xp.css/dist/XP.css";
import "./(main)/site.css";
import "./(main)/hills.css";
import "./(main)/blog.css";
import "./(main)/panels.css";
import "./(main)/navigation.css";
import "./(main)/hero.css";
import "./(main)/scenery.css";
import "./(main)/pixelDesk.css";
import "./(main)/cv/wordpad.css";

const firaSans = Fira_Sans({ weight: "700", subsets: ["latin"], variable: "--font-fira-sans", display: "swap", preload: false });
const ptSans = PT_Sans({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-pt-sans", display: "swap", preload: false });
const ibmPlexMono = IBM_Plex_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-ibm-plex-mono", display: "swap", preload: false });

const themeInitializerScript = `
(function () {
  if (window.location.pathname === "/") window.history.scrollRestoration = "manual";
  try {
    var savedTheme = window.localStorage.getItem("theme");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = savedTheme === "dark" || (savedTheme !== "light" && prefersDark) ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", theme);
  } catch (error) {
    document.documentElement.setAttribute("data-theme", "light");
  }
})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "",
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  alternates: { types: RSS_ALTERNATE },
  openGraph: {
    type: "website",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
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
    <html lang="en" data-scroll-behavior="smooth" className={`${firaSans.variable} ${ptSans.variable} ${ibmPlexMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitializerScript }} />
      </head>
      <body>
        {children}
        {process.env.VERCEL === "1" && <SpeedInsights />}
      </body>
    </html>
  );
}
