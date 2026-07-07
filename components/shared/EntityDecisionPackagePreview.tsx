import Link from "next/link";
import type { DecisionSummary, DecisionSummarySection } from "@/lib/decision-intelligence";
import type { ReportTypeDefinition } from "@/lib/reports-center";

const DECISION_SECTION_IDS = new Set([
  "evidence-available",
  "evidence-missing",
  "official-sources",
  "limitations",
  "human-review",
]);

const SECTION_LABELS: Record<string, string> = {
  "evidence-available": "Available",
  "evidence-missing": "Missing",
  "official-sources": "Sources",
  limitations: "Limitations",
  "human-review": "Review required",
};

const MAX_LINES = 4;

type EntityDecisionPackagePreviewProps = {
  summary: DecisionSummary | null;
};

export default function EntityDecisionPackagePreview({
  summary,
}: EntityDecisionPackagePreviewProps) {
  if (!summary) return null;

  const sections = summary.sections.filter((section) =>
    DECISION_SECTION_IDS.has(section.id),
  );

  if (sections.length === 0) return null;

  return (
    <section
      id="decision-package"
      className="scroll-mt-6 space-y-3"
      aria-labelledby="decision-package-heading"
    >
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h3 id="decision-package-heading" className="text-base font-semibold text-zinc-200">
          Decision package
        </h3>
        <a
          href="#reports"
          className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium text-cyan-400 transition-colors hover:border-zinc-600 sm:w-auto"
        >
          Reports →
        </a>
      </div>

      <div className="space-y-3">
        {sections.map((section) => (
          <DecisionSection key={section.id} section={section} />
        ))}
      </div>
    </section>
  );
}

function DecisionSection({ section }: { section: DecisionSummarySection }) {
  const lines = section.content.slice(0, MAX_LINES);
  const hidden = section.content.length - lines.length;

  return (
    <div className="rounded-lg bg-zinc-900/50 px-4 py-3">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {SECTION_LABELS[section.id] ?? section.heading}
      </h4>
      <ul className="mt-2 space-y-1">
        {lines.map((line) => (
          <li key={line} className="text-sm text-zinc-400">
            {line}
          </li>
        ))}
      </ul>
      {hidden > 0 ? (
        <p className="mt-2 text-xs text-zinc-600">+ {hidden} more item{hidden === 1 ? "" : "s"}</p>
      ) : null}
    </div>
  );
}

type EntityReportsAvailableProps = {
  reports: readonly ReportTypeDefinition[];
};

export function EntityReportsAvailable({ reports }: EntityReportsAvailableProps) {
  if (reports.length === 0) return null;

  return (
    <section id="reports" className="scroll-mt-6 space-y-3" aria-labelledby="reports-heading">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 id="reports-heading" className="text-base font-semibold text-zinc-200">
            Reports
          </h3>
          <p className="mt-0.5 text-sm text-zinc-500">Report types you can open today.</p>
        </div>
        <Link
          href="/analytics"
          className="inline-flex min-h-10 w-full shrink-0 items-center justify-center rounded-lg bg-zinc-100 px-4 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white sm:w-auto"
        >
          Open reports →
        </Link>
      </div>

      <ul className="divide-y divide-zinc-800/80 rounded-lg bg-zinc-900/50">
        {reports.map((report) => (
          <li key={report.id} className="px-4 py-3">
            <p className="text-sm font-medium text-zinc-200">{report.title}</p>
            <p className="mt-0.5 text-xs text-zinc-500">{report.description}</p>
            <p className="mt-1 text-xs text-zinc-600">{report.availableToday}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
