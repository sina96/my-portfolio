import ArrowUpRightIcon from "@/assets/icons/arrow-up-right.svg";

const currentYear = new Date().getFullYear();

const footerLinks = [
  { title: "linkedin", href: "https://www.linkedin.com/in/sina-bastani" },
  { title: "github", href: "https://github.com/sina96" },
  {
    title: "instagram",
    href: "https://www.instagram.com/sinabastanii?igsh=MTYzdmtoMzMwbnFsMA%3D%3D&utm_source=qr",
  },
];

export const Footer = () => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 z-50 overflow-x-clip">
      {/* glow */}
      <div
        className="pointer-events-none absolute h-[240px] w-[1600px] bottom-0 left-1/2 -translate-x-1/2 bg-emerald-300/25
        [mask-image:radial-gradient(50%_50%_at_bottom_center,black,transparent)]"
      />

      {/* background */}
      <div className="backdrop-blur border-t border-white/15 bg-black/40">
        <div className="container py-4 text-sm">
          <div className="flex flex-col items-center gap-2">
            <nav className="flex flex-row items-center justify-center gap-8">
              {footerLinks.map((footerLink) => (
                <a
                  key={footerLink.title}
                  href={footerLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5"
                >
                  <span className="font-semibold">{footerLink.title}</span>
                  <ArrowUpRightIcon className="size-4" />
                </a>
              ))}
            </nav>

            <div className="text-white/40">&copy; {currentYear}</div>
          </div>
        </div>
      </div>
    </footer>
  );
};
