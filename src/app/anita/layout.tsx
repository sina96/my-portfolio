import type { Metadata } from "next";
import "./anita.css";

export const metadata: Metadata = {
  title: "Anita",
  description: "A private page.",
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export default function AnitaLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="anita-page">{children}</div>;
}
