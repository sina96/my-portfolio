import { XpWindowManager } from "./components/XpWindowManager";

export default function XpShell({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="xp-desktop">
      <a href="#main" className="xp-skip-link">Skip to content</a>
      <XpWindowManager year={new Date().getUTCFullYear()}>
        {children}
      </XpWindowManager>
    </div>
  );
}
