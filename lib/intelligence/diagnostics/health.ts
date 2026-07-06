import type { ConfidenceAssessment } from "@/lib/intelligence/confidence.types";
import type {
  GraphContext,
  GraphContextStatus,
  MemoryContext,
  MemoryContextStatus,
} from "@/lib/intelligence/context.types";
import type { EvidenceCollection } from "@/lib/intelligence/evidence.types";
import { PIPELINE_STAGE_LABELS } from "@/lib/intelligence/pipeline-stage.types";
import type { ReasoningTrace } from "@/lib/intelligence/trace.types";
import type { TrustAssessment } from "@/lib/intelligence/trust.types";
import type {
  DiagnosticIssue,
  RunHealth,
  StageHealth,
  StageHealthStatus,
} from "@/lib/intelligence/diagnostics/types";
import {
  ISSUE_BLOCKING_CONTRADICTION,
  ISSUE_BLOCKING_EXECUTION_DENIED,
  ISSUE_DEGRADED_CONFIDENCE_BAND,
  ISSUE_DEGRADED_EVIDENCE_INSUFFICIENT,
  ISSUE_DEGRADED_GRAPH_NOT_CONNECTED,
  ISSUE_DEGRADED_MEMORY_NOT_CONNECTED,
  ISSUE_DEGRADED_TRACE_VERIFICATION,
  ISSUE_DEGRADED_TRUST_LEVEL,
} from "@/lib/intelligence/diagnostics/issues";

const STAGE_ISSUE_CODES: Record<string, string[]> = {
  "evidence-collection": [ISSUE_DEGRADED_EVIDENCE_INSUFFICIENT],
  "contradiction-detection": [ISSUE_BLOCKING_CONTRADICTION],
  "confidence-assessment": [ISSUE_DEGRADED_CONFIDENCE_BAND],
  "trust-assessment": [ISSUE_BLOCKING_EXECUTION_DENIED, ISSUE_DEGRADED_TRUST_LEVEL],
  "graph-context": [ISSUE_DEGRADED_GRAPH_NOT_CONNECTED],
  "memory-context": [ISSUE_DEGRADED_MEMORY_NOT_CONNECTED],
  "reasoning-trace": [ISSUE_DEGRADED_TRACE_VERIFICATION, "blocking-trace-verification-fail"],
};

/**
 * Resolve overall run health from collected issues.
 */
export function resolveRunHealth(issues: DiagnosticIssue[]): RunHealth {
  if (issues.some((issue) => issue.severity === "blocking")) {
    return "blocked";
  }

  if (issues.some((issue) => issue.severity === "degraded")) {
    return "degraded";
  }

  return "healthy";
}

/**
 * Map trace stage verification to stage health status.
 */
export function resolveStageHealthFromTrace(input: {
  status: ReasoningTrace["stages"][number]["status"];
  verificationResult?: ReasoningTrace["stages"][number]["verificationResult"];
}): StageHealthStatus {
  if (input.status === "failed") {
    return "blocked";
  }

  if (input.status === "skipped") {
    return "skipped";
  }

  if (input.verificationResult === "fail") {
    return "blocked";
  }

  if (input.verificationResult === "degraded") {
    return "degraded";
  }

  return "healthy";
}

/**
 * Elevate stage health status to the more severe of two statuses.
 */
export function mergeStageHealthStatus(
  current: StageHealthStatus,
  next: StageHealthStatus,
): StageHealthStatus {
  const rank: Record<StageHealthStatus, number> = {
    healthy: 0,
    skipped: 1,
    degraded: 2,
    blocked: 3,
  };

  return rank[next] > rank[current] ? next : current;
}

/**
 * Build per-stage health list from trace records and diagnostic issues.
 */
export function buildStageHealthList(input: {
  trace: ReasoningTrace;
  issues: DiagnosticIssue[];
}): StageHealth[] {
  const stageHealthMap = new Map<string, StageHealth>();

  for (const stage of input.trace.stages) {
    const stageId = stage.stageId;

    if (typeof stageId !== "string" || !(stageId in PIPELINE_STAGE_LABELS)) {
      continue;
    }

    const pipelineStageId = stageId as keyof typeof PIPELINE_STAGE_LABELS;
    let status = resolveStageHealthFromTrace({
      status: stage.status,
      verificationResult: stage.verificationResult,
    });

    const relatedCodes = STAGE_ISSUE_CODES[pipelineStageId] ?? [];

    for (const code of relatedCodes) {
      const relatedIssue = input.issues.find((issue) => issue.code === code);

      if (!relatedIssue) {
        continue;
      }

      if (relatedIssue.severity === "blocking") {
        status = mergeStageHealthStatus(status, "blocked");
      } else if (relatedIssue.severity === "degraded") {
        status = mergeStageHealthStatus(status, "degraded");
      }
    }

    stageHealthMap.set(pipelineStageId, {
      stageId: pipelineStageId,
      label: PIPELINE_STAGE_LABELS[pipelineStageId],
      status,
      message: stage.output,
    });
  }

  const orderedStages = [
    "request",
    "evidence-collection",
    "contradiction-detection",
    "confidence-assessment",
    "trust-assessment",
    "graph-context",
    "memory-context",
    "reasoning-trace",
    "intelligence-result",
  ] as const;

  return orderedStages
    .map((stageId) => stageHealthMap.get(stageId))
    .filter((entry): entry is StageHealth => entry !== undefined);
}

/**
 * Resolve graph status label for diagnostics snapshot.
 */
export function resolveGraphStatusLabel(graphContext: GraphContext): GraphContextStatus | "unknown" {
  return graphContext.metadata?.status ?? "unknown";
}

/**
 * Resolve memory status label for diagnostics snapshot.
 */
export function resolveMemoryStatusLabel(
  memoryContext: MemoryContext,
): MemoryContextStatus | "unknown" {
  return memoryContext.metadata?.status ?? "unknown";
}

/**
 * Build layer snapshot fields for diagnostics output.
 */
export function buildDiagnosticsLayerSnapshot(input: {
  evidence: EvidenceCollection;
  confidence: ConfidenceAssessment;
  trust: TrustAssessment;
  graphContext: GraphContext;
  memoryContext: MemoryContext;
}): {
  evidenceStatus: string;
  confidenceBand: ConfidenceAssessment["band"];
  trustLevel: TrustAssessment["trustLevel"];
  contradictionStatus: EvidenceCollection["contradictionState"];
  graphStatus: GraphContextStatus | "unknown";
  memoryStatus: MemoryContextStatus | "unknown";
} {
  return {
    evidenceStatus:
      input.evidence.metadata?.status !== undefined
        ? `${input.evidence.metadata.status}:${input.evidence.sufficiencyStatus}`
        : input.evidence.sufficiencyStatus,
    confidenceBand: input.confidence.band,
    trustLevel: input.trust.trustLevel,
    contradictionStatus: input.evidence.contradictionState,
    graphStatus: resolveGraphStatusLabel(input.graphContext),
    memoryStatus: resolveMemoryStatusLabel(input.memoryContext),
  };
}

/**
 * Derive run-diagnostics stage health from overall run health.
 */
export function buildDiagnosticsStageHealth(runHealth: RunHealth): StageHealth {
  return {
    stageId: "run-diagnostics",
    label: "Run Diagnostics",
    status:
      runHealth === "blocked"
        ? "blocked"
        : runHealth === "degraded"
          ? "degraded"
          : "healthy",
    message: `Run diagnostics classified health as ${runHealth}.`,
  };
}
