import type { LegacyDiagnosticsPosture } from "@/lib/legacy-build-integration";

type ReasoningDiagnosticsSectionProps = {
  diagnostics: LegacyDiagnosticsPosture;
};

export default function ReasoningDiagnosticsSection({
  diagnostics,
}: ReasoningDiagnosticsSectionProps) {
  const rows = [
    { label: "Graph context", value: diagnostics.graphStatus },
    { label: "Memory context", value: diagnostics.memoryStatus },
    { label: "Document evidence", value: diagnostics.documentStatus },
    { label: "Run activity", value: diagnostics.runActivityLabel },
  ];

  return (
    <section className="space-y-4" aria-labelledby="reasoning-diagnostics-heading">
      <div>
        <h3
          id="reasoning-diagnostics-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Run Diagnostics Posture
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          BUILD-038 diagnostics builder v{diagnostics.builderVersion} — factual backend connection
          status only.
        </p>
      </div>

      <ul className="divide-y divide-zinc-800 rounded-xl border border-zinc-800 bg-zinc-950">
        {rows.map((row) => (
          <li
            key={row.label}
            className="flex flex-col gap-1 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <span className="text-sm text-zinc-300">{row.label}</span>
            <span className="text-sm text-zinc-500">{row.value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
