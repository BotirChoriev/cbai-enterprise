import {
  ENTERPRISE_REPORT_ARCHITECTURE,
  enterpriseReportStatusClass,
} from "@/lib/enterprise/report-architecture";
import { cbaiGlassCard, cbaiSectionEyebrow } from "@/components/brand/brand-classes";
import Link from "next/link";

/** Enterprise report family architecture — Executive, Government, Investor, Academic, Risk, Evidence. */
export default function EnterpriseReportArchitecture() {
  return (
    <section className="space-y-4" aria-labelledby="enterprise-report-architecture-heading">
      <div>
        <p className={cbaiSectionEyebrow}>Enterprise reports</p>
        <h2
          id="enterprise-report-architecture-heading"
          className="mt-1 text-lg font-semibold text-zinc-50"
        >
          Report architecture
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Named report families prepared for production. Availability reflects real source readiness —
          content is never invented.
        </p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {ENTERPRISE_REPORT_ARCHITECTURE.map((report) => (
          <article key={report.id} className={`${cbaiGlassCard} flex h-full flex-col p-5`}>
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-zinc-100">{report.title}</h3>
              <span
                className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${enterpriseReportStatusClass(report.status)}`}
              >
                {report.status}
              </span>
            </div>
            <p className="mt-1 text-[10px] uppercase tracking-wider text-zinc-600">{report.audience}</p>
            <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-400">{report.purpose}</p>
            <p className="mt-3 text-xs text-zinc-600">
              Required evidence: {report.requiredEvidence}
            </p>
            {report.relatedRoute ? (
              <Link
                href={report.relatedRoute}
                className="mt-4 inline-flex min-h-9 items-center text-sm font-medium text-teal-400 hover:text-teal-300"
              >
                Open related module →
              </Link>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
