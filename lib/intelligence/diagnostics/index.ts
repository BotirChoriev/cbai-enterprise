/**
 * CBAI Intelligence Engine — Run Diagnostics Layer (BUILD-038).
 *
 * Deterministic run health summaries from observed pipeline artifacts.
 * No AI models, fabricated diagnostics, or external services.
 *
 * @see docs/build-038-report.md
 */

export {
  DEFAULT_DIAGNOSTICS_BUILDER_ID,
  DIAGNOSTICS_BUILDER_VERSION,
  DefaultDiagnosticsBuilder,
  attachDiagnosticsToResult,
  defaultDiagnosticsBuilder,
  type DiagnosticsBuilder,
  type DiagnosticsBuilderInput,
} from "@/lib/intelligence/diagnostics/diagnostics-builder";

export {
  buildDiagnosticsLayerSnapshot,
  buildDiagnosticsStageHealth,
  buildStageHealthList,
  mergeStageHealthStatus,
  resolveGraphStatusLabel,
  resolveMemoryStatusLabel,
  resolveRunHealth,
  resolveStageHealthFromTrace,
} from "@/lib/intelligence/diagnostics/health";

export {
  ISSUE_BLOCKING_CONTRADICTION,
  ISSUE_BLOCKING_EXECUTION_DENIED,
  ISSUE_DEGRADED_CONFIDENCE_BAND,
  ISSUE_DEGRADED_EVIDENCE_INSUFFICIENT,
  ISSUE_DEGRADED_GRAPH_NOT_CONNECTED,
  ISSUE_DEGRADED_MEMORY_NOT_CONNECTED,
  ISSUE_DEGRADED_TRACE_VERIFICATION,
  ISSUE_DEGRADED_TRUST_LEVEL,
  ISSUE_INFO_TRACE_WARNING,
  collectDiagnosticIssues,
  countBlockingIssues,
  countWarnings,
  requestAsksForExecution,
  resolveEvidenceStatusLabel,
  resolveRecommendedNextEngineeringAction,
} from "@/lib/intelligence/diagnostics/issues";

export type {
  DiagnosticIssue,
  DiagnosticIssueSeverity,
  DiagnosticsLayerSnapshot,
  DiagnosticsMetadata,
  IntelligenceRunDiagnostics,
  RunHealth,
  StageHealth,
  StageHealthStatus,
} from "@/lib/intelligence/diagnostics/types";
