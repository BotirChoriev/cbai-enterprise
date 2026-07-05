import type { ConfidenceAssessment } from "@/lib/intelligence/confidence.types";
import {
  resolveConfidenceBand,
} from "@/lib/intelligence/confidence/bands";
import {
  buildConfidenceFactors,
  computeCompositeConfidenceScore,
  isEvidenceConfidenceInsufficient,
} from "@/lib/intelligence/confidence/factors";
import type { EvidenceCollection } from "@/lib/intelligence/evidence.types";
import type { IntelligenceRequest } from "@/lib/intelligence/request.types";

/** Semantic version of the default confidence assessor. */
export const CONFIDENCE_ASSESSOR_VERSION = "0.1.0-foundation";

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
 * Default confidence assessor for the CBAI Intelligence Engine (BUILD-024).
 *
 * Computes conservative confidence from evidence collection state only.
 * Graph connectivity, entity signals, memory, and AI scoring are deferred.
 */
export class DefaultConfidenceAssessor implements ConfidenceAssessor {
  /**
   * Assess confidence using evidence collection state only.
   *
   * When evidence is empty or insufficient, returns score 0 and band
   * `insufficient` with factors explaining the missing support.
   */
  async assess(
    request: IntelligenceRequest,
    evidence: EvidenceCollection,
  ): Promise<ConfidenceAssessment> {
    void request;

    const factors = buildConfidenceFactors(evidence);
    const insufficient = isEvidenceConfidenceInsufficient(evidence);

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
      };
    }

    const score = computeCompositeConfidenceScore(factors);
    const band = resolveConfidenceBand(score);
    const deferredFactorsActive = factors.some(
      (factor) =>
        (factor.id === "graph-connectivity" ||
          factor.id === "entity-signal-quality") &&
        factor.score === 0,
    );

    return {
      score,
      band,
      factors,
      degraded: deferredFactorsActive,
      degradationReason: deferredFactorsActive
        ? "Confidence computed from evidence factors only — graph and entity signal factors are not yet implemented."
        : undefined,
    };
  }
}

/** Shared default assessor singleton used by the intelligence engine pipeline. */
export const defaultConfidenceAssessor = new DefaultConfidenceAssessor();
