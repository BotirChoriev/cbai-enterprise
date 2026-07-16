"use client";

import Link from "next/link";
import type { UniversityReport, UniversityReportLink } from "@/lib/university-report";
import type { ProductStatus } from "@/lib/product-status";
import StatusBadge from "@/components/shared/StatusBadge";
import EntityFutureSources from "@/components/shared/EntityFutureSources";
import ReportPrintButton from "@/components/shared/ReportPrintButton";
import SaveReportButton from "@/components/shared/SaveReportButton";
import ReportHeaderLogo from "@/components/shared/ReportHeaderLogo";
import ReportHonestyStatement from "@/components/shared/ReportHonestyStatement";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import { useReportCommon } from "@/lib/i18n/use-report-common";

type UniversityReportViewProps = {
  report: UniversityReport & { dataStatus?: ProductStatus };
};

function LinkList({ links, emptyLabel }: { links: readonly UniversityReportLink[]; emptyLabel: string }) {
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

/** Real, compiled University Intelligence Report — every field traces to already-real data; nothing invented. */
export default function UniversityReportView({ report }: UniversityReportViewProps) {
  const labels = useReportCommon();
  const generatedDate = new Date().toLocaleString();

  return (
    <section
      aria-labelledby="university-report-heading"
      className={`${cbaiGlassCard} cbai-print-area space-y-6 border-teal-500/15 p-5 sm:p-6`}
    >
      <ReportHeaderLogo />
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className={cbaiSectionEyebrow}>{labels.universityEyebrow}</p>
          <h2 id="university-report-heading" className="mt-1 text-lg font-semibold text-zinc-100">
            {report.university.name}
          </h2>
          <p className="mt-1 text-xs text-zinc-600">{labels.generated(generatedDate)}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {report.dataStatus ? <StatusBadge status={report.dataStatus} /> : null}
          <SaveReportButton
            kind="university"
            entityId={report.university.id}
            entityName={report.university.name}
            title={`${report.university.name} — ${labels.universityEyebrow}`}
          />
          <ReportPrintButton />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">{labels.overview}</p>
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-zinc-600">City</dt>
            <dd className="mt-0.5 text-zinc-300">{report.overview.city}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-zinc-600">Type</dt>
            <dd className="mt-0.5 text-zinc-300">{report.overview.type}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-zinc-600">Founded</dt>
            <dd className="mt-0.5 text-zinc-300">{report.overview.founded}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-zinc-600">Website</dt>
            <dd className="mt-0.5 text-zinc-300">
              {report.overview.website ? (
                <a href={report.overview.website} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline">
                  {report.overview.website}
                </a>
              ) : (
                labels.noVerifiedInfo
              )}
            </dd>
          </div>
        </dl>
      </div>

      <div className="space-y-3 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">{labels.evidence}</p>
        <p className="text-sm text-zinc-400">
          {labels.evidenceSummary({
            connected: String(report.evidence.connectedSources),
            total: String(report.evidence.totalSources),
            indicators: String(report.evidence.connectedIndicators),
            questions: String(report.evidence.openQuestions),
          })}
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-wider text-zinc-600">{labels.connectedEvidence}</p>
            <LinkList
              links={report.evidence.connectedSourceNames.map((name) => ({ name, href: null }))}
              emptyLabel={labels.noSourcesConnected}
            />
          </div>
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-wider text-zinc-600">{labels.missingEvidence}</p>
            <LinkList
              links={report.evidence.missingSourceNames.map((name) => ({ name, href: null }))}
              emptyLabel={labels.noMissingSources}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-800/80 pt-4">
        <EntityFutureSources domainIds={report.futureDomainIds} />
      </div>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">{labels.research}</p>
        <p className="text-sm text-zinc-500">{report.research}</p>
      </div>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">{labels.organizations}</p>
        <div className="space-y-3">
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-wider text-zinc-600">Related country</p>
            {report.relatedCountry ? (
              <LinkList links={[report.relatedCountry]} emptyLabel="No related country in the current catalog." />
            ) : (
              <p className="text-sm text-zinc-500">No related country in the current catalog.</p>
            )}
          </div>
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-wider text-zinc-600">{labels.relatedCompanies}</p>
            <LinkList links={report.relatedCompanies} emptyLabel={labels.noRelatedCompanies} />
          </div>
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-wider text-zinc-600">{labels.projects}</p>
            <LinkList links={report.linkedProjects} emptyLabel={labels.noProjectsLinked} />
            <Link
              href={`/my-work?entityKind=university&entityId=${report.university.id}&entityName=${encodeURIComponent(report.university.name)}`}
              className="mt-1.5 inline-flex text-xs font-medium text-teal-400 hover:text-teal-300"
            >
              {labels.createProjectFor(report.university.name)}
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">{labels.methodology}</p>
        <ul className="space-y-1.5">
          {report.methodology.map((point) => (
            <li key={point.id} className="text-sm text-zinc-400">
              <span className="font-medium text-zinc-300">{point.title}.</span> {point.description}
            </li>
          ))}
        </ul>
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
