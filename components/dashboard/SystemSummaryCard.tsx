import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import type { RuntimeDashboardSystemSummary } from "@/lib/intelligence/dashboard/types";

type SystemSummaryCardProps = {
  summary: RuntimeDashboardSystemSummary;
  hasActivity: boolean;
  harnessVersion: string;
};

export default function SystemSummaryCard({
  summary,
  hasActivity,
  harnessVersion,
}: SystemSummaryCardProps) {
  return (
    <Card className="lg:col-span-3">
      <CardHeader
        title="System Summary"
        description="Live runtime foundation overview"
      />
      <CardContent>
        {!hasActivity ? (
          <div className="flex h-64 items-center justify-center rounded-lg border border-dashed border-zinc-800 bg-zinc-950/50">
            <p className="text-sm text-zinc-500">No runtime activity yet</p>
          </div>
        ) : (
          <dl className="grid gap-4 sm:grid-cols-2">
            <SummaryRow
              label="Observability Version"
              value={summary.observabilityVersion}
            />
            <SummaryRow label="Worker State" value={summary.workerState} />
            <SummaryRow
              label="Local Runtime Adapter"
              value={summary.localAdapterStatus}
            />
            <SummaryRow
              label="Dispatch Ready Tasks"
              value={String(summary.dispatchReadyCount)}
            />
            <SummaryRow
              label="Queued Tasks"
              value={String(summary.queuedTaskCount)}
            />
            <SummaryRow
              label="Test Harness Scenarios"
              value={`${summary.harnessScenarioCount} (${harnessVersion})`}
            />
          </dl>
        )}
      </CardContent>
    </Card>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3">
      <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">
        {label}
      </dt>
      <dd className="mt-1 font-mono text-sm text-zinc-200">{value}</dd>
    </div>
  );
}
