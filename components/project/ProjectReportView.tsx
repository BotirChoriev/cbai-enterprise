import type { ProjectReport } from "@/lib/entity/entity-report";
import type { ProductStatus } from "@/lib/product-status";
import { PROJECT_TASK_STATUS_LABELS } from "@/lib/project/project-types";
import StatusBadge from "@/components/shared/StatusBadge";
import EntityRelatedPanel from "@/components/shared/EntityRelatedPanel";
import ReportPrintButton from "@/components/shared/ReportPrintButton";
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
  return (
    <section
      id="project-report"
      aria-labelledby="project-report-heading"
      className={`${cbaiGlassCard} cbai-print-area space-y-6 border-cyan-500/15 p-5 sm:p-6`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className={cbaiSectionEyebrow}>Project Report</p>
          <h2 id="project-report-heading" className="mt-1 text-lg font-semibold text-zinc-100">
            {report.title}
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">{report.typeLabel}</p>
          <p className="mt-1 text-xs text-zinc-600">Generated {new Date().toLocaleString()}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {report.dataStatus ? <StatusBadge status={report.dataStatus} /> : null}
          <ReportPrintButton />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">Overview</p>
        <p className="text-sm text-zinc-300">{report.description}</p>
      </div>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">Research Question</p>
        <p className="text-sm text-zinc-300">{report.researchQuestion ?? "No research question recorded yet."}</p>
      </div>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">Objectives</p>
        <p className="text-sm text-zinc-300">{report.objectives ?? "No objectives recorded yet."}</p>
      </div>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">Evidence</p>
        {report.evidence.length > 0 ? (
          <ul className="space-y-1">
            {report.evidence.map((e) => (
              <li key={e.evidenceRefId} className="text-sm text-zinc-400">
                {e.title}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">No evidence added yet.</p>
        )}
      </div>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">Notes</p>
        {report.notes.length > 0 ? (
          <ul className="space-y-1.5">
            {report.notes.map((note) => (
              <li key={note.noteId} className="text-sm text-zinc-400">
                {note.body}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">No notes recorded yet.</p>
        )}
      </div>

      <div className="border-t border-zinc-800/80 pt-4">
        <EntityRelatedPanel
          title="Entities"
          relationships={report.relationships}
          emptyLabel="No entities linked to this project yet."
        />
      </div>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">Tasks</p>
        {report.tasks.length > 0 ? (
          <ul className="space-y-1">
            {report.tasks.map((task) => (
              <li key={task.taskId} className="text-sm text-zinc-400">
                {task.title} — <span className="text-zinc-600">{PROJECT_TASK_STATUS_LABELS[task.status]}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">No tasks added yet.</p>
        )}
      </div>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">Open Questions</p>
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
          <p className="text-sm text-zinc-500">No open questions right now.</p>
        )}
      </div>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">Timeline</p>
        {report.timeline.length > 0 ? (
          <ul className="space-y-1">
            {report.timeline.map((entry) => (
              <li key={entry.id} className="text-sm text-zinc-400">
                {entry.description} — <span className="text-zinc-600">{new Date(entry.at).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">No timeline activity recorded yet.</p>
        )}
      </div>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">Trust Statement</p>
        <p className="text-sm text-zinc-400">{report.trustStatement}</p>
      </div>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">Limitations</p>
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
