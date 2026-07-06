import type { LegacyTestHarnessSummary } from "@/lib/legacy-build-integration";

type GovernanceTestHarnessSectionProps = {
  harness: LegacyTestHarnessSummary;
};

export default function GovernanceTestHarnessSection({
  harness,
}: GovernanceTestHarnessSectionProps) {
  return (
    <section className="space-y-4" aria-labelledby="governance-test-harness-heading">
      <div>
        <h3
          id="governance-test-harness-heading"
          className="text-sm font-semibold uppercase tracking-wider text-zinc-500"
        >
          Intelligence Test Harness
        </h3>
        <p className="mt-1 text-sm text-zinc-500">
          BUILD-039 scenario catalog — metadata only on this route.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Harness version" value={harness.harnessVersion} />
        <Stat label="Scenarios" value={String(harness.scenarioCount)} />
        <Stat label="Catalog status" value={harness.statusLabel} />
        <Stat label="Page load" value={harness.executionLabel} />
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-4 py-3">
      <p className="text-[10px] font-medium uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-zinc-200">{value}</p>
    </div>
  );
}
