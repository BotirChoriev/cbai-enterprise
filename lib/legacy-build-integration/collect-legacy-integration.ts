import { localRuntimeAdapter } from "@/lib/intelligence/agents/providers/local";
import { defaultObservabilityService } from "@/lib/intelligence/observability/observability-service";
import { defaultRuntimeWorker } from "@/lib/intelligence/runtime/worker/worker";
import { RUNTIME_POLICY_RULE_ORDER } from "@/lib/intelligence/runtime/policy/policy-rules";
import { RUNTIME_POLICY_ENGINE_VERSION } from "@/lib/intelligence/runtime/policy/types";
import { DIAGNOSTICS_BUILDER_VERSION } from "@/lib/intelligence/diagnostics";
import { hasRuntimeFoundationActivity } from "@/lib/intelligence/dashboard/build-runtime-activity";
import {
  INTELLIGENCE_TEST_HARNESS_VERSION,
  INTELLIGENCE_TEST_SCENARIO_COUNT,
} from "@/lib/intelligence/testing/scenario-meta";
import {
  LEGACY_BUILD_INTEGRATION_VERSION,
  type LegacyBuildIntegrationModel,
} from "@/lib/legacy-build-integration/integration-types";

function formatPolicyRuleLabel(ruleId: string): string {
  return ruleId
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

/**
 * Collect factual legacy build integration snapshot for Alpha platform routes.
 *
 * Reads in-memory intelligence singletons only — no fabricated metrics.
 */
export function collectLegacyBuildIntegrationModel(
  evaluatedAt: string = new Date().toISOString(),
): LegacyBuildIntegrationModel {
  const snapshot = defaultObservabilityService.collect({ evaluatedAt });
  const workerSnapshot = defaultRuntimeWorker.snapshot();
  const localHealth = localRuntimeAdapter.health();

  const hasRuntimeActivity = hasRuntimeFoundationActivity({
    sessionTotal: snapshot.runtime.sessionRegistry.total,
    queueTotal: snapshot.runtime.queue.total,
    schedulerTotal: snapshot.runtime.scheduler.total,
    taskTotal: snapshot.agent.taskStore.total,
    workerProcessedItems: workerSnapshot.processedItems,
  });

  const sessionTotal = snapshot.runtime.sessionRegistry.total;

  return {
    version: LEGACY_BUILD_INTEGRATION_VERSION,
    buildRange: {
      from: "BUILD-021",
      to: "BUILD-061",
      label: "Enterprise Alpha intelligence foundations",
    },
    collectedAt: snapshot.collectedAt,
    hasRuntimeActivity,
    observability: {
      version: snapshot.observabilityVersion,
      health: snapshot.health.status,
      warningsCount: snapshot.health.warnings.length,
      blockingIssuesCount: snapshot.health.blockingIssues.length,
      recommendedNextAction: snapshot.health.recommendedNextAction,
    },
    sessionRegistry: {
      total: sessionTotal,
      active: snapshot.runtime.sessionRegistry.active,
      completed: snapshot.runtime.sessionRegistry.completed,
      failed: snapshot.runtime.sessionRegistry.failed,
      statusLabel:
        sessionTotal === 0 ? "No runtime activity recorded" : "Session registry active",
    },
    worker: {
      workerState: workerSnapshot.workerState,
      processedItems: workerSnapshot.processedItems,
      lastTick: workerSnapshot.lastTick,
      statusLabel:
        workerSnapshot.processedItems === 0
          ? "No runtime activity recorded"
          : "Worker state available",
    },
    agentTaskStore: {
      total: snapshot.agent.taskStore.total,
      active: snapshot.agent.taskStore.active,
      completed: snapshot.agent.taskStore.completed,
      failed: snapshot.agent.taskStore.failed,
      statusLabel:
        snapshot.agent.taskStore.total === 0
          ? "No runtime activity recorded"
          : "Agent task store populated",
    },
    localAdapter: {
      available: snapshot.agent.localAdapterAvailable,
      statusLabel: localHealth.healthy ? "Deterministic local adapter" : "Not connected",
      description:
        "Local Runtime Adapter (BUILD-055) — deterministic placeholder execution only.",
    },
    policy: {
      engineVersion: RUNTIME_POLICY_ENGINE_VERSION,
      ruleCount: RUNTIME_POLICY_RULE_ORDER.length,
      rules: RUNTIME_POLICY_RULE_ORDER.map((ruleId) => ({
        ruleId,
        label: formatPolicyRuleLabel(ruleId),
      })),
      recentDecisions: [],
      statusLabel: hasRuntimeActivity
        ? "Policy engine available — evaluate per active session"
        : "No runtime activity recorded",
    },
    testHarness: {
      harnessVersion: INTELLIGENCE_TEST_HARNESS_VERSION,
      scenarioCount: INTELLIGENCE_TEST_SCENARIO_COUNT,
      statusLabel: "Harness catalog registered",
      executionLabel: "Not executed on page load",
    },
    diagnostics: {
      builderVersion: DIAGNOSTICS_BUILDER_VERSION,
      graphStatus: "Evidence Source Not Connected",
      memoryStatus: "Evidence Source Not Connected",
      documentStatus: "Evidence Source Not Connected",
      runActivityLabel: hasRuntimeActivity
        ? "Diagnostics available when intelligence runs execute"
        : "No runtime activity recorded",
    },
  };
}
