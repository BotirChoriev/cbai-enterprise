"use client";

import HomeHero from "@/components/platform/home/HomeHero";
import HomeFooter from "@/components/platform/home/HomeFooter";
import HomeAssistantGreeting from "@/components/platform/home/HomeAssistantGreeting";
import HomeCommandBar from "@/components/platform/home/HomeCommandBar";
import RoleWorkContextCards from "@/components/platform/home/RoleWorkContextCards";
import HomeProjectsSection from "@/components/platform/home/HomeProjectsSection";
import HomeIntelligenceFeed from "@/components/platform/home/HomeIntelligenceFeed";
import LanguageSelector from "@/components/i18n/LanguageSelector";

export default function PlatformHome() {
  return (
    <div className="home-page min-h-full bg-[#050810] pb-20">
      {/* Language selector, prominent in the top section of the first page (Phase 5), in
          addition to its permanent spot in the global header. */}
      <div className="mx-auto flex max-w-6xl justify-end px-4 pt-4 sm:px-8">
        <LanguageSelector />
      </div>

      <HomeAssistantGreeting />

      <div className="mx-auto mt-8 max-w-6xl space-y-8 px-4 sm:px-8">
        <HomeCommandBar />
        <RoleWorkContextCards />
        <div className="grid gap-6 lg:grid-cols-2">
          <HomeProjectsSection />
          <HomeIntelligenceFeed />
        </div>
      </div>

      <HomeHero />
      <div className="mx-auto max-w-6xl px-4 sm:px-8">
        <HomeFooter />
      </div>
    </div>
  );
}
