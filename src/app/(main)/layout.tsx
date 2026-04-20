import "98.css";
import "../globals.css";
import { VT323, IBM_Plex_Mono } from "next/font/google";

const vt323 = VT323({ weight: "400", subsets: ["latin"], variable: "--font-vt323" });
const ibmPlexMono = IBM_Plex_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-ibm-plex-mono" });

export default function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={`win98-desktop ${vt323.variable} ${ibmPlexMono.variable}`}>
      {children}
    </div>
  );
}
