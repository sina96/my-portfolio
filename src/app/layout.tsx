import type { Metadata } from "next";
import { Inter, Calistoga, Patrick_Hand_SC } from "next/font/google";
import "./globals.css";
import { twMerge } from "tailwind-merge";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const calistoga = Calistoga({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: "400",
  display: "swap",
});

const patrickHand = Patrick_Hand_SC({
  subsets: ["latin"],
  variable: "--font-hand",
  weight: "400",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sina Bastani",
  description: "This is a website with a cool favicon emoji.",
  icons: {
    icon: "/icon.svg",
  },

};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={twMerge(
          inter.variable,
          calistoga.variable,
          patrickHand.variable,
          "bg-gray-900 text-white antialiased font-sans"
        )}
      >
        {children}
      </body>
    </html>
  );
}
