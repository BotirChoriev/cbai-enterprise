"use client";

import type { ReportTypeDefinition, ReportAvailabilityLabel } from "@/lib/reports-center";
import { translatedReportStatusClass } from "@/lib/i18n/reports-center-translation";
import { getDictionary } from "@/lib/i18n/translate";
import Link from "next/link";
import { cbaiGraphPanel, cbaiTextCaption } from "@/components/brand/brand-classes";
import { useTranslation } from "@/lib/i18n/use-translation";
import { buildContextualHref } from "@/lib/context";
import { usePlatformContext } from "@/components/platform/context/PlatformContextProvider";

type ReportReadinessSectionProps = {
  reportTypes: readonly ReportTypeDefinition[];
};

function StatusBadge({ label, language }: { label: string; language: string }) {
  const dictionary = getDictionary(language as "en" | "uz" | "ru" | "tr");
  return (
    <span
      className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${translatedReportStatusClass(dictionary, label)}`}
    >
      {label}
    </span>
  );
}

function resolveReportProcessSteps(
  availableToday: ReportAvailabilityLabel,
  t: (path: string) => string,
): readonly string[] {
  if (availableToday === "Not available") {
    return [t("activation.reportCollectingEvidence"), t("activation.reportNotAvailable")];
  }
  if (availableToday === "Registry facts only") {
    return [
      t("activation.reportCollectingEvidence"),
      t("activation.reportCheckingReadiness"),
      t("activation.reportPreparing"),
    ];
  }
  return [
    t("activation.reportCollectingEvidence"),
    t("activation.reportCheckingReadiness"),
  ];
}

export default function ReportReadinessSection({
  reportTypes,
}: ReportReadinessSectionProps) {
  const { t, language } = useTranslation();
  const { context } = usePlatformContext();

  return (
    <section className="space-y-4" aria-labelledby="report-readiness-heading">
      <h2 id="report-readiness-heading" className="text-base font-semibold text-zinc-200">
        {t("reportsCenter.whatCanIOpen")}
      </h2>

      <div className="space-y-4">
        {reportTypes.map((report) => {
          const steps = resolveReportProcessSteps(report.availableToday, t);
          return (
            <div key={report.id} className={cbaiGraphPanel}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-zinc-100">{report.title}</h3>
                  <p className="mt-1 text-sm text-zinc-400">{report.description}</p>
                </div>
                <StatusBadge label={report.availableToday} language={language} />
              </div>

              <ol className={`mt-3 list-inside list-decimal ${cbaiTextCaption}`}>
                {steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>

              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-zinc-600">
                    {t("reportsCenter.evidenceRequired")}
                  </dt>
                  <dd className="mt-1 text-zinc-400">{report.evidenceRequired}</dd>
                </div>
                {report.relatedRoute ? (
                  <div>
                    <Link
                      href={buildContextualHref(report.relatedRoute, context)}
                      className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium text-teal-400 transition-colors hover:border-zinc-600 hover:bg-zinc-800 sm:w-auto"
                    >
                      {t("reportsCenter.openRelatedProfile")}
                    </Link>
                  </div>
                ) : null}
              </dl>
            </div>
          );
        })}
      </div>
    </section>
  );
}
