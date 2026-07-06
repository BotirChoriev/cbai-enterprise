import HomeFlow from "@/components/platform/home/HomeFlow";
import HomeFooter from "@/components/platform/home/HomeFooter";
import HomeHero from "@/components/platform/home/HomeHero";
import {
  HomeLanguages,
  HomeRoadmap,
} from "@/components/platform/home/HomeLanguagesRoadmap";
import HomeModules from "@/components/platform/home/HomeModules";
import { HomePersonasSection } from "@/components/platform/home/HomePersonas";
import HomePlatformStatus from "@/components/platform/home/HomePlatformStatus";
import HomePrinciples from "@/components/platform/home/HomePrinciples";
import HomeSection from "@/components/platform/home/HomeSection";
import { PLATFORM_ROADMAP } from "@/lib/platform-home";

export default function PlatformHome() {
  return (
    <div className="space-y-12 pb-8 sm:space-y-14">
      <HomeHero />

      <HomePersonasSection
        id="who-uses-cbai"
        title="Who Uses CBAI"
        description="Each audience receives evidence-oriented intelligence — not generic AI answers."
      />

      <HomeSection
        id="platform-modules"
        title="Platform Modules"
        description="What each module does today. Status reflects current implementation — not roadmap promises."
      >
        <HomeModules />
      </HomeSection>

      <HomeSection
        id="how-cbai-works"
        title="How CBAI Works"
        description="Intelligence flows from verified inputs to explained decisions. Stages without connected evidence stop at transparency labels."
      >
        <HomeFlow />
      </HomeSection>

      <HomeSection
        id="platform-principles"
        title="Platform Principles"
        description="Constitutional rules governing every page and module."
      >
        <HomePrinciples />
      </HomeSection>

      <HomeSection
        id="platform-status"
        title="Current Platform Status"
        description="Real capabilities only. No inflated metrics or simulated activity feeds."
      >
        <HomePlatformStatus />
      </HomeSection>

      <HomePersonasSection
        id="supported-personas"
        title="Supported Personas"
        description="Enter the platform by role. Links lead to the best current entry point for each persona."
        showLinks
      />

      <HomeSection
        id="languages"
        title="Languages"
        description="Multilingual architecture is prepared. Unavailable languages are marked honestly."
      >
        <HomeLanguages />
      </HomeSection>

      <HomeSection
        id="roadmap"
        title="Platform Roadmap"
        description="Verified phases from the Platform Transformation Master Plan. No marketing timelines."
      >
        <HomeRoadmap phases={PLATFORM_ROADMAP} />
      </HomeSection>

      <HomeFooter />
    </div>
  );
}
