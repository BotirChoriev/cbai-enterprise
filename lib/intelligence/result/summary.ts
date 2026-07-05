import type { ConfidenceAssessment } from "@/lib/intelligence/confidence.types";
import type { EvidenceCollection } from "@/lib/intelligence/evidence.types";
import type { IntelligenceRequest } from "@/lib/intelligence/request.types";
import type {
  IntelligenceSubjectEntity,
  IntelligenceSummary,
} from "@/lib/intelligence/result.types";

/** Deterministic executive summary when no evidence is available (BUILD-029). */
export const EMPTY_EVIDENCE_EXECUTIVE_SUMMARY =
  "No verified evidence is currently available.\nThe Intelligence Engine executed successfully in skeleton mode.\nNo recommendation can be produced until evidence sources are connected.";

/**
 * Resolve related entities from request subject scope.
 */
export function resolveRelatedEntities(
  request: IntelligenceRequest,
): IntelligenceSubjectEntity[] {
  return (request.subjectEntities ?? []).map((entity) => ({
    type: entity.type,
    id: entity.id,
    name: entity.name ?? entity.id,
  }));
}

/**
 * Returns true when evidence cannot support intelligence conclusions.
 */
export function isResultEvidenceInsufficient(
  evidence: EvidenceCollection,
): boolean {
  return (
    evidence.items.length === 0 || evidence.sufficiencyStatus === "insufficient"
  );
}

/**
 * Resolve lifecycle state from evidence availability — deterministic only.
 */
export function resolveLifecycleState(
  evidence: EvidenceCollection,
): "draft" | "active" {
  if (isResultEvidenceInsufficient(evidence)) {
    return "draft";
  }

  return "draft";
}

/**
 * Build factual key findings from layer metrics — no conclusions.
 */
export function buildFactualKeyFindings(
  evidence: EvidenceCollection,
  confidence: ConfidenceAssessment,
): string[] {
  const findings: string[] = [
    `Evidence items collected: ${evidence.items.length}.`,
    `Evidence sufficiency: ${evidence.sufficiencyStatus}.`,
    `Confidence score: ${confidence.score} (${confidence.band}).`,
  ];

  if (evidence.metadata?.status) {
    findings.push(`Evidence collection status: ${evidence.metadata.status}.`);
  }

  return findings;
}

/**
 * Build factual caveats from evidence and confidence state — no invented risk claims.
 */
export function buildFactualCaveats(
  evidence: EvidenceCollection,
  confidence: ConfidenceAssessment,
): string[] {
  const caveats: string[] = [];

  if (isResultEvidenceInsufficient(evidence)) {
    caveats.push("Insufficient evidence — no intelligence conclusion is produced.");
  }

  if (confidence.degraded && confidence.degradationReason) {
    caveats.push(confidence.degradationReason);
  }

  return caveats;
}

/**
 * Build {@link IntelligenceSummary} from factual inputs only.
 *
 * Never invents conclusions or recommendations.
 */
export function buildIntelligenceSummary(input: {
  executiveSummary: string;
  evidence: EvidenceCollection;
  confidence: ConfidenceAssessment;
  recommendations: string[];
}): IntelligenceSummary {
  return {
    headline: input.executiveSummary,
    keyFindings: buildFactualKeyFindings(input.evidence, input.confidence),
    caveats: buildFactualCaveats(input.evidence, input.confidence),
    recommendedActions: input.recommendations,
  };
}

/**
 * Resolve intelligence product type from request metadata.
 */
export function resolveIntelligenceType(
  request: IntelligenceRequest,
): import("@/lib/intelligence/request.types").IntelligenceType {
  return request.type ?? "entity";
}

/**
 * Summary builder for the Intelligence Result Layer (BUILD-029).
 *
 * Generates factual summaries only — no conclusions or recommendations.
 */
export class SummaryBuilder {
  /**
   * Build executive summary text deterministically from evidence state.
   */
  buildExecutiveSummary(evidence: EvidenceCollection): string {
    if (isResultEvidenceInsufficient(evidence)) {
      return EMPTY_EVIDENCE_EXECUTIVE_SUMMARY;
    }

    return `Intelligence pipeline completed with ${evidence.items.length} evidence item(s). No automated conclusion is generated in BUILD-029.`;
  }

  /**
   * Build recommendations list — empty when evidence is insufficient.
   */
  buildRecommendations(evidence: EvidenceCollection): string[] {
    if (isResultEvidenceInsufficient(evidence)) {
      return [];
    }

    return [];
  }

  /**
   * Build full summary block from factual components.
   */
  buildSummary(input: {
    executiveSummary: string;
    evidence: EvidenceCollection;
    confidence: ConfidenceAssessment;
    recommendations: string[];
  }): IntelligenceSummary {
    return buildIntelligenceSummary(input);
  }
}

/** Shared default summary builder singleton. */
export const defaultSummaryBuilder = new SummaryBuilder();
