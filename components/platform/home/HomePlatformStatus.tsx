import StatusBadge from "@/components/platform/home/StatusBadge";
import { Card, CardContent } from "@/components/ui/Card";
import { collectRuntimeDashboardData } from "@/lib/intelligence/dashboard";
import { PLATFORM_CAPABILITIES } from "@/lib/platform-home";

export default function HomePlatformStatus() {
  const runtime = collectRuntimeDashboardData();

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PLATFORM_CAPABILITIES.map((capability) => (
          <Card key={capability.id}>
            <CardContent className="space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <h3 className="text-sm font-medium text-zinc-100">
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
        <CardContent className="space-y-2">
          <h3 className="text-sm font-medium text-zinc-100">
            Local runtime snapshot
          </h3>
          <p className="text-sm text-zinc-500">
            In-process observability only. Values reflect the current browser
            session — not production infrastructure.
          </p>
          <dl className="mt-3 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <dt className="text-zinc-500">Runtime health</dt>
              <dd className="font-medium capitalize text-zinc-200">
                {runtime.platform.health}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Worker state</dt>
              <dd className="font-medium text-zinc-200">
                {runtime.worker.workerState}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Active sessions</dt>
              <dd className="font-medium text-zinc-200">
                {runtime.runtime.active}
              </dd>
            </div>
            <div>
              <dt className="text-zinc-500">Test harness scenarios</dt>
              <dd className="font-medium text-zinc-200">
                {runtime.harness.scenarioCount}
              </dd>
            </div>
          </dl>
          {!runtime.hasActivity ? (
            <p className="text-sm text-zinc-600">No runtime activity in this session.</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
