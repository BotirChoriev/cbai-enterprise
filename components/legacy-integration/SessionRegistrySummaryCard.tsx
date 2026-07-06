import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import type { LegacySessionRegistrySummary } from "@/lib/legacy-build-integration";

type SessionRegistrySummaryCardProps = {
  summary: LegacySessionRegistrySummary;
};

export default function SessionRegistrySummaryCard({
  summary,
}: SessionRegistrySummaryCardProps) {
  return (
    <Card>
      <CardHeader
        title="Session Registry"
        description="Runtime session registry summary (BUILD-045 / BUILD-058)"
      />
      <CardContent>
        <p className="mb-4 text-sm text-zinc-500">{summary.statusLabel}</p>
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Total" value={summary.total} />
          <Metric label="Active" value={summary.active} />
          <Metric label="Completed" value={summary.completed} />
          <Metric label="Failed" value={summary.failed} />
        </dl>
      </CardContent>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-4 py-3">
      <dt className="text-xs font-medium uppercase tracking-wider text-zinc-500">{label}</dt>
      <dd className="mt-1 font-mono text-sm text-zinc-200">{value}</dd>
    </div>
  );
}
