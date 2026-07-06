import type { ConfidenceAssessment } from "@/lib/intelligence/confidence.types";
import {
  resolveConfidenceBand,
} from "@/lib/intelligence/confidence/bands";
import {
  buildConfidenceFactors,
  computeCompositeConfidenceScore,
  isEvidenceConfidenceInsufficient,
} from "@/lib/intelligence/confidence/factors";
import {
  applyQualityIntegrationAdjustments,
  buildQualityDegradationReason,
  extractQualityIntegrationContext,
} from "@/lib/intelligence/confidence/quality-integration";
import type { EvidenceCollection } from "@/lib/intelligence/evidence.types";
import type { IntelligenceRequest } from "@/lib/intelligence/request.types";

/** Semantic version of the default confidence assessor. */
export const CONFIDENCE_ASSESSOR_VERSION = "0.2.0-quality-integration";

/** Stable identifier for audit traces and future metadata. */
export const DEFAULT_CONFIDENCE_ASSESSOR_ID = "default-confidence-assessor";

/**
 * Contract for the CBAI Confidence Assessment Layer.
 *
 * Produces a {@link ConfidenceAssessment} from request context and
 * collected evidence. Does not assess trust, predict outcomes, or call AI.
 *
 * @see docs/CBAI-Intelligence-Specification-v1.md §4
 */
export interface ConfidenceAssessor {
  /**
   * Assess confidence for an intelligence run.
   *
   * @param request - Intelligence request envelope
   * @param evidence - Evidence collection from the Evidence Layer
   * @returns Composite confidence assessment with factor breakdown
   */
  assess(
    request: IntelligenceRequest,
    evidence: EvidenceCollection,
  ): Promise<ConfidenceAssessment>;
}

/**
 * Default confidence assessor for the CBAI Intelligence Engine.
 *
 * BUILD-035 integrates {@link EvidenceCollection.quality} into confidence
 * scoring conservatively. Trust assessment is unchanged.
 */
export class DefaultConfidenceAssessor implements ConfidenceAssessor {
  /**
   * Assess confidence using evidence volume, relevance, quality, and
   * deferred graph/entity factors.
   */
  async assess(
    request: IntelligenceRequest,
    evidence: EvidenceCollection,
  ): Promise<ConfidenceAssessment> {
    void request;

    const factors = buildConfidenceFactors(evidence);
    const insufficient = isEvidenceConfidenceInsufficient(evidence);
    const qualityContext = extractQualityIntegrationContext(evidence);

    if (insufficient) {
      return {
        score: 0,
        band: "insufficient",
        factors,
        degraded: true,
        degradationReason:
          evidence.items.length === 0
            ? "Conservative confidence cap — no evidence items available to justify a non-zero score."
            : "Conservative confidence cap — evidence sufficiency status is insufficient.",
        qualityIntegration: {
          meanOverallScore: qualityContext.meanOverallScore,
          qualityBand: qualityContext.qualityBand,
          qualityWarnings: qualityContext.qualityWarnings,
          meanProvenanceScore: qualityContext.meanProvenanceScore,
          warningPenaltyApplied: 0,
          qualityBandCapApplied: null,
          qualityUnknown: !qualityContext.isKnown,
        },
      };
    }

    const rawScore = computeCompositeConfidenceScore(factors);
    const { score, summary } = applyQualityIntegrationAdjustments(
      rawScore,
      qualityContext,
    );
    const band = resolveConfidenceBand(score);

    const deferredFactorsActive = factors.some(
      (factor) =>
        (factor.id === "graph-connectivity" ||
          factor.id === "entity-signal-quality") &&
        factor.score === 0,
    );

    const qualityDegraded =
      !qualityContext.isKnown ||
      summary.warningPenaltyApplied > 0 ||
      summary.qualityBandCapApplied !== null;

    const degraded = deferredFactorsActive || qualityDegraded;

    return {
      score,
      band,
      factors,
      degraded,
      degradationReason: buildQualityDegradationReason(
        qualityContext,
        summary,
        deferredFactorsActive,
      ),
      qualityIntegration: summary,
    };
  }
}

/** Shared default assessor singleton used by the intelligence engine pipeline. */
export const defaultConfidenceAssessor = new DefaultConfidenceAssessor();
