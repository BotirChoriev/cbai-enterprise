import type { ObservabilityHealthStatus } from "@/lib/intelligence/observability/types";
import type { RuntimeWorkerState } from "@/lib/intelligence/runtime/worker/types";

/** Activity feed item kinds derived from runtime foundations. */
export type RuntimeActivityKind = "session" | "task" | "queue" | "scheduler";

/** Single runtime activity entry for the dashboard feed. */
export interface RuntimeActivityItem {
  /** Stable activity identifier. */
  id: string;
  /** Source subsystem. */
  kind: RuntimeActivityKind;
  /** Short action label. */
  action: string;
  /** Target reference (request id, task title, etc.). */
  target: string;
  /** ISO-8601 event timestamp. */
  timestamp: string;
}

/** Platform status section. */
export interface RuntimeDashboardPlatformStatus {
  health: ObservabilityHealthStatus;
  warningsCount: number;
  blockingIssuesCount: number;
  recommendedNextAction: string;
}

/** Session registry metrics. */
export interface RuntimeDashboardRuntimeMetrics {
  total: number;
  active: number;
  completed: number;
  failed: number;
}

/** Queue metrics. */
export interface RuntimeDashboardQueueMetrics {
  total: number;
  pending: number;
  running: number;
  completed: number;
  failed: number;
}

/** Scheduler metrics. */
export interface RuntimeDashboardSchedulerMetrics {
  scheduled: number;
  readyCount: number;
  cancelled: number;
  expired: number;
}

/** Agent task store metrics. */
export interface RuntimeDashboardAgentMetrics {
  total: number;
  active: number;
  completed: number;
  failed: number;
  localAdapterAvailable: boolean;
}

/** Worker snapshot metrics. */
export interface RuntimeDashboardWorkerMetrics {
  workerState: RuntimeWorkerState;
  processedItems: number;
  lastTick: string | null;
}

/** Test harness catalog summary (static — suite not run on page load). */
export interface RuntimeDashboardHarnessSummary {
  harnessVersion: string;
  scenarioCount: number;
}

/** System summary replacing legacy token usage chart. */
export interface RuntimeDashboardSystemSummary {
  observabilityVersion: string;
  workerState: RuntimeWorkerState;
  localAdapterStatus: string;
  dispatchReadyCount: number;
  queuedTaskCount: number;
  harnessScenarioCount: number;
}

/** Full runtime dashboard view model (BUILD-061). */
export interface RuntimeDashboardData {
  collectedAt: string;
  hasActivity: boolean;
  platform: RuntimeDashboardPlatformStatus;
  runtime: RuntimeDashboardRuntimeMetrics;
  queue: RuntimeDashboardQueueMetrics;
  scheduler: RuntimeDashboardSchedulerMetrics;
  agents: RuntimeDashboardAgentMetrics;
  worker: RuntimeDashboardWorkerMetrics;
  harness: RuntimeDashboardHarnessSummary;
  systemSummary: RuntimeDashboardSystemSummary;
  activities: readonly RuntimeActivityItem[];
}
