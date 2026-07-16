"use client";

import type { ProjectReport } from "@/lib/entity/entity-report";
import type { ProductStatus } from "@/lib/product-status";
import { useTranslation } from "@/lib/i18n/use-translation";
import { useReportCommon } from "@/lib/i18n/use-report-common";
import { translateProjectTaskStatus } from "@/lib/i18n/project-translation";
import StatusBadge from "@/components/shared/StatusBadge";
import EntityRelatedPanel from "@/components/shared/EntityRelatedPanel";
import ReportPrintButton from "@/components/shared/ReportPrintButton";
import SaveReportButton from "@/components/shared/SaveReportButton";
import ReportHeaderLogo from "@/components/shared/ReportHeaderLogo";
import ReportHonestyStatement from "@/components/shared/ReportHonestyStatement";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ProjectReportViewProps = {
  report: ProjectReport & { dataStatus?: ProductStatus };
};

/**
 * Real, compiled Project Report — automatically assembles Overview, Research Question, Evidence,
 * Notes, Entities, Timeline, Trust, and Limitations from already-real project data via the same
 * buildEntityReport universal facade every other entity type uses.
 */
export default function ProjectReportView({ report }: ProjectReportViewProps) {
  const { t } = useTranslation();
  const labels = useReportCommon();
  const generatedDate = new Date().toLocaleString();
  return (
    <section
      id="project-report"
      aria-labelledby="project-report-heading"
      className={`${cbaiGlassCard} cbai-print-area space-y-6 border-teal-500/15 p-5 sm:p-6`}
    >
      <ReportHeaderLogo />
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className={cbaiSectionEyebrow}>{labels.projectEyebrow}</p>
          <h2 id="project-report-heading" className="mt-1 text-lg font-semibold text-zinc-100">
            {report.title}
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">{report.typeLabel}</p>
          <p className="mt-1 text-xs text-zinc-600">{labels.generated(generatedDate)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {report.dataStatus ? <StatusBadge status={report.dataStatus} /> : null}
          <SaveReportButton kind="project" entityId={report.projectId} entityName={report.title} title={`${report.title} — ${labels.projectEyebrow}`} projectId={report.projectId} />
          <ReportPrintButton />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">{labels.overview}</p>
        <p className="text-sm text-zinc-300">{report.description}</p>
      </div>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">{t("projectUi.researchQuestion")}</p>
        <p className="text-sm text-zinc-300">{report.researchQuestion ?? t("projectUi.noResearchQuestion")}</p>
      </div>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">{t("projectUi.objectives")}</p>
        <p className="text-sm text-zinc-300">{report.objectives ?? t("projectUi.noObjectives")}</p>
      </div>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">{labels.evidence}</p>
        {report.evidence.length > 0 ? (
          <ul className="space-y-1">
            {report.evidence.map((e) => (
              <li key={e.evidenceRefId} className="text-sm text-zinc-400">
                {e.title}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">{t("projectUi.noEvidence")}</p>
        )}
      </div>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">{t("projectUi.notes")}</p>
        {report.notes.length > 0 ? (
          <ul className="space-y-1.5">
            {report.notes.map((note) => (
              <li key={note.noteId} className="text-sm text-zinc-400">
                {note.body}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">{t("projectUi.noNotes")}</p>
        )}
      </div>

      <div className="border-t border-zinc-800/80 pt-4">
        <EntityRelatedPanel
          title={t("projectUi.entities")}
          relationships={report.relationships}
          emptyLabel={t("projectUi.noEntitiesLinked")}
        />
      </div>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">{t("projectUi.tasks")}</p>
        {report.tasks.length > 0 ? (
          <ul className="space-y-1">
            {report.tasks.map((task) => (
              <li key={task.taskId} className="text-sm text-zinc-400">
                {task.title} — <span className="text-zinc-600">{translateProjectTaskStatus(t, task.status)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">{t("projectUi.noTasks")}</p>
        )}
      </div>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">{t("projectUi.openQuestions")}</p>
        {report.openQuestions.filter((q) => !q.resolved).length > 0 ? (
          <ul className="space-y-1">
            {report.openQuestions
              .filter((q) => !q.resolved)
              .map((q) => (
                <li key={q.questionId} className="text-sm text-zinc-400">
                  {q.question}
                </li>
              ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">{t("projectUi.noOpenQuestions")}</p>
        )}
      </div>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">{t("projectUi.timeline")}</p>
        {report.timeline.length > 0 ? (
          <ul className="space-y-1">
            {report.timeline.map((entry) => (
              <li key={entry.id} className="text-sm text-zinc-400">
                {entry.description} — <span className="text-zinc-600">{new Date(entry.at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">{t("projectUi.noTimeline")}</p>
        )}
      </div>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">{labels.trustStatement}</p>
        <p className="text-sm text-zinc-400">{report.trustStatement}</p>
      </div>

      <ReportHonestyStatement />

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">{labels.limitations}</p>
        <ul className="list-disc space-y-1 pl-4">
          {report.limitations.map((limitation) => (
            <li key={limitation} className="text-sm text-zinc-500">
              {limitation}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
