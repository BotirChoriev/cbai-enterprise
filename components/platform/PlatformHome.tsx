"use client";

import HomeFooter from "@/components/platform/home/HomeFooter";
import HomeAssistantGreeting from "@/components/platform/home/HomeAssistantGreeting";
import RoleWorkContextCards from "@/components/platform/home/RoleWorkContextCards";
import HomeProjectsSection from "@/components/platform/home/HomeProjectsSection";
import HomeIntelligenceFeed from "@/components/platform/home/HomeIntelligenceFeed";
import HomeRecentActivity from "@/components/platform/home/HomeRecentActivity";
import HomeTrust from "@/components/platform/home/HomeTrust";
import EntryExperience from "@/components/platform/entry/EntryExperience";
import CBAILogo from "@/components/brand/CBAILogo";
import IntelligenceCompass from "@/components/platform/home/IntelligenceCompass";

// The first screen (Platform Completion mission, Phase 7; extended with the Intelligence Compass
// in the Platform Activation mission) — Identity, Operator + Voice (one unified hero in
// HomeAssistantGreeting — the prominent command bar lives inside that section, not as a second,
// separate widget), Projects, Role cards, the Compass, Intelligence Feed, Recent activity, and
// Trust. The marketing/explanation content this page previously carried (Ecosystems, World
// Intelligence Map, Capability Flow, Audience) was not deleted — Ecosystems/Capability
// Flow/Audience moved to /dashboard ("what is available today"), and the World Intelligence Map
// was already duplicated on /countries, so removing it here loses no real capability.
export default function PlatformHome() {
  return (
    <div className="home-page min-h-full bg-[#050810] pb-20">
      <EntryExperience />

      {/* CBAI identity layer (Mission 9.A), prominent in the top section of the first page (Phase
          5), in addition to its permanent spot in the global header. The language selector lives
          only in the Topbar (always present, including here) — a second one on this page would be
          the exact literal duplication this design system is meant to avoid. */}
      <div className="mx-auto flex max-w-6xl items-center px-4 pt-4 sm:px-8">
        <CBAILogo size="sm" showTagline className="hidden sm:flex" />
      </div>

      <HomeAssistantGreeting />

      <div className="mx-auto mt-8 max-w-6xl space-y-8 px-4 sm:px-8">
        <HomeProjectsSection />
        <RoleWorkContextCards />
        <IntelligenceCompass />
        <div className="grid gap-6 lg:grid-cols-2">
          <HomeIntelligenceFeed />
          <HomeRecentActivity />
        </div>
        <HomeTrust />
      </div>

      <div className="mx-auto mt-8 max-w-6xl px-4 sm:px-8">
        <HomeFooter />
      </div>
    </div>
  );
}
