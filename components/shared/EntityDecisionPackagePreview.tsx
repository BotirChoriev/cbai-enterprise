"use client";

import Link from "next/link";
import type { ReportTypeDefinition } from "@/lib/reports-center";
import { buildContextualHref } from "@/lib/context";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";
import { useTranslation } from "@/lib/i18n/use-translation";

type EntityReportsAvailableProps = {
  reports: readonly ReportTypeDefinition[];
  entityLabel: "country" | "company" | "university";
};

export function EntityReportsAvailable({ reports, entityLabel }: EntityReportsAvailableProps) {
  const { context } = usePlatformContext();
  const { t } = useTranslation();

  if (reports.length === 0) return null;

  const reportsHref = buildContextualHref("/analytics", context);
  const entityTypeLabel =
    entityLabel === "country"
      ? t("entityIntelligence.entityTypeCountry")
      : entityLabel === "company"
        ? t("entityIntelligence.entityTypeCompany")
        : t("entityIntelligence.entityTypeUniversity");

  return (
    <section id="reports" className="scroll-mt-6 space-y-3" aria-labelledby="reports-heading">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 id="reports-heading" className="text-base font-semibold text-zinc-200">
            {t("entityIntelligence.reports")}
          </h3>
          <p className="mt-0.5 text-sm text-zinc-500">
            {reports.length > 1
              ? t("entityIntelligence.reportsBodyPlural")
              : t("entityIntelligence.reportsBodySingle")}
          </p>
        </div>
        <Link
          href={reportsHref}
          className="inline-flex min-h-10 w-full shrink-0 items-center justify-center rounded-lg bg-zinc-100 px-4 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white sm:w-auto"
        >
          {t("entityIntelligence.openReportsCenter")}{" "}
          <span className="sr-only">
            {t("entityIntelligence.openReportsCenterSr", { entityLabel: entityTypeLabel.toLowerCase() })}
          </span>
          →
        </Link>
      </div>
    </section>
  );
}
