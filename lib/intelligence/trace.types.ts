import type { TrustTier } from "@/lib/intelligence/trust.types";
import type { IntelligencePipelineStageId } from "@/lib/intelligence/pipeline-stage.types";

/**
 * Pipeline stage execution status for audit traces.
 */
export type ReasoningStageStatus =
  | "pending"
  | "active"
  | "complete"
  | "failed"
  | "skipped";

/**
 * Structural verification outcome for a single pipeline stage
 * per Intelligence Specification §8.2.
 */
export type StageVerificationResult = "pass" | "fail" | "degraded";

/**
 * Canonical Reasoning Engine stage identifiers aligned with Domain Model §6.2.
 */
export type ReasoningStageId =
  | "question"
  | "search"
  | "knowledge-graph"
  | "evidence"
  | "reasoning"
  | "decision"
  | "confidence"
  | "final-answer";

/**
 * CBAI Core orchestration stage identifiers aligned with Domain Model §6.1.
 */
export type CorePipelineStageId =
  | "input"
  | "planner"
  | "research"
  | "knowledge"
  | "reasoning"
  | "output"
  | "action";

/**
 * Union of all stage identifiers that may appear in a reasoning trace.
 */
export type PipelineStageId =
  | ReasoningStageId
  | CorePipelineStageId
  | IntelligencePipelineStageId;

/**
 * Audit record for a single pipeline stage execution.
 */
export interface ReasoningStageTrace {
  /** Stage identifier. */
  stageId: PipelineStageId;
  /** Human-readable stage label. */
  label: string;
  /** Execution status at trace capture time. */
  status: ReasoningStageStatus;
  /** ISO-8601 timestamp when the stage started. */
  startedAt?: string;
  /** ISO-8601 timestamp when the stage completed. */
  completedAt?: string;
  /** Wall-clock duration in milliseconds. */
  durationMs?: number;
  /** Stage output summary for explainability. */
  output?: string;
  /** Structural verification result per Intelligence Specification §8. */
  verificationResult?: StageVerificationResult;
}

/**
 * Record of a single agent's contribution within a multi-agent
 * intelligence run per Intelligence Specification §11.
 */
export interface AgentDecision {
  /** Stable agent identifier (e.g. `research`, `strategy`). */
  agentId: string;
  /** Display name (e.g. "Research Agent"). */
  agentName: string;
  /** Summary of the agent's contribution to the merged intelligence product. */
  contribution: string;
  /** Trust tier assigned to this agent's output at merge time. */
  trustTier: TrustTier;
  /** Wall-clock duration in milliseconds. */
  durationMs?: number;
  /** Whether the agent completed successfully. */
  success: boolean;
  /** Error message when {@link success} is false. */
  error?: string;
  /** Optional token or compute cost attributed to this agent run. */
  costUnits?: number;
}

/**
 * Overall structural verification result for a complete reasoning run
 * per Intelligence Specification §8.5.
 */
export type TraceVerificationResult = "pass" | "fail" | "degraded";

/**
 * Structural verification summary for a pipeline execution trace (BUILD-028).
 *
 * Records audit checks only — no AI reasoning or conclusions.
 */
export interface TraceVerificationSummary {
  /** Overall verification outcome. */
  result: TraceVerificationResult;
  /** Whether all required pipeline stages executed successfully. */
  requiredStagesExecuted: boolean;
  /** Whether stage order and timeline integrity checks passed. */
  pipelineIntegrity: boolean;
  /** Context layers requested but not connected. */
  missingContext: string[];
  /** Whether execution ran in degraded mode. */
  degradedExecution: boolean;
  /** Non-fatal audit warnings collected during verification. */
  warnings: string[];
}

/**
 * Complete audit trace for an intelligence pipeline execution.
 *
 * Enables reproducibility, explainability, and post-hoc verification.
 * Every verified reasoning run must produce a trace per Specification §8.5.
 *
 * @see docs/CBAI-Intelligence-Specification-v1.md §8, §11, §12
 */
export interface ReasoningTrace {
  /** Unique identifier for this pipeline run. */
  runId: string;
  /** Ordered stage execution records. */
  stages: ReasoningStageTrace[];
  /** Per-agent contributions when multi-agent collaboration occurred. */
  agentDecisions: AgentDecision[];
  /** Overall structural verification outcome. */
  verificationResult: TraceVerificationResult;
  /** Structural verification summary from BUILD-028 verification helper. */
  verificationSummary?: TraceVerificationSummary;
  /** Non-fatal audit warnings observed during pipeline execution. */
  warnings: string[];
  /** Engine or orchestrator version string for reproducibility. */
  producerVersion?: string;
  /** Model identifier when model backends participated (Phase 2+). */
  modelId?: string;
  /** ISO-8601 timestamp when the run started. */
  startedAt: string;
  /** ISO-8601 timestamp when the run completed. */
  completedAt?: string;
  /** Total wall-clock duration in milliseconds. */
  totalDurationMs?: number;
}
