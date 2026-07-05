import type { ConfidenceAssessment } from "@/lib/intelligence/confidence.types";
import type { GraphContext, MemoryContext } from "@/lib/intelligence/context.types";
import type { EvidenceCollection } from "@/lib/intelligence/evidence.types";
import type { IntelligenceRequest } from "@/lib/intelligence/request.types";
import {
  defaultResultFormatter,
  type ResultFormatter,
} from "@/lib/intelligence/result/formatter";
import type { IntelligenceResult } from "@/lib/intelligence/result.types";
import {
  defaultSummaryBuilder,
  resolveIntelligenceType,
  resolveLifecycleState,
  resolveRelatedEntities,
  type SummaryBuilder,
} from "@/lib/intelligence/result/summary";
import type { ReasoningTrace } from "@/lib/intelligence/trace.types";
import type { TrustAssessment } from "@/lib/intelligence/trust.types";

/** Semantic version of the default result assembler. */
export const RESULT_ASSEMBLER_VERSION = "0.1.0-foundation";

/** Stable identifier for audit metadata. */
export const DEFAULT_RESULT_ASSEMBLER_ID = "default-result-assembler";

/**
 * Input bundle for assembling an {@link IntelligenceResult}.
 */
export interface ResultAssemblerInput {
  /** Unique pipeline run identifier — becomes result id. */
  runId: string;
  request: IntelligenceRequest;
  evidence: EvidenceCollection;
  confidence: ConfidenceAssessment;
  trust: TrustAssessment;
  graphContext: GraphContext;
  memoryContext: MemoryContext;
  reasoningTrace: ReasoningTrace;
}

/**
 * Contract for the CBAI Intelligence Result Layer.
 *
 * Assembles the complete intelligence product from pipeline layer outputs.
 * Never fabricates intelligence or business conclusions.
 */
export interface ResultAssembler {
  /**
   * Assemble a deterministic intelligence result.
   */
  assemble(input: ResultAssemblerInput): Promise<IntelligenceResult>;
}

/**
 * Default result assembler for the CBAI Intelligence Engine (BUILD-029).
 */
export class DefaultResultAssembler implements ResultAssembler {
  private readonly summaryBuilder: SummaryBuilder;
  private readonly formatter: ResultFormatter;

  constructor(
    summaryBuilder: SummaryBuilder = defaultSummaryBuilder,
    formatter: ResultFormatter = defaultResultFormatter,
  ) {
    this.summaryBuilder = summaryBuilder;
    this.formatter = formatter;
  }

  /**
   * Assemble result preserving layer outputs exactly — no score mutation.
   */
  async assemble(input: ResultAssemblerInput): Promise<IntelligenceResult> {
    const {
      runId,
      request,
      evidence,
      confidence,
      trust,
      graphContext,
      memoryContext,
      reasoningTrace,
    } = input;

    const relatedEntities = this.formatter.formatRelatedEntities(
      resolveRelatedEntities(request),
    );
    const executiveSummary = this.summaryBuilder.buildExecutiveSummary(evidence);
    const recommendations = this.summaryBuilder.buildRecommendations(evidence);
    const warnings = [...reasoningTrace.warnings];

    const summary = this.summaryBuilder.buildSummary({
      executiveSummary,
      evidence,
      confidence,
      recommendations,
    });

    const formatted = this.formatter.formatSections({
      executiveSummary,
      summary,
    });

    const producedAt = reasoningTrace.completedAt ?? new Date().toISOString();

    return {
      id: runId,
      requestId: request.id,
      type: resolveIntelligenceType(request),
      claim: formatted.claim,
      finalAnswer: formatted.finalAnswer,
      executiveSummary: formatted.executiveSummary,
      subjectEntities: relatedEntities,
      relatedEntities,
      evidence,
      confidence,
      trust,
      reasoningTrace,
      graphContext,
      memoryContext,
      summary: formatted.summary,
      recommendations,
      warnings,
      producedAt,
      lifecycleState: resolveLifecycleState(evidence),
      overrideStatus: "none",
      isStale: false,
    };
  }
}

/** Shared default result assembler singleton used by the intelligence engine pipeline. */
export const defaultResultAssembler = new DefaultResultAssembler();
