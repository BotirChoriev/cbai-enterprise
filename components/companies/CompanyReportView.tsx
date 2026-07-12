import Link from "next/link";
import type { CompanyReport } from "@/lib/company-report";
import type { ProductStatus } from "@/lib/product-status";
import StatusBadge from "@/components/shared/StatusBadge";
import EntityFutureSources from "@/components/shared/EntityFutureSources";
import { getResearchTopicPath } from "@/lib/research/research-topics";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

type CompanyReportViewProps = {
  report: CompanyReport & { dataStatus?: ProductStatus };
};

function NameList({ names, emptyLabel }: { names: readonly string[]; emptyLabel: string }) {
  if (names.length === 0) {
    return <p className="text-sm text-zinc-500">{emptyLabel}</p>;
  }
  return (
    <ul className="flex flex-wrap gap-2">
      {names.map((name) => (
        <li key={name} className="rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-xs text-zinc-400">
          {name}
        </li>
      ))}
    </ul>
  );
}

/** Real, compiled Company Intelligence Report — every field traces to already-real data; nothing invented. */
export default function CompanyReportView({ report }: CompanyReportViewProps) {
  return (
    <section
      aria-labelledby="company-report-heading"
      className={`${cbaiGlassCard} space-y-6 border-cyan-500/15 p-5 sm:p-6`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className={cbaiSectionEyebrow}>Company Intelligence Report</p>
          <h2 id="company-report-heading" className="mt-1 text-lg font-semibold text-zinc-100">
            {report.company.name}
          </h2>
        </div>
        {report.dataStatus ? <StatusBadge status={report.dataStatus} /> : null}
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">Overview</p>
        <dl className="grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-zinc-600">Industry</dt>
            <dd className="mt-0.5 text-zinc-300">{report.overview.industry}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-zinc-600">Country</dt>
            <dd className="mt-0.5 text-zinc-300">{report.overview.country}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-zinc-600">Founded</dt>
            <dd className="mt-0.5 text-zinc-300">{report.overview.founded}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wider text-zinc-600">Website</dt>
            <dd className="mt-0.5 text-zinc-300">
              {report.overview.website ? (
                <a href={report.overview.website} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                  {report.overview.website}
                </a>
              ) : (
                "No verified data available."
              )}
            </dd>
          </div>
        </dl>
      </div>

      <div className="space-y-3 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">Evidence</p>
        <p className="text-sm text-zinc-400">
          {report.evidence.connectedSources} of {report.evidence.totalSources} official sources
          connected · {report.evidence.connectedIndicators} indicators connected ·{" "}
          {report.evidence.openQuestions} open questions.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-wider text-zinc-600">Connected Evidence</p>
            <NameList names={report.evidence.connectedSourceNames} emptyLabel="No official sources connected yet." />
          </div>
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-wider text-zinc-600">Missing Evidence</p>
            <NameList names={report.evidence.missingSourceNames} emptyLabel="No missing sources — every tracked source is connected." />
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-800/80 pt-4">
        <EntityFutureSources domainIds={report.futureDomainIds} />
      </div>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">Research</p>
        {report.research.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {report.research.map((match) => (
              <li key={match.topic.topicId}>
                <Link
                  href={getResearchTopicPath(match.topic.topicId)}
                  className="rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-xs text-zinc-400 hover:text-cyan-300"
                >
                  {match.topic.topicName}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-zinc-500">No verified data available.</p>
        )}
      </div>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">Country</p>
        {report.country ? (
          <Link href={report.country.href} className="text-sm text-cyan-400 hover:underline">
            {report.country.name} →
          </Link>
        ) : (
          <p className="text-sm text-zinc-500">No verified data available.</p>
        )}
      </div>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">Methodology</p>
        <ul className="space-y-1.5">
          {report.methodology.map((point) => (
            <li key={point.id} className="text-sm text-zinc-400">
              <span className="font-medium text-zinc-300">{point.title}.</span> {point.description}
            </li>
          ))}
        </ul>
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
