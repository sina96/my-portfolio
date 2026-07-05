import "98.css";
import "../globals.css";
import { IBM_Plex_Mono, Ubuntu_Sans, VT323 } from "next/font/google";
import { Win98WindowManager } from "./components/Win98WindowManager";

const vt323 = VT323({ weight: "400", subsets: ["latin"], variable: "--font-vt323" });
const ibmPlexMono = IBM_Plex_Mono({ weight: ["400", "700"], subsets: ["latin"], variable: "--font-ibm-plex-mono" });
const ubuntuSans = Ubuntu_Sans({ weight: ["400", "500", "700"], subsets: ["latin"], variable: "--font-ubuntu-sans" });

export default function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className={`win98-desktop ${vt323.variable} ${ibmPlexMono.variable} ${ubuntuSans.variable}`}>
      <Win98WindowManager>{children}</Win98WindowManager>
    </div>
  );
}
