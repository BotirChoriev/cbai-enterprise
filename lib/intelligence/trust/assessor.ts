import type { ConfidenceAssessment } from "@/lib/intelligence/confidence.types";
import type { EvidenceCollection } from "@/lib/intelligence/evidence.types";
import type { IntelligenceRequest } from "@/lib/intelligence/request.types";
import type { TrustAssessment } from "@/lib/intelligence/trust.types";
import {
  applyGovernanceGates,
  buildGovernanceTrustReason,
} from "@/lib/intelligence/trust/governance-rules";
import {
  resolveTrustLevel,
  resolveTrustPermissions,
} from "@/lib/intelligence/trust/levels";
import {
  applyQualityTrustAdjustments,
  buildQualityTrustCaps,
  buildTrustQualityGate,
  buildTrustQualityWarnings,
  extractTrustQualityContext,
} from "@/lib/intelligence/trust/quality-integration";
import {
  applyTrustScoreCaps,
  buildTrustCaps,
  buildTrustReason,
  computeTrustScoreFromEvidence,
  isTrustScoreCappedToZero,
  resolveSourceTrustLevel,
} from "@/lib/intelligence/trust/rules";

/** Semantic version of the default trust assessor. */
export const TRUST_ASSESSOR_VERSION = "0.2.0-quality-integration";

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
 * Default trust assessor for the CBAI Intelligence Engine.
 *
 * BUILD-036 integrates evidence quality into trust scoring and governance
 * while keeping trust independent from confidence magnitude.
 */
export class DefaultTrustAssessor implements TrustAssessor {
  /**
   * Assess trust from evidence state, quality gates, and governance caps.
   */
  async assess(
    request: IntelligenceRequest,
    evidence: EvidenceCollection,
    confidence: ConfidenceAssessment,
  ): Promise<TrustAssessment> {
    const qualityContext = extractTrustQualityContext(evidence);
    const baseCaps = buildTrustCaps(request, evidence, confidence);
    const qualityCaps =
      evidence.items.length === 0
        ? []
        : buildQualityTrustCaps({
            isKnown: qualityContext.isKnown,
            meanOverallScore: qualityContext.meanOverallScore,
            qualityBand: qualityContext.qualityBand,
            hasWeakProvenance: qualityContext.hasWeakProvenance,
            hasMissingFreshness: qualityContext.hasMissingFreshness,
            hasLowQuality: qualityContext.hasLowQuality,
            hasDuplicateContent: qualityContext.hasDuplicateContent,
          });

    const capsApplied = [...baseCaps, ...qualityCaps];
    const rawScore = computeTrustScoreFromEvidence(evidence);
    const cappedScore = applyTrustScoreCaps(rawScore, capsApplied);
    const trustScore = applyQualityTrustAdjustments(cappedScore, qualityContext);
    const zeroCapped = isTrustScoreCappedToZero(capsApplied);

    const trustLevel = zeroCapped ? "unverified" : resolveTrustLevel(trustScore);
    const basePermissions = zeroCapped
      ? resolveTrustPermissions("unverified")
      : resolveTrustPermissions(trustLevel);

    const { permissions, governanceGate } = zeroCapped
      ? {
          permissions: basePermissions,
          governanceGate: {
            passed: false,
            automationPermitted: false,
            recommendationPermitted: false,
            executionPermitted: false,
            minimumLevels: {
              recommendation: "moderate" as const,
              execution: "verified" as const,
            },
            blockedActions: ["no-evidence-trust-baseline"],
          },
        }
      : applyGovernanceGates(trustLevel, trustScore, qualityContext);

    const qualityGate = buildTrustQualityGate(qualityContext);
    const trustWarnings = buildTrustQualityWarnings(qualityContext);
    const baseReason = buildTrustReason(evidence, capsApplied);

    return {
      trustLevel: zeroCapped ? "unverified" : trustLevel,
      trustScore: zeroCapped ? 0 : trustScore,
      allowAutomation: permissions.allowAutomation,
      allowRecommendation: permissions.allowRecommendation,
      allowExecution: permissions.allowExecution,
      reason: buildGovernanceTrustReason(baseReason, qualityContext, governanceGate),
      producer: {
        type: "reasoning-engine",
        id: DEFAULT_TRUST_ASSESSOR_ID,
        name: "Default Trust Assessor",
        version: TRUST_ASSESSOR_VERSION,
      },
      sourceTrustLevel: resolveSourceTrustLevel(evidence),
      capsApplied,
      humanVerified: false,
      qualityGate,
      governanceGate,
      trustWarnings: trustWarnings.length > 0 ? trustWarnings : undefined,
    };
  }
}

/** Shared default trust assessor singleton used by the intelligence engine pipeline. */
export const defaultTrustAssessor = new DefaultTrustAssessor();
