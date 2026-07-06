import type { ReactNode } from "react";
import StatCard from "@/components/ui/StatCard";
import type {
  RuntimeDashboardAgentMetrics,
  RuntimeDashboardQueueMetrics,
  RuntimeDashboardRuntimeMetrics,
  RuntimeDashboardSchedulerMetrics,
  RuntimeDashboardWorkerMetrics,
} from "@/lib/intelligence/dashboard/types";

type RuntimeMetricsGridProps = {
  runtime: RuntimeDashboardRuntimeMetrics;
  queue: RuntimeDashboardQueueMetrics;
  scheduler: RuntimeDashboardSchedulerMetrics;
  agents: RuntimeDashboardAgentMetrics;
  worker: RuntimeDashboardWorkerMetrics;
};

function MetricGroup({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-medium uppercase tracking-wider text-zinc-500">
        {title}
      </h2>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{children}</div>
    </section>
  );
}

export default function RuntimeMetricsGrid({
  runtime,
  queue,
  scheduler,
  agents,
  worker,
}: RuntimeMetricsGridProps) {
  return (
    <div className="space-y-8">
      <MetricGroup title="Runtime">
        <StatCard label="Sessions Total" value={runtime.total} />
        <StatCard label="Active Sessions" value={runtime.active} />
        <StatCard label="Completed Sessions" value={runtime.completed} />
        <StatCard label="Failed Sessions" value={runtime.failed} />
      </MetricGroup>

      <MetricGroup title="Queue">
        <StatCard label="Total Queue Items" value={queue.total} />
        <StatCard label="Pending" value={queue.pending} />
        <StatCard label="Running" value={queue.running} />
        <StatCard label="Completed" value={queue.completed} />
        <StatCard label="Failed" value={queue.failed} />
      </MetricGroup>

      <MetricGroup title="Scheduler">
        <StatCard label="Scheduled Items" value={scheduler.scheduled} />
        <StatCard label="Ready Count" value={scheduler.readyCount} />
        <StatCard label="Cancelled" value={scheduler.cancelled} />
        <StatCard label="Expired" value={scheduler.expired} />
      </MetricGroup>

      <MetricGroup title="Agents">
        <StatCard label="Task Total" value={agents.total} />
        <StatCard label="Active Tasks" value={agents.active} />
        <StatCard label="Completed" value={agents.completed} />
        <StatCard label="Failed" value={agents.failed} />
        <StatCard
          label="Local Adapter"
          value={agents.localAdapterAvailable ? "Available" : "Unavailable"}
        />
        <StatCard label="Worker State" value={worker.workerState} />
        <StatCard label="Worker Processed" value={worker.processedItems} />
      </MetricGroup>
    </div>
  );
}
