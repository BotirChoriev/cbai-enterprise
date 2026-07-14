"use client";

import HomeFooter from "@/components/platform/home/HomeFooter";
import HomeAssistantGreeting from "@/components/platform/home/HomeAssistantGreeting";
import HomeIntelligenceGlobe from "@/components/platform/home/HomeIntelligenceGlobe";
import RoleWorkContextCards from "@/components/platform/home/RoleWorkContextCards";
import HomeEcosystems from "@/components/platform/home/HomeEcosystems";
import HomeProjectsSection from "@/components/platform/home/HomeProjectsSection";
import HomeIntelligenceFeed from "@/components/platform/home/HomeIntelligenceFeed";
import HomeRecentActivity from "@/components/platform/home/HomeRecentActivity";
import HomeTrust from "@/components/platform/home/HomeTrust";
import EntryExperience from "@/components/platform/entry/EntryExperience";
import CBAILogo from "@/components/brand/CBAILogo";
import IntelligenceCompass from "@/components/platform/home/IntelligenceCompass";

// The first screen — one unified, asymmetric hero (identity + Operator + voice command on one
// side, the Living Intelligence Network large and co-equal on the other), not a narrow centered
// column stacked above a separate "network" section reached by scrolling. This directly
// implements the Design Bible's Part IX law that the Globe is the emotional centerpiece, not
// decoration reached after a divider — and Part X's homepage timeline, which asks the first
// screen to communicate identity, evidence, and an invitation to act within one glance. Below the
// hero: (5) Role entry, (6) Ecosystem entrances (Research/Governance/Economic/Public Intelligence
// — real status per ecosystem, reusing the exact same HomeEcosystems component /dashboard already
// used), (7) Current Intelligence (Compass + Feed + Recent activity), (8) Projects, (9) Trust.
// Capability Flow/Audience content stays on /dashboard only — redundant with what's now on Home,
// not complementary to it.
export default function PlatformHome() {
  return (
    <div className="home-page min-h-full bg-[#050810] pb-20">
      <EntryExperience />

      {/* CBAI identity layer (Mission 9.A), prominent in the top section of the first page (Phase
          5), in addition to its permanent spot in the global header. The language selector lives
          only in the Topbar (always present, including here) — a second one on this page would be
          the exact literal duplication this design system is meant to avoid. */}
      <div className="mx-auto flex max-w-7xl items-center px-4 pt-4 sm:px-8">
        <CBAILogo size="sm" showTagline className="hidden sm:flex" />
      </div>

      <div className="mx-auto grid max-w-7xl items-center gap-16 px-4 pb-4 pt-8 sm:px-8 sm:pt-12 lg:grid-cols-[1fr_1.15fr] lg:gap-10 lg:pt-16">
        <HomeAssistantGreeting />
        <div className="cbai-hero-reveal-delayed">
          <HomeIntelligenceGlobe />
        </div>
      </div>

      <div className="mx-auto mt-20 max-w-6xl space-y-16 px-4 sm:mt-28 sm:px-8">
        <RoleWorkContextCards />
        <HomeEcosystems />
      </div>

      <div className="mx-auto mt-16 max-w-6xl space-y-8 px-4 sm:px-8">
        <IntelligenceCompass />
        <div className="grid gap-6 lg:grid-cols-2">
          <HomeIntelligenceFeed />
          <HomeRecentActivity />
        </div>
        <HomeProjectsSection />
        <HomeTrust />
      </div>

      <div className="mx-auto mt-8 max-w-6xl px-4 sm:px-8">
        <HomeFooter />
      </div>
    </div>
  );
}
