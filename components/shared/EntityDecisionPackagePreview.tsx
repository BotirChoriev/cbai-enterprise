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

const USER_HEADINGS: Record<string, string> = {
  "Evidence Currently Available": "Available now",
  "Evidence Currently Missing": "Missing",
  "Official Sources": "Sources connected",
  "Evidence Limitations": "Limitations",
  "Human Review Required": "Review required",
};

function userHeading(section: DecisionSummarySection): string {
  return USER_HEADINGS[section.heading] ?? section.heading;
}

function userReadinessLabel(label: string): string {
  return label.replace(/readiness/gi, "evidence status").replace(/Ready/gi, "Available");
}

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
    <section id="decision-package" className="scroll-mt-6 space-y-4" aria-labelledby="decision-package-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 id="decision-package-heading" className="text-base font-semibold text-zinc-200">
            Decision package
          </h3>
          <p className="mt-1 text-sm text-zinc-500">
            {summary.title} · {userReadinessLabel(summary.readinessLabel)}
          </p>
        </div>
        <a
          href="#reports"
          className="inline-flex min-h-10 w-full items-center justify-center rounded-lg border border-zinc-700 bg-zinc-900 px-4 text-sm font-medium text-cyan-400 transition-colors hover:border-zinc-600 hover:bg-zinc-800 sm:w-auto"
        >
          Next: Reports →
        </a>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <DecisionSection key={section.id} section={section} />
        ))}
      </div>
    </section>
  );
}

function DecisionSection({ section }: { section: DecisionSummarySection }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-4 sm:px-5">
      <h4 className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        {userHeading(section)}
      </h4>
      <ul className="mt-3 space-y-2">
        {section.content.map((line) => (
          <li key={line} className="text-sm leading-relaxed text-zinc-400">
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
    <section id="reports" className="scroll-mt-6 space-y-4" aria-labelledby="reports-heading">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 id="reports-heading" className="text-base font-semibold text-zinc-200">
            Reports
          </h3>
          <p className="mt-1 text-sm text-zinc-500">What you can open for this profile today.</p>
        </div>
        <Link
          href="/analytics"
          className="inline-flex min-h-10 w-full shrink-0 items-center justify-center rounded-lg bg-zinc-100 px-4 text-sm font-semibold text-zinc-900 transition-colors hover:bg-white sm:w-auto"
        >
          View report readiness →
        </Link>
      </div>

      <ul className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-950">
        {reports.map((report) => (
          <li key={report.id} className="px-4 py-4 sm:px-5">
            <p className="text-sm font-medium text-zinc-200">{report.title}</p>
            <p className="mt-1 text-xs text-zinc-500">{report.description}</p>
            <p className="mt-2 text-xs text-zinc-600">Available now: {report.availableToday}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
