/**
 * CBAI Intelligence Engine — Trust Assessment Layer (BUILD-025).
 *
 * Evidence-grounded organizational trust. Separate from confidence.
 * No external services, mock intelligence, or fake AI decisions.
 *
 * @see docs/build-025-report.md
 */

export {
  DEFAULT_TRUST_ASSESSOR_ID,
  DefaultTrustAssessor,
  defaultTrustAssessor,
  TRUST_ASSESSOR_VERSION,
  type TrustAssessor,
} from "@/lib/intelligence/trust/assessor";

export {
  clampTrustScore,
  isUnverifiedTrustLevel,
  resolveTrustLevel,
  resolveTrustPermissions,
  TRUST_LEVEL_HIGH_MIN,
  TRUST_LEVEL_LABELS,
  TRUST_LEVEL_MODERATE_MIN,
  TRUST_LEVEL_LOW_MIN,
  TRUST_LEVEL_VERIFIED_MIN,
  TRUST_LEVEL_PERMISSIONS,
  TRUST_LEVELS_DESCENDING,
} from "@/lib/intelligence/trust/levels";

export {
  applyGovernanceGates,
  buildGovernanceTrustReason,
  GOVERNANCE_MIN_EXECUTION_LEVEL,
  GOVERNANCE_MIN_RECOMMENDATION_LEVEL,
  trustLevelMeetsMinimum,
  type TrustGovernanceGate,
} from "@/lib/intelligence/trust/governance-rules";

export {
  applyQualityBandTrustCap,
  applyQualityTrustAdjustments,
  buildQualityTrustCaps,
  buildTrustQualityGate,
  buildTrustQualityWarnings,
  computeTrustQualityPenalty,
  extractTrustQualityContext,
  MAX_TRUST_QUALITY_PENALTY,
  QUALITY_BAND_TRUST_CAPS,
  TRUST_CAP_DUPLICATE_CONTENT,
  TRUST_CAP_LOW_QUALITY,
  TRUST_CAP_MISSING_FRESHNESS,
  TRUST_CAP_QUALITY_UNKNOWN,
  TRUST_CAP_WEAK_PROVENANCE,
  TRUST_LOW_QUALITY_MEAN_THRESHOLD,
  TRUST_QUALITY_UNKNOWN_SCORE_CAP,
  type TrustQualityGate,
  type TrustQualityIntegrationContext,
} from "@/lib/intelligence/trust/quality-integration";

export {
  applyTrustScoreCaps,
  buildTrustCaps,
  buildTrustReason,
  computeTrustScoreFromEvidence,
  isTrustEvidenceInsufficient,
  isTrustScoreCappedToZero,
  resolveSourceTrustLevel,
  TRUST_CAP_CONFIDENCE_DEGRADED,
  TRUST_CAP_CONTRADICTION_OPEN,
  TRUST_CAP_INSUFFICIENT_EVIDENCE,
  TRUST_CAP_NO_EVIDENCE,
  TRUST_CAP_NO_SOURCES_CONNECTED,
} from "@/lib/intelligence/trust/rules";
