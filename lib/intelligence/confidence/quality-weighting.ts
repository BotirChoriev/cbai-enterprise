import type { EvidenceQualityBand } from "@/lib/intelligence/evidence/quality/quality.types";
import {
  QUALITY_WARNING_DUPLICATE_CONTENT,
  QUALITY_WARNING_LOW,
  QUALITY_WARNING_MISSING_FRESHNESS,
  QUALITY_WARNING_WEAK_PROVENANCE,
} from "@/lib/intelligence/evidence/quality/quality-assessor";

/** Factor score when collection quality summary is absent (BUILD-035). */
export const QUALITY_UNKNOWN_FACTOR_SCORE = 30;

/** Maximum points deducted from composite due to quality warnings. */
export const MAX_QUALITY_WARNING_PENALTY = 25;

/** Per-warning-type penalty applied to composite confidence score. */
export const QUALITY_WARNING_PENALTIES: Record<string, number> = {
  [QUALITY_WARNING_MISSING_FRESHNESS]: 3,
  [QUALITY_WARNING_WEAK_PROVENANCE]: 4,
  [QUALITY_WARNING_DUPLICATE_CONTENT]: 5,
  [QUALITY_WARNING_LOW]: 6,
};

/**
 * Conservative upper caps on confidence when quality band is known.
 *
 * Quality influences confidence — never inflates beyond band ceiling.
 */
export const QUALITY_BAND_CONFIDENCE_CAPS: Record<EvidenceQualityBand, number> = {
  excellent: 100,
  high: 90,
  medium: 75,
  low: 55,
  "very-low": 35,
};

/**
 * Apply conservative weighting to mean overall quality for factor input.
 *
 * Slightly dampens high scores — quality supports confidence, not replaces volume.
 */
export function weightQualityForConfidence(meanOverallScore: number): number {
  const dampened = meanOverallScore * 0.9;
  return Math.max(0, Math.min(100, Math.round(dampened)));
}

/**
 * Compute penalty from quality warning codes (deduplicated by warning type per item).
 */
export function computeQualityWarningPenalty(warnings: readonly string[]): number {
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
    penalty += QUALITY_WARNING_PENALTIES[warningType] ?? 2;
  }

  return Math.min(MAX_QUALITY_WARNING_PENALTY, penalty);
}

/**
 * Apply quality warning penalty to a composite confidence score.
 */
export function applyQualityWarningDegradation(
  score: number,
  penalty: number,
): number {
  return Math.max(0, Math.min(100, Math.round(score - penalty)));
}

/**
 * Apply quality band ceiling to composite score when band is known.
 */
export function applyQualityBandCap(
  score: number,
  band: EvidenceQualityBand,
): number {
  const cap = QUALITY_BAND_CONFIDENCE_CAPS[band];
  return Math.min(score, cap);
}

/**
 * Resolve penalty points for a single warning string.
 */
export function resolveWarningPenalty(warning: string): number {
  const warningType = warning.split(":")[0] ?? warning;
  return QUALITY_WARNING_PENALTIES[warningType] ?? 2;
}
