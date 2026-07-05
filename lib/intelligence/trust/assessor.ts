import type { ConfidenceAssessment } from "@/lib/intelligence/confidence.types";
import type { EvidenceCollection } from "@/lib/intelligence/evidence.types";
import type { IntelligenceRequest } from "@/lib/intelligence/request.types";
import type { TrustAssessment } from "@/lib/intelligence/trust.types";
import {
  resolveTrustLevel,
  resolveTrustPermissions,
} from "@/lib/intelligence/trust/levels";
import {
  applyTrustScoreCaps,
  buildTrustCaps,
  buildTrustReason,
  computeTrustScoreFromEvidence,
  isTrustScoreCappedToZero,
  resolveSourceTrustLevel,
} from "@/lib/intelligence/trust/rules";

/** Semantic version of the default trust assessor. */
export const TRUST_ASSESSOR_VERSION = "0.1.0-foundation";

/** Stable identifier for audit traces and governance metadata. */
export const DEFAULT_TRUST_ASSESSOR_ID = "default-trust-assessor";

/**
 * Contract for the CBAI Trust Assessment Layer.
 *
 * Determines organizational reliance permissions from evidence grounding.
 * Does not copy confidence scores or connect to external services.
 *
 * @see docs/CBAI-Intelligence-Specification-v1.md §5
 */
export interface TrustAssessor {
  /**
   * Assess organizational trust for an intelligence run.
   *
   * @param request - Intelligence request envelope
   * @param evidence - Evidence collection from the Evidence Layer
   * @param confidence - Confidence assessment (used for caps only, not score)
   * @returns Trust assessment with governance permissions
   */
  assess(
    request: IntelligenceRequest,
    evidence: EvidenceCollection,
    confidence: ConfidenceAssessment,
  ): Promise<TrustAssessment>;
}

/**
 * Default trust assessor for the CBAI Intelligence Engine (BUILD-025).
 *
 * Computes conservative, evidence-grounded trust independent of
 * confidence score magnitude. Empty evidence yields unverified / score 0.
 */
export class DefaultTrustAssessor implements TrustAssessor {
  /**
   * Assess trust from evidence state with governance caps.
   *
   * When evidence is empty: trustLevel `unverified`, trustScore 0,
   * all action permissions false, reason "No verified evidence available."
   */
  async assess(
    request: IntelligenceRequest,
    evidence: EvidenceCollection,
    confidence: ConfidenceAssessment,
  ): Promise<TrustAssessment> {
    const capsApplied = buildTrustCaps(request, evidence, confidence);
    const rawScore = computeTrustScoreFromEvidence(evidence);
    const trustScore = applyTrustScoreCaps(rawScore, capsApplied);
    const trustLevel = resolveTrustLevel(trustScore);
    const permissions = isTrustScoreCappedToZero(capsApplied)
      ? resolveTrustPermissions("unverified")
      : resolveTrustPermissions(trustLevel);

    return {
      trustLevel: isTrustScoreCappedToZero(capsApplied) ? "unverified" : trustLevel,
      trustScore,
      allowAutomation: permissions.allowAutomation,
      allowRecommendation: permissions.allowRecommendation,
      allowExecution: permissions.allowExecution,
      reason: buildTrustReason(evidence, capsApplied),
      producer: {
        type: "reasoning-engine",
        id: DEFAULT_TRUST_ASSESSOR_ID,
        name: "Default Trust Assessor",
        version: TRUST_ASSESSOR_VERSION,
      },
      sourceTrustLevel: resolveSourceTrustLevel(evidence),
      capsApplied,
      humanVerified: false,
    };
  }
}

/** Shared default trust assessor singleton used by the intelligence engine pipeline. */
export const defaultTrustAssessor = new DefaultTrustAssessor();
