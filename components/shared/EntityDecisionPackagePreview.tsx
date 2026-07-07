import Link from "next/link";
import type { DecisionSummary, DecisionSummarySection } from "@/lib/decision-intelligence";
import type { ReportTypeDefinition } from "@/lib/reports-center";

/** Sections shown after dedicated Evidence / Missing Evidence blocks on entity profiles. */
const ENTITY_DECISION_SECTION_IDS = new Set([
  "official-sources",
  "methodology",
  "limitations",
  "human-review",
]);

type EntityDecisionPackagePreviewProps = {
  summary: DecisionSummary | null;
};

export default function EntityDecisionPackagePreview({
  summary,
}: EntityDecisionPackagePreviewProps) {
  if (!summary) return null;

  const sections = summary.sections.filter((section) =>
    ENTITY_DECISION_SECTION_IDS.has(section.id),
  );

  if (sections.length === 0) return null;

  return (
    <section className="space-y-6" aria-labelledby="entity-decision-package-heading">
      <div>
        <h3
          id="entity-decision-package-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Decision Package
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          {summary.title} · {summary.readinessLabel}
        </p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <DecisionSection key={section.id} section={section} />
        ))}
      </div>
    </section>
  );
}

function DecisionSection({ section }: { section: DecisionSummarySection }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-5 py-4">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {section.heading}
      </h4>
      <ul className="mt-3 space-y-2">
        {section.content.map((line) => (
          <li key={line} className="text-sm text-zinc-400">
            {line}
          </li>
        ))}
      </ul>
    </div>
  );
}

type EntityReportsAvailableProps = {
  reports: readonly ReportTypeDefinition[];
};

export function EntityReportsAvailable({ reports }: EntityReportsAvailableProps) {
  if (reports.length === 0) return null;

  return (
    <section className="space-y-4" aria-labelledby="entity-reports-available-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3
            id="entity-reports-available-heading"
            className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
          >
            Reports
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            Report types available for this scope today.
          </p>
        </div>
        <Link
          href="/analytics"
          className="inline-flex min-h-9 shrink-0 items-center rounded-lg border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium text-cyan-400 transition-colors hover:border-zinc-600 hover:bg-zinc-800"
        >
          Open Reports Center →
        </Link>
      </div>

      <ul className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-950">
        {reports.map((report) => (
          <li key={report.id} className="px-5 py-4">
            <p className="text-sm font-medium text-zinc-200">{report.title}</p>
            <p className="mt-1 text-xs text-zinc-500">{report.description}</p>
            <p className="mt-2 text-xs text-zinc-600">{report.availableToday}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
