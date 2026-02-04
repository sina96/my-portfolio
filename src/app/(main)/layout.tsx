import "98.css";
import "../globals.css";

export default function MainLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="win98-desktop">
      {children}
    </div>
  );
}
