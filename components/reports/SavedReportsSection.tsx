"use client";

import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { deriveFirstMinuteAction, translateFirstMinuteAction } from "@/lib/intelligence-os/first-minute";
import { useMemo, useState } from "react";
import Link from "next/link";
import { loadReports, deleteReport, type SavedReport } from "@/lib/reports/reports-store";
import { PLATFORM_MODULES } from "@/lib/context";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import EmptyState from "@/components/shared/EmptyState";
import ActivationStatusLine from "@/components/shared/ActivationStatusLine";
import { useMissionDataRevision } from "@/lib/hooks/use-mission-data-revision";

function reportHref(report: SavedReport): string {
  switch (report.kind) {
    case "country":
      return `${PLATFORM_MODULES.countries.path}?country=${report.entityId}`;
    case "company":
      return `${PLATFORM_MODULES.companies.path}?company=${report.entityId}`;
    case "university":
      return `${PLATFORM_MODULES.universities.path}?university=${report.entityId}`;
    case "research_topic":
      return `/research/${report.entityId}`;
    case "project":
      return `/my-work?project=${report.projectId ?? report.entityId}#project-report`;
  }
}

export default function SavedReportsSection() {
  const { t } = useTranslation();
  const { mission } = useMissionContext();
  useMissionDataRevision();
  const next = useMemo(() => deriveFirstMinuteAction(mission), [mission]);
  const reports = loadReports();
  const [status, setStatus] = useState<string | null>(null);

  if (reports.length === 0) {
    return (
      <EmptyState
        title={t("reports.myReports")}
        message={t("reports.noReports")}
        action={
          <Link href={next.href} className="text-xs text-teal-400 hover:text-teal-300">
            {translateFirstMinuteAction(t, next)} →
          </Link>
        }
      />
    );
  }

  return (
    <section aria-labelledby="saved-reports-heading" className={`${cbaiGlassCard} space-y-3 p-5`}>
      <p className={cbaiSectionEyebrow} id="saved-reports-heading">
        {t("reportsCenter.savedCount", { count: String(reports.length) })}
      </p>
      {status ? <ActivationStatusLine message={status} compact /> : null}
      <ul className="space-y-2">
        {reports.map((report) => (
          <li
            key={report.id}
            className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-zinc-800/80 bg-zinc-900/40 px-3 py-2"
          >
            <div>
              <Link href={reportHref(report)} className="text-sm font-medium text-teal-400 hover:text-teal-300">
                {report.title}
              </Link>
              <p className="text-[11px] text-zinc-600">
                {t("reportsCenter.savedAt", { date: new Date(report.generatedAt).toLocaleString() })}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                deleteReport(report.id);
                setStatus(t("activation.reportRemoved"));
              }}
              className="text-xs text-zinc-500 hover:text-amber-400"
            >
              {t("reportsCenter.delete")}
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
