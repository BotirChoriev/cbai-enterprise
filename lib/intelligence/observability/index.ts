/**
 * CBAI Intelligence — Runtime Observability Layer (BUILD-058).
 *
 * Deterministic snapshots across runtime and agent foundations.
 * Not wired to UI or external telemetry.
 *
 * @see docs/build-058-report.md
 */

export {
  RUNTIME_OBSERVABILITY_VERSION,
  type AgentMetrics,
  type DispatchReadinessSummary,
  type ExecutionReadinessSummary,
  type HealthSummary,
  type ObservabilityCollectInput,
  type ObservabilityHealthStatus,
  type ObservabilitySnapshot,
  type PolicyDecisionSummary,
  type RuntimeComponentHealth,
  type RuntimeMetrics,
} from "@/lib/intelligence/observability/types";

export {
  buildPolicyDecisionSummary,
  collectRuntimeMetrics,
  deriveRuntimeComponentHealth,
} from "@/lib/intelligence/observability/runtime-metrics";

export {
  buildDispatchReadinessSummary,
  buildExecutionReadinessSummary,
  collectAgentMetrics,
  isLocalAdapterAvailable,
} from "@/lib/intelligence/observability/agent-metrics";

export {
  buildObservabilityBlockingIssues,
  buildObservabilityWarnings,
  collectHealthSummary,
  deriveObservabilityHealthStatus,
  resolveRecommendedNextAction,
} from "@/lib/intelligence/observability/health-summary";

export {
  DEFAULT_OBSERVABILITY_SERVICE_ID,
  DefaultObservabilityService,
  defaultObservabilityService,
  collectObservabilitySnapshot,
  type ObservabilityDependencies,
  type ObservabilityService,
} from "@/lib/intelligence/observability/observability-service";
