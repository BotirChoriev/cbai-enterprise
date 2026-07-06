import type { ReportTypeDefinition } from "@/lib/reports-center";
import { reportStatusClass } from "@/lib/reports-center";
import Link from "next/link";

type ReportReadinessSectionProps = {
  reportTypes: readonly ReportTypeDefinition[];
};

function StatusBadge({ label }: { label: string }) {
  return (
    <span
      className={`inline-block rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${reportStatusClass(label)}`}
    >
      {label}
    </span>
  );
}

export default function ReportReadinessSection({
  reportTypes,
}: ReportReadinessSectionProps) {
  return (
    <section className="space-y-4" aria-labelledby="report-readiness-heading">
      <div>
        <h2
          id="report-readiness-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Report Readiness
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Honest readiness status per report type — no generated output until evidence and
          methodology criteria are met.
        </p>
      </div>

      <div className="space-y-4">
        {reportTypes.map((report) => (
          <div
            key={report.id}
            className="rounded-xl border border-zinc-800 bg-zinc-950 p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-zinc-100">{report.title}</h3>
                <p className="mt-1 text-sm text-zinc-400">{report.description}</p>
                <p className="mt-1 text-xs text-zinc-600">Audience: {report.audience}</p>
                {report.relatedRoute && (
                  <Link
                    href={report.relatedRoute}
                    className="mt-2 inline-block text-xs text-cyan-400 underline-offset-2 hover:underline"
                  >
                    Related route
                  </Link>
                )}
              </div>
              <StatusBadge label={report.availableToday} />
            </div>

            <dl className="mt-4 grid gap-3 text-xs sm:grid-cols-2 lg:grid-cols-4">
              <div>
                <dt className="text-zinc-500">Evidence required</dt>
                <dd className="mt-1 text-zinc-400">{report.evidenceRequired}</dd>
              </div>
              <div>
                <dt className="text-zinc-500">Source status</dt>
                <dd className="mt-1">
                  <StatusBadge label={report.evidenceStatus} />
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Methodology status</dt>
                <dd className="mt-1">
                  <StatusBadge label={report.methodologyStatus} />
                </dd>
              </div>
              <div>
                <dt className="text-zinc-500">Export status</dt>
                <dd className="mt-1">
                  <StatusBadge label={report.exportStatus} />
                </dd>
              </div>
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}
