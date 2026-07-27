"use client";

import type { ReactNode } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import RoleAnalysisDraftButton from "@/components/operational-objects/RoleAnalysisDraftButton";
import { cbaiGlassCard, cbaiPageStack } from "@/components/brand/brand-classes";

type EcosystemWorkspacePageProps = {
  titleKey: "navigation.government" | "navigation.investor" | "navigation.citizen";
  previewKey: "governancePreview" | "investorPreview" | "citizenPreview";
  children: ReactNode;
};

export default function EcosystemWorkspacePage({
  titleKey,
  previewKey,
  children,
}: EcosystemWorkspacePageProps) {
  const { t } = useTranslation();
  const isInvestor = titleKey === "navigation.investor";
  const isGovernment = titleKey === "navigation.government";

  return (
    <OperatingPageShell
      title={t(titleKey)}
      description={t(`previewPages.${previewKey}`)}
      action={
        isInvestor ? (
          <RoleAnalysisDraftButton
            domain="investor"
            titleHint={t("operationalObject.investorAnalysisTitle")}
            routePath="/investor"
          />
        ) : isGovernment ? (
          <RoleAnalysisDraftButton
            domain="governance"
            titleHint={t("operationalObject.governmentAnalysisTitle")}
            routePath="/government"
          />
        ) : undefined
      }
    >
      <div className={cbaiPageStack}>
        <p className={`${cbaiGlassCard} px-4 py-3 text-xs text-[var(--cbai-text-muted)]`}>
          {t("intelligenceLenses.notPortal")} — {t(`previewPages.${previewKey}`)}
          {isGovernment ? ` — ${t("operationalObject.governmentVsGovernance")}` : null}
          {isInvestor ? ` — ${t("operationalObject.roleAnalysisNonAdvisory")}` : null}
        </p>
        {children}
      </div>
    </OperatingPageShell>
  );
}
