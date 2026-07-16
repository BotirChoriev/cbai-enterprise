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
import ReportReadinessSection from "@/components/reports/ReportReadinessSection";
import SavedReportsSection from "@/components/reports/SavedReportsSection";
import ReportsPrimaryActions from "@/components/reports/ReportsPrimaryActions";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";

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
  const description = entity
    ? `${t("reportsCenter.continuingFor")} ${entity.name}`
    : t("reportsCenter.pageDescription");

  return (
    <OperatingPageShell
      title={title}
      description={description}
      showOperator={false}
      missionContextVariant={disclosure.showInlineHumanDecisionBoundary ? "full" : "compact"}
      action={
        profileHref ? (
          <Link
            href={profileHref}
            className="inline-flex min-h-10 items-center text-sm font-medium text-teal-400 transition-colors hover:text-teal-300"
          >
            {t("reportsCenter.backToProfile")}
          </Link>
        ) : undefined
      }
    >
      <ReportsPrimaryActions />
      <SavedReportsSection />
      {disclosure.showReportsReadinessDetail ? (
        <ReportReadinessSection reportTypes={model.reportTypes} />
      ) : null}
    </OperatingPageShell>
  );
}
