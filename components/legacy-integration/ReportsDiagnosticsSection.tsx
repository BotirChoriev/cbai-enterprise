import type { LegacyBuildIntegrationModel } from "@/lib/legacy-build-integration";

type ReportsDiagnosticsSectionProps = {
  diagnostics: LegacyBuildIntegrationModel["diagnostics"];
};

export default function ReportsDiagnosticsSection({
  diagnostics,
}: ReportsDiagnosticsSectionProps) {
  return (
    <section className="space-y-4" aria-labelledby="reports-diagnostics-heading">
      <div>
        <h3
          id="reports-diagnostics-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Diagnostics Posture
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          BUILD-038 run diagnostics — {diagnostics.runActivityLabel.toLowerCase()}.
        </p>
      </div>

      <div className="rounded-xl border border-dashed border-zinc-800 bg-zinc-950/50 px-5 py-4 text-sm text-zinc-500">
        Graph, memory, and document adapters:{" "}
        <span className="text-zinc-400">{diagnostics.graphStatus}</span>
      </div>
    </section>
  );
}
