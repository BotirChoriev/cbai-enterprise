import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import type { RuntimeDashboardPlatformStatus } from "@/lib/intelligence/dashboard/types";
import type { ObservabilityHealthStatus } from "@/lib/intelligence/observability/types";

const healthStyles: Record<
  ObservabilityHealthStatus,
  { dot: string; label: string; text: string }
> = {
  healthy: {
    dot: "bg-emerald-400",
    label: "Healthy",
    text: "text-emerald-400",
  },
  degraded: {
    dot: "bg-amber-400",
    label: "Degraded",
    text: "text-amber-400",
  },
  blocked: {
    dot: "bg-red-400",
    label: "Blocked",
    text: "text-red-400",
  },
};

type PlatformStatusCardProps = {
  platform: RuntimeDashboardPlatformStatus;
  collectedAt: string;
};

export default function PlatformStatusCard({
  platform,
  collectedAt,
}: PlatformStatusCardProps) {
  const style = healthStyles[platform.health];

  return (
    <Card>
      <CardHeader
        title="Platform Status"
        description="Live runtime health from ObservabilityService"
      />
      <CardContent>
        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-2">
            <span className={`inline-flex h-2.5 w-2.5 rounded-full ${style.dot}`} />
            <span className="text-sm font-medium text-zinc-200">
              Runtime Health:{" "}
              <span className={style.text}>{style.label}</span>
            </span>
          </div>
          <div className="h-4 w-px bg-zinc-800" />
          <div className="text-sm text-zinc-400">
            Warnings:{" "}
            <span className="font-medium text-zinc-200">
              {platform.warningsCount}
            </span>
          </div>
          <div className="h-4 w-px bg-zinc-800" />
          <div className="text-sm text-zinc-400">
            Blocking issues:{" "}
            <span className="font-medium text-zinc-200">
              {platform.blockingIssuesCount}
            </span>
          </div>
          <div className="h-4 w-px bg-zinc-800" />
          <div className="text-sm text-zinc-400">
            Collected:{" "}
            <span className="font-medium text-zinc-200">{collectedAt}</span>
          </div>
        </div>
        <p className="mt-4 text-sm text-zinc-500">
          {platform.recommendedNextAction}
        </p>
      </CardContent>
    </Card>
  );
}
