import type { ConfidenceAssessment } from "@/lib/intelligence/confidence.types";
import type { GraphContext, MemoryContext } from "@/lib/intelligence/context.types";
import type { EvidenceCollection } from "@/lib/intelligence/evidence.types";
import {
  buildDiagnosticsLayerSnapshot,
  buildDiagnosticsStageHealth,
  buildStageHealthList,
  resolveRunHealth,
} from "@/lib/intelligence/diagnostics/health";
import {
  collectDiagnosticIssues,
  countBlockingIssues,
  countWarnings,
  resolveRecommendedNextEngineeringAction,
  resolveEvidenceStatusLabel,
} from "@/lib/intelligence/diagnostics/issues";
import type { IntelligenceRunDiagnostics } from "@/lib/intelligence/diagnostics/types";
import type { IntelligenceRequest } from "@/lib/intelligence/request.types";
import type { IntelligenceResult } from "@/lib/intelligence/result.types";
import type { ReasoningTrace } from "@/lib/intelligence/trace.types";
import type { TrustAssessment } from "@/lib/intelligence/trust.types";

/** Semantic version of the default diagnostics builder. */
export const DIAGNOSTICS_BUILDER_VERSION = "0.1.0-run-diagnostics";

/** Stable identifier for audit metadata. */
export const DEFAULT_DIAGNOSTICS_BUILDER_ID = "default-diagnostics-builder";

/**
 * Input bundle for building {@link IntelligenceRunDiagnostics}.
 */
export interface DiagnosticsBuilderInput {
  request: IntelligenceRequest;
  evidence: EvidenceCollection;
  confidence: ConfidenceAssessment;
  trust: TrustAssessment;
  graphContext: GraphContext;
  memoryContext: MemoryContext;
  reasoningTrace: ReasoningTrace;
  result: IntelligenceResult;
}

/**
 * Contract for the CBAI Intelligence Run Diagnostics Layer (BUILD-038).
 *
 * Produces deterministic run health summaries from observed pipeline artifacts.
 * No AI models, fabricated diagnostics, or external services.
 */
export interface DiagnosticsBuilder {
  build(input: DiagnosticsBuilderInput): Promise<IntelligenceRunDiagnostics>;
}

/**
 * Attach diagnostics to an intelligence result without mutating layer scores.
 */
export function attachDiagnosticsToResult(
  result: IntelligenceResult,
  diagnostics: IntelligenceRunDiagnostics,
): IntelligenceResult {
  return {
    ...result,
    diagnostics,
  };
}

/**
 * Default diagnostics builder for the CBAI Intelligence Engine (BUILD-038).
 */
export class DefaultDiagnosticsBuilder implements DiagnosticsBuilder {
  /**
   * Build diagnostics from complete pipeline artifacts after result assembly.
   */
  async build(input: DiagnosticsBuilderInput): Promise<IntelligenceRunDiagnostics> {
    const builtAt = new Date().toISOString();
    const issues = collectDiagnosticIssues(input);
    const runHealth = resolveRunHealth(issues);
    const stageHealth = [
      ...buildStageHealthList({
        trace: input.reasoningTrace,
        issues,
      }),
      buildDiagnosticsStageHealth(runHealth),
    ];
    const snapshot = buildDiagnosticsLayerSnapshot(input);

    return {
      runHealth,
      stageHealth,
      warningCount: countWarnings(issues, input.result.warnings),
      blockingIssueCount: countBlockingIssues(issues),
      evidenceStatus: resolveEvidenceStatusLabel(input.evidence),
      confidenceBand: snapshot.confidenceBand,
      trustLevel: snapshot.trustLevel,
      contradictionStatus: snapshot.contradictionStatus,
      graphStatus: snapshot.graphStatus,
      memoryStatus: snapshot.memoryStatus,
      issues,
      recommendedNextEngineeringAction: resolveRecommendedNextEngineeringAction(
        issues,
        runHealth,
      ),
      metadata: {
        builderId: DEFAULT_DIAGNOSTICS_BUILDER_ID,
        builderVersion: DIAGNOSTICS_BUILDER_VERSION,
        builtAt,
      },
    };
  }
}

/** Shared default diagnostics builder singleton. */
export const defaultDiagnosticsBuilder = new DefaultDiagnosticsBuilder();
