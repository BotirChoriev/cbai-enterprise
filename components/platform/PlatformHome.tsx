"use client";

import HomeFooter from "@/components/platform/home/HomeFooter";
import HomeAssistantGreeting from "@/components/platform/home/HomeAssistantGreeting";
import HomeIntelligenceGlobe from "@/components/platform/home/HomeIntelligenceGlobe";
import RoleWorkContextCards from "@/components/platform/home/RoleWorkContextCards";
import HomeProjectsSection from "@/components/platform/home/HomeProjectsSection";
import HomeIntelligenceFeed from "@/components/platform/home/HomeIntelligenceFeed";
import HomeRecentActivity from "@/components/platform/home/HomeRecentActivity";
import HomeTrust from "@/components/platform/home/HomeTrust";
import EntryExperience from "@/components/platform/entry/EntryExperience";
import CBAILogo from "@/components/brand/CBAILogo";
import IntelligenceCompass from "@/components/platform/home/IntelligenceCompass";

// The first screen — a deliberate hierarchy, not a stack of equal-weight cards: (1-3) Identity +
// Operator + Voice as one unified hero (HomeAssistantGreeting — the prominent command bar lives
// inside that section, never a second, separate widget), (4) the Living Intelligence Network —
// the real evidence catalog given its own visual moment on Home itself, not just on /countries,
// (5) Role entry, (6) Current Intelligence (Compass + Feed + Recent activity), (7) Projects, (8)
// Trust. The marketing/explanation content this page previously carried (Ecosystems, Capability
// Flow, Audience) was not deleted — moved to /dashboard ("what is available today").
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

      {/* A deliberate break between the arrival moment and everything below it — the contrast
          this page was missing: one uncluttered moment, then "here is what you can do," clearly
          two different kinds of content rather than one undifferentiated stack of cards. */}
      <div className="mx-auto mt-16 flex max-w-6xl items-center gap-4 px-4 sm:mt-24 sm:px-8" aria-hidden="true">
        <span className="h-px flex-1 bg-zinc-800/60" />
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-600">Your workspace</span>
        <span className="h-px flex-1 bg-zinc-800/60" />
      </div>

      <div className="mt-12 sm:mt-16">
        <HomeIntelligenceGlobe />
      </div>

      <div className="mx-auto mt-16 max-w-6xl space-y-8 px-4 sm:px-8">
        <RoleWorkContextCards />
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
