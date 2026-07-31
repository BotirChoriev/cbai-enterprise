"use client";

import Link from "next/link";
import { useMemo } from "react";
import { buildReportsCenterModel } from "@/lib/reports-center";
import { translateReportsCenterModel } from "@/lib/i18n/reports-center-translation";
import { getDictionary } from "@/lib/i18n/translate";
import {
  buildContextualHref,
  getPrimaryEntity,
  PLATFORM_MODULES,
  type PrimaryEntityRef,
} from "@/lib/context";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { useTranslation } from "@/lib/i18n/use-translation";
import OperatingPageShell from "@/components/shared/OperatingPageShell";
import EngineRouteEntryStrip from "@/components/forward-deployed/EngineRouteEntryStrip";
import ReportsEmptyIntro from "@/components/reports/ReportsEmptyIntro";
import ReportReadinessSection from "@/components/reports/ReportReadinessSection";
import SavedReportsSection from "@/components/reports/SavedReportsSection";
import ReportsPrimaryActions from "@/components/reports/ReportsPrimaryActions";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";
import HumanDecisionRecordPanel from "@/components/reports/HumanDecisionRecordPanel";
import IntelligenceStatusRail from "@/components/shared/IntelligenceStatusRail";

function entityProfilePath(entity: PrimaryEntityRef): string {
  switch (entity.kind) {
    case "country":
      return PLATFORM_MODULES.countries.path;
    case "company":
      return PLATFORM_MODULES.companies.path;
    case "university":
      return PLATFORM_MODULES.universities.path;
  }
}

export default function ReportsCenter() {
  const { context } = usePlatformContext();
  const { t, language } = useTranslation();
  const model = useMemo(
    () => translateReportsCenterModel(getDictionary(language), buildReportsCenterModel()),
    [language],
  );
  const entity = getPrimaryEntity(context);
  const profileHref = entity ? buildContextualHref(entityProfilePath(entity), context) : null;
  const disclosure = useProgressiveDisclosure();

  const title = entity ? entity.name : t("reports.title");

  return (
    <OperatingPageShell
      title={title}
      showOperator={false}
      showMissionContext={false}
      action={
        disclosure.level === "expert" && profileHref ? (
          <Link
            href={profileHref}
            className="inline-flex min-h-10 items-center text-sm font-medium text-[var(--cbai-accent-primary)] transition-colors hover:text-[var(--cbai-accent-hover)]"
          >
            {t("reportsCenter.backToProfile")}
          </Link>
        ) : undefined
      }
    >
      <IntelligenceStatusRail
        context={entity?.name ?? (language === "uz" ? "Faol ish uchun hisobot" : "Report for active work")}
        evidence={language === "uz" ? "Manbalar va kelib chiqish hisobotga biriktiriladi" : "Sources and provenance attach to the report"}
        unknown={language === "uz" ? "Yetishmagan tekshiruvlar hisobotda ochiq qoladi" : "Missing checks remain explicit in the report"}
        humanBoundary={language === "uz" ? "Hisobotni inson ko‘rib chiqadi va tasdiqlaydi" : "A human reviews and approves the report"}
      />
      <EngineRouteEntryStrip />
      <ReportsEmptyIntro />
      <ReportsPrimaryActions />
      <HumanDecisionRecordPanel />
      <SavedReportsSection />
      {disclosure.showReportsReadinessDetail ? (
        <ReportReadinessSection reportTypes={model.reportTypes} />
      ) : null}
    </OperatingPageShell>
  );
}
