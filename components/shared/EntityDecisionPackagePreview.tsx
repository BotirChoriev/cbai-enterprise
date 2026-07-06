import type { DecisionSummary, DecisionSummarySection } from "@/lib/decision-intelligence";
import type { ReportTypeDefinition } from "@/lib/reports-center";

const PREVIEW_SECTION_IDS = new Set([
  "evidence-available",
  "evidence-missing",
  "official-sources",
  "methodology",
  "limitations",
  "human-review",
]);

type EntityDecisionPackagePreviewProps = {
  summary: DecisionSummary | null;
  templateSlug?: string;
};

export default function EntityDecisionPackagePreview({
  summary,
  templateSlug,
}: EntityDecisionPackagePreviewProps) {
  if (!summary) return null;

  const sections = summary.sections.filter((section) =>
    PREVIEW_SECTION_IDS.has(section.id),
  );

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
          {templateSlug ? ` · ${templateSlug}` : null}
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
      <div>
        <h3
          id="entity-reports-available-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Reports
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Report types available for this scope. Open Reports Center to browse all types.
        </p>
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
