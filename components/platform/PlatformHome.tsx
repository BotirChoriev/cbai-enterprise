import HomeHero from "@/components/platform/home/HomeHero";
import HomeFooter from "@/components/platform/home/HomeFooter";

export default function PlatformHome() {
  return (
    <div className="home-page min-h-full bg-[#050810] pb-20">
      <HomeHero />
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <HomeFooter />
      </div>
    </div>
  );
}
