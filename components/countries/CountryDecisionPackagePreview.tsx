import type { DecisionSummary, DecisionSummarySection } from "@/lib/decision-intelligence";
import type { ReportTypeDefinition } from "@/lib/reports-center";
import { COUNTRY_JOURNEY_DECISION_TEMPLATE } from "@/lib/country-user-journey";

const PREVIEW_SECTION_IDS = new Set([
  "evidence-available",
  "evidence-missing",
  "official-sources",
  "methodology",
  "limitations",
  "human-review",
]);

type CountryDecisionPackagePreviewProps = {
  summary: DecisionSummary | null;
  templateSlug?: string;
};

export default function CountryDecisionPackagePreview({
  summary,
  templateSlug = COUNTRY_JOURNEY_DECISION_TEMPLATE,
}: CountryDecisionPackagePreviewProps) {
  if (!summary) {
    return (
      <section className="space-y-4" aria-labelledby="country-decision-package-heading">
        <div>
          <h3
            id="country-decision-package-heading"
            className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
          >
            Decision Package Preview
          </h3>
          <p className="mt-1 text-sm text-zinc-500">Not connected</p>
        </div>
      </section>
    );
  }

  const sections = summary.sections.filter((section) =>
    PREVIEW_SECTION_IDS.has(section.id),
  );

  return (
    <section className="space-y-6" aria-labelledby="country-decision-package-heading">
      <div>
        <h3
          id="country-decision-package-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Decision Package Preview
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          {summary.title} · {summary.readinessLabel} · template {templateSlug}
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

type CountryReportsAvailableProps = {
  reports: readonly ReportTypeDefinition[];
};

export function CountryReportsAvailable({ reports }: CountryReportsAvailableProps) {
  return (
    <section className="space-y-4" aria-labelledby="country-reports-available-heading">
      <div>
        <h3
          id="country-reports-available-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Reports Available
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          Report types from Reports Center for country scope — export not available yet.
        </p>
      </div>

      <ul className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-950">
        {reports.map((report) => (
          <li key={report.id} className="px-5 py-4">
            <p className="text-sm font-medium text-zinc-200">{report.title}</p>
            <p className="mt-1 text-xs text-zinc-500">{report.description}</p>
            <p className="mt-2 text-xs text-zinc-600">
              {report.availableToday} · Export: {report.exportStatus}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}
