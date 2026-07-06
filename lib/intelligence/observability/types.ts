import type { AgentTaskStoreSnapshot } from "@/lib/intelligence/agents/tasks/store/types";
import type { SessionRegistrySnapshot } from "@/lib/intelligence/runtime/registry/types";
import type { RuntimeQueueSnapshot } from "@/lib/intelligence/runtime/queue/types";
import type { RuntimeSchedulerSnapshot } from "@/lib/intelligence/runtime/scheduler/types";
import type { PolicyDecisionType } from "@/lib/intelligence/runtime/policy/types";

/** Semantic version of the runtime observability foundation. */
export const RUNTIME_OBSERVABILITY_VERSION = "0.1.0-runtime-observability";

/** Unified observability health classification (BUILD-058). */
export type ObservabilityHealthStatus = "healthy" | "degraded" | "blocked";

/** Component-level runtime health classification. */
export type RuntimeComponentHealth = ObservabilityHealthStatus;

/**
 * Optional policy decision summary for observability (BUILD-058).
 */
export interface PolicyDecisionSummary {
  /** Policy decision outcome. */
  decision: PolicyDecisionType;
  /** Rule identifier that produced the decision. */
  policyName: string;
  /** Deterministic decision reason. */
  reason: string;
  /** Whether the decision blocks further execution. */
  blocking: boolean;
}

/**
 * Agent dispatch readiness summary derived from task store state.
 */
export interface DispatchReadinessSummary {
  /** Total tasks in the store. */
  totalTasks: number;
  /** Tasks marked dispatch-ready. */
  dispatchReadyCount: number;
  /** Active tasks not yet dispatch-ready. */
  pendingDispatchCount: number;
}

/**
 * Agent execution readiness summary derived from task store state.
 */
export interface ExecutionReadinessSummary {
  /** Tasks in queued lifecycle status. */
  queuedTaskCount: number;
  /** Queued tasks also marked dispatch-ready. */
  executionCandidateCount: number;
}

/**
 * Runtime layer metrics snapshot (BUILD-058).
 */
export interface RuntimeMetrics {
  /** Session registry snapshot. */
  sessionRegistry: SessionRegistrySnapshot;
  /** Runtime queue snapshot. */
  queue: RuntimeQueueSnapshot;
  /** Runtime scheduler snapshot. */
  scheduler: RuntimeSchedulerSnapshot;
  /** Optional policy decision summary when supplied by caller. */
  policyDecision?: PolicyDecisionSummary;
  /** Derived runtime component health. */
  runtimeHealth: RuntimeComponentHealth;
}

/**
 * Agent layer metrics snapshot (BUILD-058).
 */
export interface AgentMetrics {
  /** Agent task store snapshot. */
  taskStore: AgentTaskStoreSnapshot;
  /** Dispatch readiness summary. */
  dispatchReadiness: DispatchReadinessSummary;
  /** Execution readiness summary. */
  executionReadiness: ExecutionReadinessSummary;
  /** Whether the local runtime adapter reports healthy. */
  localAdapterAvailable: boolean;
}

/**
 * Unified health summary for observability consumers.
 */
export interface HealthSummary {
  /** Overall observability health status. */
  status: ObservabilityHealthStatus;
  /** Non-blocking warnings. */
  warnings: readonly string[];
  /** Blocking issues requiring attention. */
  blockingIssues: readonly string[];
  /** Deterministic recommended next action. */
  recommendedNextAction: string;
}

/**
 * Full observability snapshot returned by collect().
 */
export interface ObservabilitySnapshot {
  /** ISO-8601 timestamp when observability was collected. */
  collectedAt: string;
  /** Observability semantic version. */
  observabilityVersion: string;
  /** Runtime layer metrics. */
  runtime: RuntimeMetrics;
  /** Agent layer metrics. */
  agent: AgentMetrics;
  /** Unified health summary. */
  health: HealthSummary;
}

/**
 * Input for observability collection.
 */
export interface ObservabilityCollectInput {
  /** Evaluation timestamp for scheduler ready counts. */
  evaluatedAt?: string;
  /** Optional last policy decision from an orchestrated run. */
  lastPolicyDecision?: import("@/lib/intelligence/runtime/policy/types").PolicyDecision;
}
