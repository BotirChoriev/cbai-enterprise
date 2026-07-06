import type { OrchestratorExecutionContext } from "@/lib/intelligence/orchestrator/execution-context";
import type { OrchestratorPolicies } from "@/lib/intelligence/orchestrator/policies";
import type { RuntimeState } from "@/lib/intelligence/runtime/runtime.types";
import type { IntelligenceResult } from "@/lib/intelligence/result.types";

/** Orchestrator stage identifiers (BUILD-040). */
export type OrchestratorStageId =
  | "request"
  | "evidence"
  | "quality"
  | "contradictions"
  | "confidence"
  | "trust"
  | "graph"
  | "memory"
  | "trace"
  | "result"
  | "diagnostics";

/** Execution status for an orchestrator stage. */
export type OrchestratorStageStatus =
  | "pending"
  | "running"
  | "complete"
  | "failed"
  | "skipped"
  | "stopped";

/** Overall orchestrator run outcome. */
export type OrchestratorRunOutcome = "complete" | "stopped" | "failed";

/**
 * A single stage entry in an {@link ExecutionPlan}.
 */
export interface ExecutionPlanStage {
  /** Stage identifier. */
  id: OrchestratorStageId;
  /** Human-readable stage name. */
  name: string;
  /** Whether this stage is scheduled to run. */
  enabled: boolean;
  /** Whether failure of this stage halts the run when stopOnCriticalFailure is true. */
  required: boolean;
  /** Current execution status — updated during orchestration. */
  status: OrchestratorStageStatus;
}

/**
 * Deterministic execution plan for an intelligence run (BUILD-040).
 */
export interface ExecutionPlan {
  /** Ordered stage definitions. */
  stages: ExecutionPlanStage[];
  /** Policies governing this run. */
  policies: OrchestratorPolicies;
}

/**
 * Orchestration summary exposed after a run — no business intelligence.
 */
export interface OrchestrationSummary {
  /** Unique run identifier. */
  runId: string;
  /** Overall orchestration outcome. */
  outcome: OrchestratorRunOutcome;
  /** Reason execution stopped early, when applicable. */
  stoppedReason?: string;
  /** Number of stages completed successfully. */
  stagesCompleted: number;
  /** Number of stages that failed. */
  stagesFailed: number;
  /** Number of stages skipped by policy or early stop. */
  stagesSkipped: number;
  /** Total wall-clock duration in milliseconds. */
  durationMs: number;
  /** Policies applied for this run. */
  policies: OrchestratorPolicies;
  /** Orchestrator semantic version. */
  orchestratorVersion: string;
  /** Last authoritative runtime policy decision (BUILD-051). */
  policyDecision?: import("@/lib/intelligence/runtime/policy/types").PolicyDecisionType;
  /** Policy rule name that produced the last decision. */
  policyName?: string;
  /** Human-readable reason for the last policy decision. */
  decisionReason?: string;
}

/**
 * Result of an orchestrator execution.
 */
export interface OrchestratorRunResult {
  /** Assembled intelligence result when result stage completed. */
  result: IntelligenceResult | null;
  /** Full execution context for audit and monitoring. */
  context: OrchestratorExecutionContext;
  /** Orchestration summary without business conclusions. */
  summary: OrchestrationSummary;
  /** Runtime state snapshot for this execution (BUILD-041). */
  runtime: RuntimeState;
}
