"use client";

import Link from "next/link";
import ResearchIntelligenceNetworkHome from "@/components/research/ResearchIntelligenceNetworkHome";
import ResearchPrinciples from "@/components/research/ResearchPrinciples";
import EntityOptionalExploration from "@/components/shared/EntityOptionalExploration";
import ResearchNetwork from "@/components/research/network/ResearchNetwork";
import ResearchEcosystemOverview from "@/components/research/ResearchEcosystemOverview";
import ResearchGraphPanel from "@/components/research/graph/ResearchGraphPanel";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getDictionary } from "@/lib/i18n/translate";
import { getGriCopy } from "@/lib/i18n/platform-copy-global-research-intelligence";
import IntelligencePageFrame from "@/components/shared/IntelligencePageFrame";
import { cbaiBtnPrimary, cbaiBtnSecondary, cbaiFocusRing } from "@/components/brand/brand-classes";

export default function ResearchHome() {
  const { language } = useTranslation();
  const copy = getGriCopy(language);
  const intake = getDictionary(language).researchHome;

  return (
    <IntelligencePageFrame
      title={copy.title}
      purpose={copy.oneSentence}
      nextStep={copy.primaryAction}
      evidenceStatus={copy.honestyBanner}
      knownUnknown={copy.noVerifiedData}
      confirmationBoundary={copy.voiceClearance}
      showOperator={false}
      primaryAction={
        <Link
          href="/research?view=opportunities"
          className={`${cbaiBtnPrimary} ${cbaiFocusRing} inline-flex min-h-11 items-center px-4`}
        >
          {copy.primaryAction}
        </Link>
      }
    >
      <div className="mt-4 space-y-6">
        <section
          className="rounded-2xl border border-[var(--cbai-border-subtle)] bg-[var(--cbai-surface-solid)] p-4 sm:p-5"
          data-cbai-research-intake=""
          aria-labelledby="research-intake-title"
        >
          <p className="cbai-section-eyebrow">{intake.intakeEyebrow}</p>
          <h2 id="research-intake-title" className="mt-1 text-lg font-semibold text-[var(--cbai-text-primary)]">
            {intake.intakeTitle}
          </h2>
          <p className="mt-2 max-w-3xl text-sm text-[var(--cbai-text-secondary)]">{intake.intakeBody}</p>
          <p className="mt-2 text-xs text-[var(--cbai-text-muted)]">{intake.intakeHonest}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/scientific-documents"
              className={`${cbaiBtnPrimary} ${cbaiFocusRing} inline-flex min-h-11 items-center px-4`}
            >
              {intake.intakeOpenDocuments}
            </Link>
            <Link
              href="/my-work"
              className={`${cbaiBtnSecondary} ${cbaiFocusRing} inline-flex min-h-11 items-center px-4`}
            >
              {intake.intakeOpenMyWork}
            </Link>
          </div>
        </section>
        <ResearchIntelligenceNetworkHome />
        <EntityOptionalExploration>
          <ResearchNetwork />
          <ResearchEcosystemOverview />
          <ResearchGraphPanel variant="global" />
          <ResearchPrinciples />
        </EntityOptionalExploration>
      </div>
    </IntelligencePageFrame>
  );
}
