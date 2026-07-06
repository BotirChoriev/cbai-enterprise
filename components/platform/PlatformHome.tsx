import HomeFooter from "@/components/platform/home/HomeFooter";
import HomeHero from "@/components/platform/home/HomeHero";
import HomeModules from "@/components/platform/home/HomeModules";
import HomeSection from "@/components/platform/home/HomeSection";

export default function PlatformHome() {
  return (
    <div className="home-page mx-auto max-w-6xl pb-16">
      <HomeHero />

      <HomeSection
        id="platform-modules"
        title="What you can open today"
        description="Each module links to live registry data and evidence review."
      >
        <HomeModules />
      </HomeSection>

      <HomeFooter />
    </div>
  );
}
