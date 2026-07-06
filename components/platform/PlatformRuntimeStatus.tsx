import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { collectRuntimeDashboardData } from "@/lib/intelligence/dashboard";

const healthLabels = {
  healthy: "Healthy",
  degraded: "Degraded",
  blocked: "Blocked",
} as const;

const healthColors = {
  healthy: "text-emerald-400",
  degraded: "text-amber-400",
  blocked: "text-red-400",
} as const;

export default function PlatformRuntimeStatus() {
  const data = collectRuntimeDashboardData();

  return (
    <Card>
      <CardHeader
        title="Runtime Snapshot"
        description="Live observability from the CBAI intelligence runtime"
      />
      <CardContent>
        <div className="flex flex-wrap items-center gap-6">
          <div className="text-sm text-zinc-400">
            Health:{" "}
            <span className={`font-medium ${healthColors[data.platform.health]}`}>
              {healthLabels[data.platform.health]}
            </span>
          </div>
          <div className="h-4 w-px bg-zinc-800" />
          <div className="text-sm text-zinc-400">
            Warnings:{" "}
            <span className="font-medium text-zinc-200">
              {data.platform.warningsCount}
            </span>
          </div>
          <div className="h-4 w-px bg-zinc-800" />
          <div className="text-sm text-zinc-400">
            Worker:{" "}
            <span className="font-medium text-zinc-200">
              {data.worker.workerState}
            </span>
          </div>
          <div className="h-4 w-px bg-zinc-800" />
          <div className="text-sm text-zinc-400">
            Harness:{" "}
            <span className="font-medium text-zinc-200">
              {data.harness.scenarioCount} scenarios
            </span>
          </div>
        </div>
        {!data.hasActivity ? (
          <p className="mt-4 text-sm text-zinc-500">No runtime activity yet</p>
        ) : (
          <p className="mt-4 text-sm text-zinc-500">
            {data.platform.recommendedNextAction}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
