"use client";

import { useMissionContext } from "@/components/mission/MissionContextProvider";
import { deriveFirstMinuteAction, translateFirstMinuteAction } from "@/lib/intelligence-os/first-minute";
import { useMemo, useState } from "react";
import Link from "next/link";
import { loadReports, deleteReport, type SavedReport } from "@/lib/reports/reports-store";
import { PLATFORM_MODULES } from "@/lib/context";
import { useTranslation } from "@/lib/i18n/use-translation";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

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

/**
 * Real, persisted Report ownership (Phase 11) — "reopen" always navigates to the live current
 * report (never a stored, potentially stale snapshot); "delete" removes the real saved record.
 * Synced to the cloud when a cloud session is active (see lib/reports/reports-store.ts).
 */
export default function SavedReportsSection() {
  const { t } = useTranslation();
  const { mission } = useMissionContext();
  const next = useMemo(() => deriveFirstMinuteAction(mission), [mission]);
  const [reports, setReports] = useState<SavedReport[]>(() => loadReports());

  if (reports.length === 0) {
    return (
      <section aria-labelledby="saved-reports-heading" className={`${cbaiGlassCard} space-y-2 p-5`}>
        <p className={cbaiSectionEyebrow} id="saved-reports-heading">
          {t("reports.myReports")}
        </p>
        <p className="text-sm text-zinc-500">{t("reports.noReports")}</p>
        <Link href={next.href} className="text-xs text-teal-400 hover:text-teal-300">
          {translateFirstMinuteAction(t, next)} →
        </Link>
      </section>
    );
  }

  return (
    <section aria-labelledby="saved-reports-heading" className={`${cbaiGlassCard} space-y-3 p-5`}>
      <p className={cbaiSectionEyebrow} id="saved-reports-heading">
        {t("reportsCenter.savedCount", { count: String(reports.length) })}
      </p>
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
                setReports(loadReports());
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
