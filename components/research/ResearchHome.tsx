"use client";

import Link from "next/link";
import ResearchIntelligenceNetworkHome from "@/components/research/ResearchIntelligenceNetworkHome";
import ResearchPrinciples from "@/components/research/ResearchPrinciples";
import EntityOptionalExploration from "@/components/shared/EntityOptionalExploration";
import ResearchNetwork from "@/components/research/network/ResearchNetwork";
import ResearchEcosystemOverview from "@/components/research/ResearchEcosystemOverview";
import ResearchGraphPanel from "@/components/research/graph/ResearchGraphPanel";
import { useTranslation } from "@/lib/i18n/use-translation";
import { getGriCopy } from "@/lib/i18n/platform-copy-global-research-intelligence";
import IntelligencePageFrame from "@/components/shared/IntelligencePageFrame";
import { cbaiBtnPrimary, cbaiFocusRing } from "@/components/brand/brand-classes";

export default function ResearchHome() {
  const { language } = useTranslation();
  const copy = getGriCopy(language);

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
