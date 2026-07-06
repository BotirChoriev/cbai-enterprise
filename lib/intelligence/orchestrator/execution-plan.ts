import type { IntelligenceRequest } from "@/lib/intelligence/request.types";
import {
  DEFAULT_ORCHESTRATOR_POLICIES,
  type OrchestratorPolicies,
} from "@/lib/intelligence/orchestrator/policies";
import type {
  ExecutionPlan,
  ExecutionPlanStage,
  OrchestratorStageId,
} from "@/lib/intelligence/orchestrator/types";

/** Canonical orchestrator stage order (BUILD-040). */
export const ORCHESTRATOR_STAGE_ORDER: OrchestratorStageId[] = [
  "request",
  "evidence",
  "quality",
  "contradictions",
  "confidence",
  "trust",
  "graph",
  "memory",
  "trace",
  "result",
  "diagnostics",
];

/** Human-readable orchestrator stage names. */
export const ORCHESTRATOR_STAGE_NAMES: Record<OrchestratorStageId, string> = {
  request: "Request",
  evidence: "Evidence",
  quality: "Quality",
  contradictions: "Contradictions",
  confidence: "Confidence",
  trust: "Trust",
  graph: "Graph",
  memory: "Memory",
  trace: "Trace",
  result: "Result",
  diagnostics: "Diagnostics",
};

/** Required stages that halt the run on failure when stopOnCriticalFailure is true. */
export const ORCHESTRATOR_REQUIRED_STAGES: ReadonlySet<OrchestratorStageId> = new Set([
  "request",
  "evidence",
  "quality",
  "contradictions",
  "confidence",
  "trust",
  "trace",
  "result",
]);

/**
 * Build a deterministic execution plan for an intelligence request.
 */
export function buildExecutionPlan(
  request: IntelligenceRequest,
  policies: OrchestratorPolicies = DEFAULT_ORCHESTRATOR_POLICIES,
): ExecutionPlan {
  void request;

  const stages: ExecutionPlanStage[] = ORCHESTRATOR_STAGE_ORDER.map((id) => ({
    id,
    name: ORCHESTRATOR_STAGE_NAMES[id],
    enabled: resolveStageEnabled(id, policies),
    required: ORCHESTRATOR_REQUIRED_STAGES.has(id),
    status: "pending",
  }));

  return {
    stages,
    policies: { ...policies },
  };
}

/**
 * Resolve whether a stage is enabled for this plan.
 */
export function resolveStageEnabled(
  stageId: OrchestratorStageId,
  policies: OrchestratorPolicies,
): boolean {
  if (stageId === "diagnostics") {
    return policies.runDiagnosticsAlways;
  }

  return true;
}

/**
 * Find the next enabled pending stage after the given stage id.
 */
export function findNextEnabledStage(
  plan: ExecutionPlan,
  afterStageId?: OrchestratorStageId,
): ExecutionPlanStage | undefined {
  const startIndex =
    afterStageId === undefined
      ? 0
      : plan.stages.findIndex((stage) => stage.id === afterStageId) + 1;

  return plan.stages.slice(Math.max(0, startIndex)).find(
    (stage) => stage.enabled && stage.status === "pending",
  );
}

/**
 * Returns true when all enabled stages have completed or been skipped.
 */
export function isExecutionPlanComplete(plan: ExecutionPlan): boolean {
  return plan.stages
    .filter((stage) => stage.enabled)
    .every(
      (stage) =>
        stage.status === "complete" ||
        stage.status === "skipped" ||
        stage.status === "stopped",
    );
}
