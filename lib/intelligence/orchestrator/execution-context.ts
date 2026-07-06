import type { ConfidenceAssessment } from "@/lib/intelligence/confidence.types";
import type { GraphContext, MemoryContext } from "@/lib/intelligence/context.types";
import type { IntelligenceRunDiagnostics } from "@/lib/intelligence/diagnostics/types";
import type { EvidenceCollection } from "@/lib/intelligence/evidence.types";
import type { ExecutionPlan, OrchestratorStageId } from "@/lib/intelligence/orchestrator/types";
import type { IntelligenceRequest } from "@/lib/intelligence/request.types";
import type { IntelligenceResult } from "@/lib/intelligence/result.types";
import type { StageTimelineEntry } from "@/lib/intelligence/trace/timeline";
import type { ReasoningTrace } from "@/lib/intelligence/trace.types";
import type { TrustAssessment } from "@/lib/intelligence/trust.types";

/** Runtime status of an orchestrator execution. */
export type OrchestratorExecutionStatus = "running" | "stopped" | "complete" | "failed";

/**
 * Mutable execution context tracked by the Intelligence Orchestrator (BUILD-040).
 */
export interface OrchestratorExecutionContext {
  /** Unique run identifier. */
  runId: string;
  /** Source request id. */
  requestId: string;
  /** ISO-8601 orchestration start timestamp. */
  startedAt: string;
  /** ISO-8601 orchestration finish timestamp. */
  finishedAt?: string;
  /** Current stage while running. */
  currentStage?: OrchestratorStageId;
  /** Stages completed successfully. */
  completedStages: OrchestratorStageId[];
  /** Stages that failed. */
  failedStages: OrchestratorStageId[];
  /** Stages skipped by policy or early stop. */
  skippedStages: OrchestratorStageId[];
  /** Non-blocking warnings collected during orchestration. */
  warnings: string[];
  /** Blocking issues collected during orchestration. */
  blockingIssues: string[];
  /** Reason execution stopped early. */
  stoppedReason?: string;
  /** Overall execution status. */
  status: OrchestratorExecutionStatus;
  /** Active execution plan — stage statuses updated in place. */
  plan: ExecutionPlan;
  /** Pipeline timeline entries for trace assembly. */
  timeline: StageTimelineEntry[];
  /** Validated request. */
  request?: IntelligenceRequest;
  /** Collected evidence (with quality and contradictions). */
  evidence?: EvidenceCollection;
  /** Confidence assessment output. */
  confidence?: ConfidenceAssessment;
  /** Trust assessment output. */
  trust?: TrustAssessment;
  /** Graph context output. */
  graphContext?: GraphContext;
  /** Memory context output. */
  memoryContext?: MemoryContext;
  /** Reasoning trace output. */
  reasoningTrace?: ReasoningTrace;
  /** Assembled intelligence result. */
  result?: IntelligenceResult;
  /** Run diagnostics output. */
  diagnostics?: IntelligenceRunDiagnostics;
  /** Last runtime policy decision applied during orchestration (BUILD-051). */
  lastPolicyDecision?: import("@/lib/intelligence/runtime/policy/types").PolicyDecision;
}

/**
 * Create an empty orchestrator execution context.
 */
export function createOrchestratorExecutionContext(input: {
  runId: string;
  requestId: string;
  startedAt: string;
  plan: ExecutionPlan;
}): OrchestratorExecutionContext {
  return {
    runId: input.runId,
    requestId: input.requestId,
    startedAt: input.startedAt,
    completedStages: [],
    failedStages: [],
    skippedStages: [],
    warnings: [],
    blockingIssues: [],
    status: "running",
    plan: input.plan,
    timeline: [],
  };
}

/**
 * Mark a stage as the current running stage in context and plan.
 */
export function markStageRunning(
  context: OrchestratorExecutionContext,
  stageId: OrchestratorStageId,
): void {
  context.currentStage = stageId;

  const stage = context.plan.stages.find((entry) => entry.id === stageId);

  if (stage) {
    stage.status = "running";
  }
}

/**
 * Mark a stage complete in context and plan.
 */
export function markStageComplete(
  context: OrchestratorExecutionContext,
  stageId: OrchestratorStageId,
): void {
  if (!context.completedStages.includes(stageId)) {
    context.completedStages.push(stageId);
  }

  const stage = context.plan.stages.find((entry) => entry.id === stageId);

  if (stage) {
    stage.status = "complete";
  }

  context.currentStage = undefined;
}

/**
 * Mark a stage failed in context and plan.
 */
export function markStageFailed(
  context: OrchestratorExecutionContext,
  stageId: OrchestratorStageId,
  message: string,
): void {
  if (!context.failedStages.includes(stageId)) {
    context.failedStages.push(stageId);
  }

  const stage = context.plan.stages.find((entry) => entry.id === stageId);

  if (stage) {
    stage.status = "failed";
  }

  context.warnings.push(`Stage ${stageId} failed: ${message}`);
  context.currentStage = undefined;
}

/**
 * Mark remaining enabled stages as skipped from a given index onward.
 */
export function markStagesSkipped(
  context: OrchestratorExecutionContext,
  fromStageId: OrchestratorStageId,
): void {
  const startIndex = context.plan.stages.findIndex((stage) => stage.id === fromStageId);

  if (startIndex === -1) {
    return;
  }

  for (const stage of context.plan.stages.slice(startIndex)) {
    if (stage.status === "pending" || stage.status === "running") {
      stage.status = "skipped";

      if (!context.skippedStages.includes(stage.id)) {
        context.skippedStages.push(stage.id);
      }
    }
  }

  context.currentStage = undefined;
}

/**
 * Record warnings on the execution context (deduplicated).
 */
export function appendContextWarnings(
  context: OrchestratorExecutionContext,
  warnings: readonly string[],
): void {
  for (const warning of warnings) {
    if (!context.warnings.includes(warning)) {
      context.warnings.push(warning);
    }
  }
}

/**
 * Record blocking issues on the execution context (deduplicated).
 */
export function appendContextBlockingIssues(
  context: OrchestratorExecutionContext,
  issues: readonly string[],
): void {
  for (const issue of issues) {
    if (!context.blockingIssues.includes(issue)) {
      context.blockingIssues.push(issue);
    }
  }
}

/**
 * Finalize execution context status and finish timestamp.
 */
export function finalizeExecutionContext(
  context: OrchestratorExecutionContext,
  outcome: OrchestratorExecutionStatus,
  finishedAt: string,
): void {
  context.status = outcome;
  context.finishedAt = finishedAt;
  context.currentStage = undefined;
}
