import type { ConfidenceBand } from "@/lib/intelligence/confidence.types";
import type {
  GraphContextStatus,
  MemoryContextStatus,
} from "@/lib/intelligence/context.types";
import type { ContradictionState } from "@/lib/intelligence/evidence.types";
import type { IntelligencePipelineStageId } from "@/lib/intelligence/pipeline-stage.types";
import type { TrustLevel } from "@/lib/intelligence/trust.types";

/** Overall run health classification (BUILD-038). */
export type RunHealth = "healthy" | "degraded" | "blocked";

/** Per-stage health classification. */
export type StageHealthStatus = "healthy" | "degraded" | "blocked" | "skipped";

/** Severity tier for a diagnostic issue. */
export type DiagnosticIssueSeverity = "blocking" | "degraded" | "info";

/**
 * A single deterministic diagnostic issue observed during a run.
 */
export interface DiagnosticIssue {
  /** Stable issue identifier for audit and monitoring. */
  id: string;
  /** Issue severity tier. */
  severity: DiagnosticIssueSeverity;
  /** Machine-readable issue code. */
  code: string;
  /** Human-readable issue description. */
  message: string;
  /** Source layer or pipeline stage. */
  source: string;
}

/**
 * Health summary for an individual pipeline stage.
 */
export interface StageHealth {
  /** Pipeline stage identifier. */
  stageId: IntelligencePipelineStageId | "run-diagnostics";
  /** Human-readable stage label. */
  label: string;
  /** Derived stage health status. */
  status: StageHealthStatus;
  /** Optional factual explanation. */
  message?: string;
}

/**
 * Snapshot of key layer statuses for enterprise monitoring.
 */
export interface DiagnosticsLayerSnapshot {
  evidenceStatus: string;
  confidenceBand: ConfidenceBand;
  trustLevel: TrustLevel;
  contradictionStatus: ContradictionState;
  graphStatus: GraphContextStatus | "unknown";
  memoryStatus: MemoryContextStatus | "unknown";
}

/**
 * Metadata describing how diagnostics were produced.
 */
export interface DiagnosticsMetadata {
  builderId: string;
  builderVersion: string;
  builtAt: string;
}

/**
 * Deterministic diagnostics summary for an intelligence engine run (BUILD-038).
 */
export interface IntelligenceRunDiagnostics {
  /** Overall run health derived from blocking and degraded signals. */
  runHealth: RunHealth;
  /** Per-stage health assessments. */
  stageHealth: StageHealth[];
  /** Count of non-blocking warnings from trace and result. */
  warningCount: number;
  /** Count of blocking diagnostic issues. */
  blockingIssueCount: number;
  /** Evidence collection status summary. */
  evidenceStatus: string;
  /** Confidence band at run completion. */
  confidenceBand: ConfidenceBand;
  /** Trust level at run completion. */
  trustLevel: TrustLevel;
  /** Contradiction state after detection. */
  contradictionStatus: ContradictionState;
  /** Graph context production status. */
  graphStatus: GraphContextStatus | "unknown";
  /** Memory context production status. */
  memoryStatus: MemoryContextStatus | "unknown";
  /** All collected diagnostic issues ordered deterministically. */
  issues: DiagnosticIssue[];
  /** Recommended next engineering action based on highest-priority issue. */
  recommendedNextEngineeringAction: string;
  /** Diagnostics builder metadata. */
  metadata: DiagnosticsMetadata;
}
