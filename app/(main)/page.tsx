import HeroSection from "@/components/HeroSection";
import EmotionalSection from "@/components/EmotionalSection";
import TrustSection from "@/components/TrustSection";
import FeedSection from "@/components/FeedSection";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50/50">
      <HeroSection />
      <FeedSection />
      <EmotionalSection />
      <TrustSection />
    </div>
  );
}
