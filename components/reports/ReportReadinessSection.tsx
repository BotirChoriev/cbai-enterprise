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
      <h2 id="report-readiness-heading" className="text-base font-semibold text-zinc-200">
        Report types
      </h2>

      <div className="space-y-4">
        {reportTypes.map((report) => (
          <div
            key={report.id}
            className="rounded-xl border border-zinc-800 bg-zinc-950 p-4 sm:p-5"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold text-zinc-100">{report.title}</h3>
                <p className="mt-1 text-sm text-zinc-400">{report.description}</p>
              </div>
              <StatusBadge label={report.availableToday} />
            </div>

            <dl className="mt-4 space-y-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wider text-zinc-600">
                  Evidence required
                </dt>
                <dd className="mt-1 text-zinc-400">{report.evidenceRequired}</dd>
              </div>
              {report.relatedRoute ? (
                <div>
                  <Link
                    href={report.relatedRoute}
                    className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium text-cyan-400 transition-colors hover:border-zinc-600 hover:bg-zinc-800 sm:w-auto"
                  >
                    Open related profile →
                  </Link>
                </div>
              ) : null}
            </dl>
          </div>
        ))}
      </div>
    </section>
  );
}
