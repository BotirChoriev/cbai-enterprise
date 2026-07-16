import Link from "next/link";
import type { LegacyBuildIntegrationModel } from "@/lib/legacy-build-integration";

type CoreLegacyIntegrationPanelProps = {
  model: LegacyBuildIntegrationModel;
};

export default function CoreLegacyIntegrationPanel({
  model,
}: CoreLegacyIntegrationPanelProps) {
  return (
    <section className="space-y-4" aria-labelledby="core-legacy-integration-heading">
      <div>
        <h2
          id="core-legacy-integration-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Legacy Build Integration
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          {model.buildRange.label} ({model.buildRange.from}–{model.buildRange.to}) — read-only
          status from intelligence foundations.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <StatusCard label="Observability" value={model.observability.health} />
        <StatusCard label="Session registry" value={model.sessionRegistry.statusLabel} />
        <StatusCard label="Worker" value={model.worker.statusLabel} />
        <StatusCard label="Agent tasks" value={model.agentTaskStore.statusLabel} />
        <StatusCard label="Local adapter" value={model.localAdapter.statusLabel} />
        <StatusCard label="Policy engine" value={model.policy.statusLabel} />
      </div>

      <p className="text-sm text-zinc-500">
        Live runtime observability is available on{" "}
        <Link href="/dashboard" className="text-teal-400 underline-offset-2 hover:underline">
          System Monitor
        </Link>
        . Governance policy and harness metadata on{" "}
        <Link href="/ai-control" className="text-teal-400 underline-offset-2 hover:underline">
          Governance Control
        </Link>
        .
      </p>
    </section>
  );
}

function StatusCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-4 py-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-1 text-sm text-zinc-300">{value}</p>
    </div>
  );
}
