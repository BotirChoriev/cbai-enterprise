"use client";

import HomeFooter from "@/components/platform/home/HomeFooter";
import HomeAssistantGreeting from "@/components/platform/home/HomeAssistantGreeting";
import HomeCommandBar from "@/components/platform/home/HomeCommandBar";
import RoleWorkContextCards from "@/components/platform/home/RoleWorkContextCards";
import HomeProjectsSection from "@/components/platform/home/HomeProjectsSection";
import HomeIntelligenceFeed from "@/components/platform/home/HomeIntelligenceFeed";
import HomeRecentActivity from "@/components/platform/home/HomeRecentActivity";
import HomeTrust from "@/components/platform/home/HomeTrust";
import LanguageSelector from "@/components/i18n/LanguageSelector";
import EntryExperience from "@/components/platform/entry/EntryExperience";
import CBAILogo from "@/components/brand/CBAILogo";
import IntelligenceCompass from "@/components/platform/home/IntelligenceCompass";

// The first screen (Platform Completion mission, Phase 7; extended with the Intelligence Compass
// in the Platform Activation mission) — Identity, Greeting, Voice, Projects, Role cards, the
// Compass, Intelligence Feed, Recent activity, Quick actions (delivered inline by the Greeting's
// own real "Suggested next step"/"Available actions" — not a second, separate quick-actions
// widget), and Trust. The marketing/explanation content this page previously carried (Ecosystems,
// World Intelligence Map, Capability Flow, Audience) was not deleted — Ecosystems/Capability
// Flow/Audience moved to /dashboard ("what is available today"), and the World Intelligence Map
// was already duplicated on /countries, so removing it here loses no real capability.
export default function PlatformHome() {
  return (
    <div className="home-page min-h-full bg-[#050810] pb-20">
      <EntryExperience />

      {/* CBAI identity layer (Mission 9.A) alongside the language selector, prominent in the top
          section of the first page (Phase 5), in addition to its permanent spot in the global
          header. */}
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 pt-4 sm:px-8">
        <CBAILogo size="sm" showTagline className="hidden sm:flex" />
        <LanguageSelector />
      </div>

      <HomeAssistantGreeting />

      <div className="mx-auto mt-8 max-w-6xl space-y-8 px-4 sm:px-8">
        <HomeCommandBar />
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
