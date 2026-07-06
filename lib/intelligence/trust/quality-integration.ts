import type { EvidenceCollection } from "@/lib/intelligence/evidence.types";
import type { EvidenceQualityBand } from "@/lib/intelligence/evidence/quality/quality.types";
import {
  QUALITY_WARNING_DUPLICATE_CONTENT,
  QUALITY_WARNING_LOW,
  QUALITY_WARNING_MISSING_FRESHNESS,
  QUALITY_WARNING_WEAK_PROVENANCE,
} from "@/lib/intelligence/evidence/quality/quality-assessor";

/** Trust cap when collection quality summary is unavailable. */
export const TRUST_CAP_QUALITY_UNKNOWN = "quality-unknown";

/** Trust cap when weak provenance quality warnings are present. */
export const TRUST_CAP_WEAK_PROVENANCE = "weak-provenance-quality";

/** Trust cap when missing freshness quality warnings are present. */
export const TRUST_CAP_MISSING_FRESHNESS = "missing-freshness-quality";

/** Trust cap when low-quality evidence warnings are present. */
export const TRUST_CAP_LOW_QUALITY = "low-quality-evidence";

/** Trust cap when duplicate content quality warnings are present. */
export const TRUST_CAP_DUPLICATE_CONTENT = "duplicate-content-quality";

/** Maximum trust score when quality summary is unknown. */
export const TRUST_QUALITY_UNKNOWN_SCORE_CAP = 40;

/** Conservative trust band caps derived from evidence quality band. */
export const QUALITY_BAND_TRUST_CAPS: Record<EvidenceQualityBand, number> = {
  excellent: 100,
  high: 85,
  medium: 65,
  low: 40,
  "very-low": 25,
};

/** Per-warning-type trust score penalty (deduplicated by type). */
export const TRUST_QUALITY_WARNING_PENALTIES: Record<string, number> = {
  [QUALITY_WARNING_MISSING_FRESHNESS]: 5,
  [QUALITY_WARNING_WEAK_PROVENANCE]: 8,
  [QUALITY_WARNING_DUPLICATE_CONTENT]: 6,
  [QUALITY_WARNING_LOW]: 10,
};

/** Maximum total trust penalty from quality warnings. */
export const MAX_TRUST_QUALITY_PENALTY = 30;

/** Mean overall quality below this triggers low-quality trust cap. */
export const TRUST_LOW_QUALITY_MEAN_THRESHOLD = 40;

/**
 * Quality context extracted for trust governance (BUILD-036).
 */
export interface TrustQualityIntegrationContext {
  isKnown: boolean;
  meanOverallScore: number | null;
  qualityBand: EvidenceQualityBand | null;
  qualityWarnings: string[];
  hasWeakProvenance: boolean;
  hasMissingFreshness: boolean;
  hasLowQuality: boolean;
  hasDuplicateContent: boolean;
  trustPenalty: number;
  qualityCapsApplied: string[];
}

/**
 * Quality gate metadata attached to {@link TrustAssessment}.
 */
export interface TrustQualityGate {
  /** Whether quality gates passed without degradation. */
  passed: boolean;
  meanOverallScore: number | null;
  qualityBand: EvidenceQualityBand | null;
  capsApplied: string[];
  penaltyApplied: number;
}

/**
 * Extract trust-relevant quality context from evidence collection.
 */
export function extractTrustQualityContext(
  evidence: EvidenceCollection,
): TrustQualityIntegrationContext {
  const quality = evidence.quality;
  const qualityWarnings = quality?.warnings ?? [];

  const hasWeakProvenance = hasWarningType(
    qualityWarnings,
    QUALITY_WARNING_WEAK_PROVENANCE,
  );
  const hasMissingFreshness = hasWarningType(
    qualityWarnings,
    QUALITY_WARNING_MISSING_FRESHNESS,
  );
  const hasLowQuality = hasWarningType(qualityWarnings, QUALITY_WARNING_LOW);
  const hasDuplicateContent = hasWarningType(
    qualityWarnings,
    QUALITY_WARNING_DUPLICATE_CONTENT,
  );

  const qualityCapsApplied = buildQualityTrustCaps({
    isKnown: Boolean(quality && quality.itemCount > 0),
    meanOverallScore: quality?.meanOverallScore ?? null,
    qualityBand: quality?.band ?? null,
    hasWeakProvenance,
    hasMissingFreshness,
    hasLowQuality,
    hasDuplicateContent,
  });

  return {
    isKnown: Boolean(quality && quality.itemCount > 0),
    meanOverallScore: quality?.meanOverallScore ?? null,
    qualityBand: quality?.band ?? null,
    qualityWarnings,
    hasWeakProvenance,
    hasMissingFreshness,
    hasLowQuality,
    hasDuplicateContent,
    trustPenalty: computeTrustQualityPenalty(qualityWarnings),
    qualityCapsApplied,
  };
}

/**
 * Build quality-related trust caps from collection quality state.
 */
export function buildQualityTrustCaps(input: {
  isKnown: boolean;
  meanOverallScore: number | null;
  qualityBand: EvidenceQualityBand | null;
  hasWeakProvenance: boolean;
  hasMissingFreshness: boolean;
  hasLowQuality: boolean;
  hasDuplicateContent: boolean;
}): string[] {
  const caps: string[] = [];

  if (!input.isKnown) {
    caps.push(TRUST_CAP_QUALITY_UNKNOWN);
    return caps;
  }

  if (input.hasLowQuality) {
    caps.push(TRUST_CAP_LOW_QUALITY);
  }

  if (input.hasWeakProvenance) {
    caps.push(TRUST_CAP_WEAK_PROVENANCE);
  }

  if (input.hasMissingFreshness) {
    caps.push(TRUST_CAP_MISSING_FRESHNESS);
  }

  if (input.hasDuplicateContent) {
    caps.push(TRUST_CAP_DUPLICATE_CONTENT);
  }

  if (
    input.meanOverallScore !== null &&
    input.meanOverallScore < TRUST_LOW_QUALITY_MEAN_THRESHOLD
  ) {
    if (!caps.includes(TRUST_CAP_LOW_QUALITY)) {
      caps.push(TRUST_CAP_LOW_QUALITY);
    }
  }

  return caps;
}

/**
 * Compute trust score penalty from quality warnings.
 */
export function computeTrustQualityPenalty(warnings: readonly string[]): number {
  if (warnings.length === 0) {
    return 0;
  }

  let penalty = 0;
  const appliedTypes = new Set<string>();

  for (const warning of warnings) {
    const warningType = warning.split(":")[0] ?? warning;

    if (appliedTypes.has(warningType)) {
      continue;
    }

    appliedTypes.add(warningType);
    penalty += TRUST_QUALITY_WARNING_PENALTIES[warningType] ?? 3;
  }

  return Math.min(MAX_TRUST_QUALITY_PENALTY, penalty);
}

/**
 * Apply quality band ceiling to trust score.
 */
export function applyQualityBandTrustCap(
  score: number,
  band: EvidenceQualityBand,
): number {
  return Math.min(score, QUALITY_BAND_TRUST_CAPS[band]);
}

/**
 * Apply quality penalties and band caps to trust score.
 */
export function applyQualityTrustAdjustments(
  score: number,
  context: TrustQualityIntegrationContext,
): number {
  let adjusted = score;

  if (!context.isKnown) {
    adjusted = Math.min(adjusted, TRUST_QUALITY_UNKNOWN_SCORE_CAP);
  }

  if (context.isKnown && context.qualityBand) {
    adjusted = applyQualityBandTrustCap(adjusted, context.qualityBand);
  }

  adjusted = Math.max(0, adjusted - context.trustPenalty);

  return Math.max(0, Math.min(100, Math.round(adjusted)));
}

/**
 * Build trust-specific warnings from quality context.
 */
export function buildTrustQualityWarnings(
  context: TrustQualityIntegrationContext,
): string[] {
  const warnings: string[] = [];

  if (!context.isKnown) {
    warnings.push("trust:quality-unknown");
  }

  if (context.hasWeakProvenance) {
    warnings.push("trust:weak-provenance");
  }

  if (context.hasMissingFreshness) {
    warnings.push("trust:missing-freshness");
  }

  if (context.hasLowQuality) {
    warnings.push("trust:low-quality-evidence");
  }

  if (context.hasDuplicateContent) {
    warnings.push("trust:duplicate-content");
  }

  if (context.trustPenalty > 0) {
    warnings.push(`trust:quality-penalty-applied:${context.trustPenalty}`);
  }

  return warnings;
}

/**
 * Build quality gate summary for trust assessment output.
 */
export function buildTrustQualityGate(
  context: TrustQualityIntegrationContext,
): TrustQualityGate {
  const passed =
    context.isKnown &&
    !context.hasLowQuality &&
    !context.hasWeakProvenance &&
    context.trustPenalty === 0;

  return {
    passed,
    meanOverallScore: context.meanOverallScore,
    qualityBand: context.qualityBand,
    capsApplied: [...context.qualityCapsApplied],
    penaltyApplied: context.trustPenalty,
  };
}

function hasWarningType(warnings: readonly string[], type: string): boolean {
  return warnings.some((warning) => warning.startsWith(`${type}:`));
}
