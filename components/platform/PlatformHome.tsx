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

// The first screen is one environment, not a widget beside a card. The console (identity,
// Operator, voice) sits in front of the real six-domain Intelligence Network, which bleeds past
// the console's own edge rather than being boxed beside it in a clean 50/50 grid split — you are
// meant to read this as "standing inside the network," not "text next to a diagram." Below the
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

      {/* overflow-x-hidden lives on this outer, full-bleed wrapper — not on the max-w-7xl
          container inside it — so the Intelligence Network can genuinely bleed past its own
          column edge on wide screens without ever producing a horizontal scrollbar. */}
      <div className="relative overflow-x-hidden">
        <div className="relative mx-auto max-w-7xl px-4 pb-4 pt-8 sm:px-8 sm:pt-12 lg:pt-16">
          <div className="relative z-10 max-w-xl lg:max-w-lg">
            <HomeAssistantGreeting />
          </div>

          <div className="cbai-hero-reveal-delayed relative z-0 mt-14 h-[420px] w-full lg:absolute lg:inset-y-[-8%] lg:right-[-14%] lg:z-0 lg:mt-0 lg:h-auto lg:w-[82%]">
            <HomeIntelligenceGlobe />
          </div>
        </div>
      </div>

      {/* Real work continuity comes immediately after the hero's own "next step" link — before
          role selection or ecosystem entrances — because "what was I already doing" outranks
          "what kind of user am I" the moment real projects exist. Same real ProjectList as
          before, just promoted; still honestly empty for a first-time visitor. */}
      <div className="mx-auto mt-16 max-w-6xl px-4 sm:mt-20 sm:px-8">
        <HomeProjectsSection />
      </div>

      <div className="mx-auto mt-16 max-w-6xl space-y-16 px-4 sm:mt-20 sm:px-8">
        <RoleWorkContextCards />
        <HomeEcosystems />
      </div>

      <div className="mx-auto mt-16 max-w-6xl space-y-8 px-4 sm:px-8">
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
