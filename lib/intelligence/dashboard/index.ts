/**
 * CBAI Intelligence — Runtime Dashboard Data (BUILD-061).
 *
 * Collects live observability and runtime foundation state for the platform dashboard.
 */

export {
  collectRuntimeDashboardData,
} from "@/lib/intelligence/dashboard/collect-runtime-dashboard";

export {
  buildRuntimeActivityFeed,
  hasRuntimeFoundationActivity,
} from "@/lib/intelligence/dashboard/build-runtime-activity";

export type {
  RuntimeActivityItem,
  RuntimeActivityKind,
  RuntimeDashboardAgentMetrics,
  RuntimeDashboardData,
  RuntimeDashboardHarnessSummary,
  RuntimeDashboardPlatformStatus,
  RuntimeDashboardQueueMetrics,
  RuntimeDashboardRuntimeMetrics,
  RuntimeDashboardSchedulerMetrics,
  RuntimeDashboardSystemSummary,
  RuntimeDashboardWorkerMetrics,
} from "@/lib/intelligence/dashboard/types";
