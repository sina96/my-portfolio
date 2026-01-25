import { HeroSection } from "@/sections/Hero";
import { Footer } from "@/sections/Footer";

export default function Home() {
  return (
    <div className="min-h-screen relative">
      {/* Content gets padding-bottom so it doesn't sit under the fixed footer */}
      <main className="pb-24">
        <HeroSection />
      </main>

      <Footer />
    </div>
  );
}
