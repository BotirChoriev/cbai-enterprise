import type { ConfidenceAssessment } from "@/lib/intelligence/confidence.types";
import type { GraphContext, MemoryContext } from "@/lib/intelligence/context.types";
import type { EvidenceCollection } from "@/lib/intelligence/evidence.types";
import type { IntelligenceRequest } from "@/lib/intelligence/request.types";
import type { IntelligenceResult } from "@/lib/intelligence/result.types";
import type { TrustAssessment } from "@/lib/intelligence/trust.types";
import type { DiagnosticIssue } from "@/lib/intelligence/diagnostics/types";

/** Issue code: blocking contradiction conflict. */
export const ISSUE_BLOCKING_CONTRADICTION = "blocking-contradiction";

/** Issue code: execution requested but trust denies execution. */
export const ISSUE_BLOCKING_EXECUTION_DENIED = "blocking-execution-denied";

/** Issue code: evidence sufficiency insufficient. */
export const ISSUE_DEGRADED_EVIDENCE_INSUFFICIENT = "degraded-evidence-insufficient";

/** Issue code: confidence band insufficient or very-low. */
export const ISSUE_DEGRADED_CONFIDENCE_BAND = "degraded-confidence-band";

/** Issue code: trust level unverified or low. */
export const ISSUE_DEGRADED_TRUST_LEVEL = "degraded-trust-level";

/** Issue code: graph requested but not connected. */
export const ISSUE_DEGRADED_GRAPH_NOT_CONNECTED = "degraded-graph-not-connected";

/** Issue code: memory requested but not connected. */
export const ISSUE_DEGRADED_MEMORY_NOT_CONNECTED = "degraded-memory-not-connected";

/** Issue code: trace verification degraded. */
export const ISSUE_DEGRADED_TRACE_VERIFICATION = "degraded-trace-verification";

/** Issue code: non-blocking trace warning. */
export const ISSUE_INFO_TRACE_WARNING = "info-trace-warning";

/**
 * Returns true when the request structurally asks for operational execution.
 */
export function requestAsksForExecution(request: IntelligenceRequest): boolean {
  return request.type === "operational";
}

/**
 * Resolve a human-readable evidence status string from collection state.
 */
export function resolveEvidenceStatusLabel(evidence: EvidenceCollection): string {
  if (evidence.metadata?.status) {
    return `${evidence.metadata.status}:${evidence.sufficiencyStatus}`;
  }

  return evidence.sufficiencyStatus;
}

/**
 * Collect deterministic diagnostic issues from pipeline artifacts.
 *
 * No fabricated issues — only observed layer and trace signals.
 */
export function collectDiagnosticIssues(input: {
  request: IntelligenceRequest;
  evidence: EvidenceCollection;
  confidence: ConfidenceAssessment;
  trust: TrustAssessment;
  graphContext: GraphContext;
  memoryContext: MemoryContext;
  result: IntelligenceResult;
}): DiagnosticIssue[] {
  const issues: DiagnosticIssue[] = [];
  const { request, evidence, confidence, trust, graphContext, memoryContext, result } =
    input;

  if (evidence.contradictionSummary?.hasBlockingConflict === true) {
    issues.push({
      id: "issue:blocking-contradiction",
      severity: "blocking",
      code: ISSUE_BLOCKING_CONTRADICTION,
      message: `Blocking evidence contradiction detected (${evidence.contradictionSummary.totalContradictions} conflict(s)).`,
      source: "contradiction-detection",
    });
  }

  if (requestAsksForExecution(request) && !trust.allowExecution) {
    issues.push({
      id: "issue:blocking-execution-denied",
      severity: "blocking",
      code: ISSUE_BLOCKING_EXECUTION_DENIED,
      message:
        "Operational execution was requested but trust assessment denied allowExecution.",
      source: "trust-assessment",
    });
  }

  if (
    evidence.sufficiencyStatus === "insufficient" ||
    evidence.items.length === 0
  ) {
    issues.push({
      id: "issue:degraded-evidence-insufficient",
      severity: "degraded",
      code: ISSUE_DEGRADED_EVIDENCE_INSUFFICIENT,
      message: `Evidence sufficiency is ${evidence.sufficiencyStatus} with ${evidence.items.length} item(s).`,
      source: "evidence-collection",
    });
  }

  if (confidence.band === "insufficient" || confidence.band === "very-low") {
    issues.push({
      id: "issue:degraded-confidence-band",
      severity: "degraded",
      code: ISSUE_DEGRADED_CONFIDENCE_BAND,
      message: `Confidence band is ${confidence.band} (score=${confidence.score}).`,
      source: "confidence-assessment",
    });
  }

  if (trust.trustLevel === "unverified" || trust.trustLevel === "low") {
    issues.push({
      id: "issue:degraded-trust-level",
      severity: "degraded",
      code: ISSUE_DEGRADED_TRUST_LEVEL,
      message: `Trust level is ${trust.trustLevel} (score=${trust.trustScore}).`,
      source: "trust-assessment",
    });
  }

  if (
    request.includeGraph === true &&
    graphContext.metadata?.status === "graph-context-not-connected"
  ) {
    issues.push({
      id: "issue:degraded-graph-not-connected",
      severity: "degraded",
      code: ISSUE_DEGRADED_GRAPH_NOT_CONNECTED,
      message: "Graph context was requested but the Knowledge Graph adapter is not connected.",
      source: "graph-context",
    });
  }

  if (
    request.includeMemory === true &&
    memoryContext.metadata?.status === "memory-not-connected"
  ) {
    issues.push({
      id: "issue:degraded-memory-not-connected",
      severity: "degraded",
      code: ISSUE_DEGRADED_MEMORY_NOT_CONNECTED,
      message: "Memory context was requested but the memory store is not connected.",
      source: "memory-context",
    });
  }

  if (result.reasoningTrace.verificationResult === "degraded") {
    issues.push({
      id: "issue:degraded-trace-verification",
      severity: "degraded",
      code: ISSUE_DEGRADED_TRACE_VERIFICATION,
      message: "Reasoning trace structural verification returned degraded.",
      source: "reasoning-trace",
    });
  }

  if (result.reasoningTrace.verificationResult === "fail") {
    issues.push({
      id: "issue:blocking-trace-verification-fail",
      severity: "blocking",
      code: "blocking-trace-verification-fail",
      message: "Reasoning trace structural verification failed.",
      source: "reasoning-trace",
    });
  }

  for (const [index, warning] of result.warnings.entries()) {
    issues.push({
      id: `issue:info-trace-warning:${index}`,
      severity: "info",
      code: ISSUE_INFO_TRACE_WARNING,
      message: warning,
      source: "reasoning-trace",
    });
  }

  return issues.sort((a, b) => a.id.localeCompare(b.id));
}

/**
 * Count blocking diagnostic issues.
 */
export function countBlockingIssues(issues: DiagnosticIssue[]): number {
  return issues.filter((issue) => issue.severity === "blocking").length;
}

/**
 * Count non-info warnings for diagnostics summary.
 */
export function countWarnings(issues: DiagnosticIssue[], resultWarnings: string[]): number {
  const infoFromIssues = issues.filter((issue) => issue.severity === "info").length;
  return Math.max(infoFromIssues, resultWarnings.length);
}

/**
 * Resolve recommended next engineering action from collected issues.
 */
export function resolveRecommendedNextEngineeringAction(
  issues: DiagnosticIssue[],
  runHealth: import("@/lib/intelligence/diagnostics/types").RunHealth,
): string {
  if (runHealth === "healthy") {
    return "No immediate engineering action required — run health is nominal.";
  }

  const priorityOrder = [
    ISSUE_BLOCKING_CONTRADICTION,
    ISSUE_BLOCKING_EXECUTION_DENIED,
    "blocking-trace-verification-fail",
    ISSUE_DEGRADED_EVIDENCE_INSUFFICIENT,
    ISSUE_DEGRADED_GRAPH_NOT_CONNECTED,
    ISSUE_DEGRADED_MEMORY_NOT_CONNECTED,
    ISSUE_DEGRADED_CONFIDENCE_BAND,
    ISSUE_DEGRADED_TRUST_LEVEL,
    ISSUE_DEGRADED_TRACE_VERIFICATION,
  ];

  const actionByCode: Record<string, string> = {
    [ISSUE_BLOCKING_CONTRADICTION]:
      "Resolve evidence contradictions before enabling execution or automation paths.",
    [ISSUE_BLOCKING_EXECUTION_DENIED]:
      "Elevate trust to verified through stronger evidence, or change request type away from operational execution.",
    "blocking-trace-verification-fail":
      "Investigate pipeline stage failures recorded in the reasoning trace before re-running.",
    [ISSUE_DEGRADED_EVIDENCE_INSUFFICIENT]:
      "Connect evidence source adapters and provide resolvable subjectEntities to improve evidence sufficiency.",
    [ISSUE_DEGRADED_GRAPH_NOT_CONNECTED]:
      "Connect the Knowledge Graph adapter or set includeGraph: false when graph context is not required.",
    [ISSUE_DEGRADED_MEMORY_NOT_CONNECTED]:
      "Connect the memory store or set includeMemory: false when organizational memory is not required.",
    [ISSUE_DEGRADED_CONFIDENCE_BAND]:
      "Improve evidence volume, relevance, and quality to raise confidence above very-low/insufficient bands.",
    [ISSUE_DEGRADED_TRUST_LEVEL]:
      "Strengthen evidence grounding and quality gates to reach moderate or verified trust levels.",
    [ISSUE_DEGRADED_TRACE_VERIFICATION]:
      "Review trace warnings and missing context layers to restore non-degraded pipeline verification.",
  };

  for (const code of priorityOrder) {
    if (issues.some((issue) => issue.code === code)) {
      return actionByCode[code] ?? "Review diagnostic issues and address highest-severity signals first.";
    }
  }

  return "Review diagnostic issues and address highest-severity signals first.";
}
