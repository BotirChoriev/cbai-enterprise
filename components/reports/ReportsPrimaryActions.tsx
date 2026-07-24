"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { useProgressiveDisclosure } from "@/lib/hooks/use-progressive-disclosure";
import {
  buildContextualHref,
  getPrimaryEntity,
  PLATFORM_MODULES,
  type PrimaryEntityRef,
} from "@/lib/context";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { buildEntityReport } from "@/lib/entity/entity-report";
import {
  mergeQueryParams,
  operatingParamsFromMission,
  serializeOperatingParams,
} from "@/lib/intelligence-os/mission-operating-context";
import { cbaiLinkMuted, cbaiMineralPanelMd, cbaiProminentAction } from "@/components/brand/brand-classes";

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

function canGenerateEntityReport(entity: PrimaryEntityRef): boolean {
  let report;
  switch (entity.kind) {
    case "country":
      report = buildEntityReport("country", entity.id);
      break;
    case "company":
      report = buildEntityReport("company", entity.id);
      break;
    case "university":
      report = buildEntityReport("university", entity.id);
      break;
  }
  return report !== null && report.dataStatus !== "waiting_for_verified_data";
}

export default function ReportsPrimaryActions() {
  const { t } = useTranslation();
  const { mission } = useMissionContext();
  const { context } = usePlatformContext();
  const disclosure = useProgressiveDisclosure();
  const entity = getPrimaryEntity(context);
  const operating = operatingParamsFromMission(mission);

  const primary = useMemo(() => {
    if (mission?.projectId) {
      return {
        label: t("entityIntelligence.generateReport"),
        href: `/my-work${mergeQueryParams(serializeOperatingParams(operating))}#project-report`,
      };
    }

    if (entity) {
      if (canGenerateEntityReport(entity)) {
        return {
          label: t("entityIntelligence.generateReport"),
          href: `${buildContextualHref(entityProfilePath(entity), context, operating)}#reports`,
        };
      }

      return {
        label: t("zeroLearningCurve.reportsReview"),
        href: buildContextualHref(PLATFORM_MODULES.evidence.path, context, operating),
      };
    }

    return {
      label: t("zeroLearningCurve.reportsReview"),
      href: buildContextualHref(PLATFORM_MODULES.evidence.path, context, operating),
    };
  }, [context, entity, mission, operating, t]);

  if (disclosure.level === "beginner") return null;
  if (!mission?.projectId && !entity) return null;

  return (
    <nav className={cbaiMineralPanelMd} aria-label={t("zeroLearningCurve.reportsAlsoAvailable")}>
      <div className="flex flex-wrap items-center gap-3">
        <Link href={primary.href} className={cbaiProminentAction}>
          {primary.label}
        </Link>
        {entity ? (
          <Link
            href={buildContextualHref(entityProfilePath(entity), context, operating)}
            className={cbaiLinkMuted}
          >
            {t("reportsCenter.backToProfile")}
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
