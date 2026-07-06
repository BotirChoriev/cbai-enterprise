import { localRuntimeAdapter } from "@/lib/intelligence/agents/providers/local";
import {
  buildRuntimeActivityFeed,
  hasRuntimeFoundationActivity,
} from "@/lib/intelligence/dashboard/build-runtime-activity";
import type { RuntimeDashboardData } from "@/lib/intelligence/dashboard/types";
import { defaultObservabilityService } from "@/lib/intelligence/observability/observability-service";
import { defaultRuntimeWorker } from "@/lib/intelligence/runtime/worker/worker";
import {
  INTELLIGENCE_TEST_HARNESS_VERSION,
  INTELLIGENCE_TEST_SCENARIO_COUNT,
} from "@/lib/intelligence/testing/scenario-meta";

/**
 * Collect live runtime dashboard data from BUILD-060 intelligence foundations.
 *
 * Uses in-memory singletons only — no external APIs or browser storage.
 */
export function collectRuntimeDashboardData(
  evaluatedAt: string = new Date().toISOString(),
): RuntimeDashboardData {
  const snapshot = defaultObservabilityService.collect({ evaluatedAt });
  const workerSnapshot = defaultRuntimeWorker.snapshot();
  const localHealth = localRuntimeAdapter.health();
  const activities = buildRuntimeActivityFeed(10);

  const hasActivity = hasRuntimeFoundationActivity({
    sessionTotal: snapshot.runtime.sessionRegistry.total,
    queueTotal: snapshot.runtime.queue.total,
    schedulerTotal: snapshot.runtime.scheduler.total,
    taskTotal: snapshot.agent.taskStore.total,
    workerProcessedItems: workerSnapshot.processedItems,
  });

  return {
    collectedAt: snapshot.collectedAt,
    hasActivity,
    platform: {
      health: snapshot.health.status,
      warningsCount: snapshot.health.warnings.length,
      blockingIssuesCount: snapshot.health.blockingIssues.length,
      recommendedNextAction: snapshot.health.recommendedNextAction,
    },
    runtime: {
      total: snapshot.runtime.sessionRegistry.total,
      active: snapshot.runtime.sessionRegistry.active,
      completed: snapshot.runtime.sessionRegistry.completed,
      failed: snapshot.runtime.sessionRegistry.failed,
    },
    queue: {
      total: snapshot.runtime.queue.total,
      pending: snapshot.runtime.queue.pending,
      running: snapshot.runtime.queue.running,
      completed: snapshot.runtime.queue.completed,
      failed: snapshot.runtime.queue.failed,
    },
    scheduler: {
      scheduled: snapshot.runtime.scheduler.scheduled,
      readyCount: snapshot.runtime.scheduler.readyCount,
      cancelled: snapshot.runtime.scheduler.cancelled,
      expired: snapshot.runtime.scheduler.expired,
    },
    agents: {
      total: snapshot.agent.taskStore.total,
      active: snapshot.agent.taskStore.active,
      completed: snapshot.agent.taskStore.completed,
      failed: snapshot.agent.taskStore.failed,
      localAdapterAvailable: snapshot.agent.localAdapterAvailable,
    },
    worker: {
      workerState: workerSnapshot.workerState,
      processedItems: workerSnapshot.processedItems,
      lastTick: workerSnapshot.lastTick,
    },
    harness: {
      harnessVersion: INTELLIGENCE_TEST_HARNESS_VERSION,
      scenarioCount: INTELLIGENCE_TEST_SCENARIO_COUNT,
    },
    systemSummary: {
      observabilityVersion: snapshot.observabilityVersion,
      workerState: workerSnapshot.workerState,
      localAdapterStatus: localHealth.healthy ? "healthy" : "unavailable",
      dispatchReadyCount: snapshot.agent.dispatchReadiness.dispatchReadyCount,
      queuedTaskCount: snapshot.agent.executionReadiness.queuedTaskCount,
      harnessScenarioCount: INTELLIGENCE_TEST_SCENARIO_COUNT,
    },
    activities,
  };
}
