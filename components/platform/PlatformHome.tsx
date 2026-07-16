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
import { cbaiOperatingShell, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { useAssistantProfile } from "@/components/platform/context/AssistantProfileProvider";
import { useTranslation } from "@/lib/i18n/use-translation";

/**
 * One operating environment — not a marketing landing page. Hierarchy:
 * identity → session → Operator/voice → globe → current work → entrances → trust.
 */
export default function PlatformHome() {
  const { isActive } = useAssistantProfile();
  const { t } = useTranslation();

  return (
    <div className={`home-page ${cbaiOperatingShell} pb-20`}>
      <EntryExperience />

      <header className="mx-auto flex max-w-7xl flex-col gap-3 px-4 pt-4 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <CBAILogo size="sm" showTagline />
          {isActive ? (
            <p className="flex items-center gap-2 text-xs text-zinc-500">
              <span
                aria-hidden="true"
                className="h-1.5 w-1.5 rounded-full bg-emerald-500"
              />
              <span className={cbaiSectionEyebrow}>{t("home.intelligenceSessionLabel")}</span>
              <span className="text-zinc-400">· {t("home.intelligenceSessionActive")}</span>
            </p>
          ) : null}
        </div>
        <p className={cbaiSectionEyebrow}>{t("home.operatingEnvironmentLabel")}</p>
      </header>

      <div className="relative overflow-x-hidden">
        <div className="relative mx-auto max-w-7xl px-4 pb-4 pt-6 sm:px-8 sm:pt-10 lg:pt-12">
          <div className="relative z-10 max-w-xl lg:max-w-lg">
            <HomeAssistantGreeting />
          </div>

          <div className="cbai-hero-reveal-delayed relative z-0 mt-14 h-[420px] w-full lg:absolute lg:inset-y-[-8%] lg:right-[-14%] lg:z-0 lg:mt-0 lg:h-auto lg:w-[82%]">
            <HomeIntelligenceGlobe />
          </div>
        </div>
      </div>

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
