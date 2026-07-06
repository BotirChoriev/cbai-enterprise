import StatusBadge from "@/components/platform/home/StatusBadge";
import { Card, CardContent } from "@/components/ui/Card";
import { collectRuntimeDashboardData } from "@/lib/intelligence/dashboard";
import { PLATFORM_CAPABILITIES } from "@/lib/platform-home";

export default function HomePlatformStatus() {
  const runtime = collectRuntimeDashboardData();

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {PLATFORM_CAPABILITIES.map((capability) => (
          <Card key={capability.id}>
            <CardContent className="space-y-3 p-5">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-sm font-semibold text-zinc-100">
                  {capability.label}
                </h3>
                <StatusBadge status={capability.status} />
              </div>
              <p className="text-sm leading-relaxed text-zinc-500">
                {capability.detail}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="space-y-3 p-5">
          <h3 className="text-sm font-semibold text-zinc-100">
            Session runtime snapshot
          </h3>
          <p className="text-sm text-zinc-500">
            Real in-process observability for this session only — not production
            infrastructure or fabricated activity.
          </p>
          <dl className="mt-2 grid gap-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-zinc-600">Runtime health</dt>
              <dd className="mt-1 font-medium capitalize text-zinc-200">
                {runtime.platform.health}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-600">Worker state</dt>
              <dd className="mt-1 font-medium text-zinc-200">
                {runtime.worker.workerState}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-600">Active sessions</dt>
              <dd className="mt-1 font-medium text-zinc-200">
                {runtime.runtime.active}
              </dd>
            </div>
          </dl>
          {!runtime.hasActivity ? (
            <p className="text-sm text-zinc-600">No runtime activity in this session.</p>
          ) : (
            <p className="text-sm text-zinc-500">{runtime.platform.recommendedNextAction}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
