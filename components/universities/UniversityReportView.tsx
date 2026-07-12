import Link from "next/link";
import type { UniversityReport, UniversityReportLink } from "@/lib/university-report";
import type { ProductStatus } from "@/lib/product-status";
import StatusBadge from "@/components/shared/StatusBadge";
import EntityFutureSources from "@/components/shared/EntityFutureSources";
import ReportPrintButton from "@/components/shared/ReportPrintButton";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";

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
              className="rounded-full border border-zinc-800 bg-zinc-900/60 px-2.5 py-1 text-xs text-zinc-400 hover:text-cyan-300"
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
  return (
    <section
      aria-labelledby="university-report-heading"
      className={`${cbaiGlassCard} cbai-print-area space-y-6 border-cyan-500/15 p-5 sm:p-6`}
    >
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <p className={cbaiSectionEyebrow}>University Intelligence Report</p>
          <h2 id="university-report-heading" className="mt-1 text-lg font-semibold text-zinc-100">
            {report.university.name}
          </h2>
          <p className="mt-1 text-xs text-zinc-600">Generated {new Date().toLocaleString()}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {report.dataStatus ? <StatusBadge status={report.dataStatus} /> : null}
          <ReportPrintButton />
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">Overview</p>
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
            <LinkList
              links={report.evidence.connectedSourceNames.map((name) => ({ name, href: null }))}
              emptyLabel="No official sources connected yet."
            />
          </div>
          <div>
            <p className="mb-1 text-[10px] uppercase tracking-wider text-zinc-600">Missing Evidence</p>
            <LinkList
              links={report.evidence.missingSourceNames.map((name) => ({ name, href: null }))}
              emptyLabel="No missing sources — every tracked source is connected."
            />
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-800/80 pt-4">
        <EntityFutureSources domainIds={report.futureDomainIds} />
      </div>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">Research</p>
        <p className="text-sm text-zinc-500">{report.research}</p>
      </div>

      <div className="space-y-2 border-t border-zinc-800/80 pt-4">
        <p className="text-xs font-medium uppercase tracking-wider text-zinc-600">Organizations</p>
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
            <p className="mb-1 text-[10px] uppercase tracking-wider text-zinc-600">Related companies</p>
            <LinkList links={report.relatedCompanies} emptyLabel="No related companies in the current catalog." />
          </div>
        </div>
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
