"use client";

import Link from "next/link";
import type { ResearchTopicReport } from "@/lib/entity/entity-report";
import type { ProductStatus } from "@/lib/product-status";
import StatusBadge from "@/components/shared/StatusBadge";
import EntityRelatedPanel from "@/components/shared/EntityRelatedPanel";
import ReportPrintButton from "@/components/shared/ReportPrintButton";
import SaveReportButton from "@/components/shared/SaveReportButton";
import ReportHeaderLogo from "@/components/shared/ReportHeaderLogo";
import ReportHonestyStatement from "@/components/shared/ReportHonestyStatement";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { useReportCommon } from "@/lib/i18n/use-report-common";
import { useTranslation } from "@/lib/i18n/use-translation";

type ResearchTopicReportViewProps = {
  report: ResearchTopicReport & { dataStatus?: ProductStatus };
};

function LinkList({ links, emptyLabel }: { links: readonly { name: string; href: string | null }[]; emptyLabel: string }) {
  if (links.length === 0) {
    return <p className="text-sm text-zinc-500">{emptyLabel}</p>;
  }
  return (
    <ul className="flex flex-wrap gap-2">
      {links.map((link) =>
        link.href ? (
          <li key={link.name}>
            <Link
              href={link.href}
              className="rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-xs text-zinc-400 hover:text-teal-300"
            >
              {link.name}
            </Link>
          </li>
        ) : (
          <li key={link.name} className="rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-xs text-zinc-500">
            {link.name}
          </li>
        ),
      )}
    </ul>
  );
}

/**
 * Real, compiled Research Topic Report — the fourth entity type to gain a report, via the same
 * buildEntityReport universal facade Country/Company/University already use. Every field traces
 * to already-real data; nothing invented.
 */
export default function ResearchTopicReportView({ report }: ResearchTopicReportViewProps) {
  const labels = useReportCommon();
  const { t } = useTranslation();
  const generatedDate = new Date().toLocaleString();

  return (
    <section
      aria-labelledby="research-topic-report-heading"
      className={`${cbaiGlassCard} cbai-print-area space-y-6 border-teal-500/15 p-5 sm:p-6`}
    >
      <ReportHeaderLogo />
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className={cbaiSectionEyebrow}>{labels.researchEyebrow}</p>
          <h2 id="research-topic-report-heading" className="mt-1 text-lg font-semibold text-zinc-100">
            {report.topicName}
          </h2>
          <p className="mt-1 text-xs text-zinc-600">{labels.generated(generatedDate)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {report.dataStatus ? <StatusBadge status={report.dataStatus} /> : null}
          <SaveReportButton
            kind="research_topic"
            entityId={report.topicId}
            entityName={report.topicName}
            title={`${report.topicName} — ${labels.researchEyebrow}`}
          />
          <ReportPrintButton />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
          {t("researchTopicCompletion.reportResearchQuestion")}
        </p>
        <p className="text-sm text-zinc-300">{report.question}</p>
      </div>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">{labels.overview}</p>
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-3">
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-zinc-600">
              {t("researchTopicCompletion.reportDomain")}
            </dt>
            <dd className="mt-0.5 text-zinc-300">{report.domain}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-[10px] uppercase tracking-wider text-zinc-600">
              {t("researchTopicCompletion.reportDescription")}
            </dt>
            <dd className="mt-0.5 text-zinc-300">{report.description}</dd>
          </div>
        </dl>
      </div>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">{labels.evidence}</p>
        <p className="text-sm text-zinc-400">
          {t("researchTopicCompletion.reportEvidenceSummary", {
            connected: String(report.evidenceConnectedCount),
            supporting: String(report.supportingEvidence.length),
            counter: String(report.counterEvidence.length),
          })}
        </p>
      </div>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">
          {t("researchTopicCompletion.reportNotes")}
        </p>
        {report.notes.length > 0 ? (
          <ul className="space-y-1.5">
            {report.notes.map((note) => (
              <li key={note.noteId} className="text-sm text-zinc-400">
                {note.body}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">{t("researchTopicCompletion.reportNotesEmpty")}</p>
        )}
      </div>

      <div className="border-t border-zinc-800/80 pt-4">
        <EntityRelatedPanel
          title={labels.organizations}
          relationships={report.relationships}
          emptyLabel={labels.noRelatedCompanies}
        />
      </div>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">{labels.projects}</p>
        <LinkList links={report.linkedProjects} emptyLabel={labels.noProjectsLinked} />
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
