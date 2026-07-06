import HomeFooter from "@/components/platform/home/HomeFooter";
import HomeGlobalImpact from "@/components/platform/home/HomeGlobalImpact";
import HomeHero from "@/components/platform/home/HomeHero";
import { HomeLanguages } from "@/components/platform/home/HomeLanguages";
import HomeModules from "@/components/platform/home/HomeModules";
import HomePersonas from "@/components/platform/home/HomePersonas";
import HomePlatformMap from "@/components/platform/home/HomePlatformMap";
import HomePlatformStatus from "@/components/platform/home/HomePlatformStatus";
import HomeRoadmapTimeline from "@/components/platform/home/HomeRoadmapTimeline";
import HomeSection from "@/components/platform/home/HomeSection";
import HomeTrust from "@/components/platform/home/HomeTrust";

export default function PlatformHome() {
  return (
    <div className="home-page mx-auto max-w-6xl pb-16">
      <HomeHero />

      <HomeSection
        id="who-uses-cbai"
        title="Who Uses CBAI"
        description="Each role has a clear entry path. Select a persona to see supported modules and honest capability limits."
      >
        <HomePersonas />
      </HomeSection>

      <HomeSection
        id="platform-modules"
        title="Platform Modules"
        description="Purpose, evidence status, capabilities, and dependencies — no unavailable features promised."
      >
        <HomeModules />
      </HomeSection>

      <HomeSection id="platform-map" title="Platform Map">
        <HomePlatformMap />
      </HomeSection>

      <section id="trust-center" aria-labelledby="trust-center-heading">
        <h2 id="trust-center-heading" className="sr-only">
          Trust Center
        </h2>
        <HomeTrust />
      </section>

      <HomeSection
        id="global-impact"
        title="Global Impact"
        description="Who benefits from evidence-based intelligence — today and on the verified roadmap."
      >
        <HomeGlobalImpact />
      </HomeSection>

      <HomeSection
        id="platform-status"
        title="Live Platform Status"
        description="Available, in progress, or evidence not connected — never fabricated percentages."
      >
        <HomePlatformStatus />
      </HomeSection>

      <HomeSection
        id="languages"
        title="Languages"
        description="Multilingual architecture prepared. Unavailable languages marked Planned."
      >
        <HomeLanguages />
      </HomeSection>

      <HomeSection
        id="roadmap"
        title="Platform Roadmap"
        description="Verified phases only — no marketing timelines."
      >
        <HomeRoadmapTimeline />
      </HomeSection>

      <HomeFooter />
    </div>
  );
}
