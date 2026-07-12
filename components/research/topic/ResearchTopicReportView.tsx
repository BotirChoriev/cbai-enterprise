import type { ResearchTopicReport } from "@/lib/entity/entity-report";
import type { ProductStatus } from "@/lib/product-status";
import StatusBadge from "@/components/shared/StatusBadge";
import EntityRelatedPanel from "@/components/shared/EntityRelatedPanel";
import ReportPrintButton from "@/components/shared/ReportPrintButton";
import SaveReportButton from "@/components/shared/SaveReportButton";
import ReportHeaderLogo from "@/components/shared/ReportHeaderLogo";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type ResearchTopicReportViewProps = {
  report: ResearchTopicReport & { dataStatus?: ProductStatus };
};

/**
 * Real, compiled Research Topic Report — the fourth entity type to gain a report, via the same
 * buildEntityReport universal facade Country/Company/University already use. Every field traces
 * to already-real data; nothing invented.
 */
export default function ResearchTopicReportView({ report }: ResearchTopicReportViewProps) {
  return (
    <section
      aria-labelledby="research-topic-report-heading"
      className={`${cbaiGlassCard} cbai-print-area space-y-6 border-cyan-500/15 p-5 sm:p-6`}
    >
      <ReportHeaderLogo />
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className={cbaiSectionEyebrow}>Research Topic Report</p>
          <h2 id="research-topic-report-heading" className="mt-1 text-lg font-semibold text-zinc-100">
            {report.topicName}
          </h2>
          <p className="mt-1 text-xs text-zinc-600">Generated {new Date().toLocaleString()}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {report.dataStatus ? <StatusBadge status={report.dataStatus} /> : null}
          <SaveReportButton kind="research_topic" entityId={report.topicId} entityName={report.topicName} title={`${report.topicName} — Research Topic Report`} />
          <ReportPrintButton />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">Research Question</p>
        <p className="text-sm text-zinc-300">{report.question}</p>
      </div>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">Overview</p>
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-zinc-600">Domain</dt>
            <dd className="mt-0.5 text-zinc-300">{report.domain}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[10px] uppercase tracking-wider text-zinc-600">Description</dt>
            <dd className="mt-0.5 text-zinc-300">{report.description}</dd>
          </div>
        </dl>
      </div>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">Evidence</p>
        <p className="text-sm text-zinc-400">
          {report.evidenceConnectedCount} items connected · {report.supportingEvidence.length} supporting ·{" "}
          {report.counterEvidence.length} counter evidence.
        </p>
      </div>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">Research Notes</p>
        {report.notes.length > 0 ? (
          <ul className="space-y-1.5">
            {report.notes.map((note) => (
              <li key={note.noteId} className="text-sm text-zinc-400">
                {note.body}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">No research notes recorded yet.</p>
        )}
      </div>

      <div className="border-t border-zinc-800/80 pt-4">
        <EntityRelatedPanel
          title="Organizations"
          relationships={report.relationships}
          emptyLabel="No related companies in the current catalog."
        />
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
