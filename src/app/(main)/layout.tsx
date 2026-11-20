import XpShell from "./XpShell";

export default function MainLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <XpShell>{children}</XpShell>;
}
