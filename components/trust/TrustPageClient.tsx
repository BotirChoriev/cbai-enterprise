"use client";

import Link from "next/link";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getDictionary } from "@/lib/i18n/translate";
import { translateDataSourceScope } from "@/lib/i18n/trust-data-sources-translation";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import ModuleAccountabilityPanel from "@/components/trust/ModuleAccountabilityPanel";
import OrganizationInspectorPanel from "@/components/organization/OrganizationInspectorPanel";
import TrustVerificationStatuses from "@/components/trust/TrustVerificationStatuses";
import TrustOperatingDashboard from "@/components/enterprise/TrustOperatingDashboard";
import OfficialEvidencePanel from "@/components/enterprise/OfficialEvidencePanel";
import LiveGlobalStatusStrip from "@/components/enterprise/LiveGlobalStatusStrip";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { DATA_SOURCE_CATEGORIES } from "@/lib/trust/data-source-categories";
import { PLATFORM_VERSION } from "@/lib/platform-home";

const SECTIONS = [
  { id: "constitution", key: "constitution" as const },
  { id: "methodology", key: "methodology" as const },
  { id: "verification-model", key: "verificationModel" as const, showVerificationStatuses: true },
  { id: "evidence-policy", key: "evidencePolicy" as const },
  { id: "data-sources", key: "dataSources" as const, showDataSources: true },
  { id: "human-decision", key: "humanDecision" as const },
  { id: "privacy", key: "privacy" as const },
  { id: "terms-of-use", key: "termsOfUse" as const },
  { id: "copyright", key: "copyright" as const },
  { id: "known-limitations", key: "knownLimitations" as const },
  { id: "transparency-statement", key: "transparency" as const, showVersion: true },
] as const;

export default function TrustPageClient() {
  const { t, language } = useTranslation();
  const disclosure = useProgressiveDisclosure();
  const dictionary = getDictionary(language);
  const trustPage = dictionary.trustPage;

  return (
    <OperatingPageShell title={t("trust.title")} description={trustPage.pageDescription} showMissionContext={false}>
      <LiveGlobalStatusStrip />
      <OfficialEvidencePanel showReports />
      <TrustOperatingDashboard />

      <nav aria-label={trustPage.sectionsNav} className={`${cbaiGlassCard} p-4`}>
        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
          {SECTIONS.map((section) => (
            <li key={section.id}>
              <a href={`#${section.id}`} className="text-teal-400 hover:text-teal-300">
                {trustPage[section.key].title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="space-y-6">
        {SECTIONS.map((section, index) => {
          const content = trustPage[section.key];
          return (
            <section
              key={section.id}
              id={section.id}
              aria-labelledby={`${section.id}-heading`}
              className={`${cbaiGlassCard} relative space-y-3 overflow-hidden p-6 pl-8 scroll-mt-20`}
            >
              <span aria-hidden="true" className="absolute inset-y-0 left-0 w-[3px] bg-[#005810] opacity-60" />
              <div>
                <p className={cbaiSectionEyebrow}>{String(index + 1).padStart(2, "0")}</p>
                <h2 id={`${section.id}-heading`} className="mt-1 text-lg font-semibold text-zinc-100">
                  {content.title}
                </h2>
              </div>
              {content.body.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-relaxed text-zinc-400">
                  {paragraph}
                </p>
              ))}
              {"showDataSources" in section && section.showDataSources
                ? DATA_SOURCE_CATEGORIES.map((source) => (
                    <p key={source.name} className="text-sm leading-relaxed text-zinc-400">
                      {source.name} — {translateDataSourceScope(dictionary, source.name)}
                    </p>
                  ))
                : null}
              {"showVerificationStatuses" in section && section.showVerificationStatuses ? (
                <TrustVerificationStatuses />
              ) : null}
              {"showVersion" in section && section.showVersion ? (
                <p className="text-sm leading-relaxed text-zinc-400">{`Version ${PLATFORM_VERSION}.`}</p>
              ) : null}
            </section>
          );
        })}
      </div>

      {disclosure.showEvidenceAdvanced ? (
        <>
          <OrganizationInspectorPanel />
          <ModuleAccountabilityPanel />
        </>
      ) : null}

      <p className="text-xs text-zinc-600">
        <Link href="/#home-trust-heading" className="text-teal-400 hover:text-teal-300">
          {trustPage.homeLink}
        </Link>{" "}
        {trustPage.homeLinkHint}
      </p>
    </OperatingPageShell>
  );
}
