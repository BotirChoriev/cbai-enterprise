import type { ConfidenceFactor } from "@/lib/intelligence/confidence.types";
import type { EvidenceCollection } from "@/lib/intelligence/evidence.types";
import type { EvidenceQualityBand } from "@/lib/intelligence/evidence/quality/quality.types";
import {
  applyQualityBandCap,
  applyQualityWarningDegradation,
  computeQualityWarningPenalty,
  QUALITY_UNKNOWN_FACTOR_SCORE,
  weightQualityForConfidence,
} from "@/lib/intelligence/confidence/quality-weighting";
import { clampConfidenceScore } from "@/lib/intelligence/confidence/bands";

/** Weight for evidence-quality factor — must match {@link CONFIDENCE_FACTOR_WEIGHTS}. */
const EVIDENCE_QUALITY_FACTOR_WEIGHT = 0.2;

/**
 * Quality context extracted from an {@link EvidenceCollection} for confidence.
 */
export interface ConfidenceQualityIntegrationContext {
  /** Whether {@link EvidenceCollection.quality} is present. */
  isKnown: boolean;
  meanOverallScore: number | null;
  qualityBand: EvidenceQualityBand | null;
  qualityWarnings: string[];
  meanProvenanceScore: number | null;
  warningPenalty: number;
}

/**
 * Summary attached to {@link ConfidenceAssessment} for explainability (BUILD-035).
 */
export interface ConfidenceQualityIntegrationSummary {
  meanOverallScore: number | null;
  qualityBand: EvidenceQualityBand | null;
  qualityWarnings: string[];
  meanProvenanceScore: number | null;
  warningPenaltyApplied: number;
  qualityBandCapApplied: number | null;
  qualityUnknown: boolean;
}

/**
 * Extract quality integration context from evidence collection metadata.
 */
export function extractQualityIntegrationContext(
  evidence: EvidenceCollection,
): ConfidenceQualityIntegrationContext {
  const quality = evidence.quality;

  if (!quality || quality.itemCount === 0) {
    return {
      isKnown: false,
      meanOverallScore: null,
      qualityBand: null,
      qualityWarnings: [],
      meanProvenanceScore: computeMeanProvenanceScore(evidence),
      warningPenalty: 0,
    };
  }

  const qualityWarnings = quality.warnings ?? [];

  return {
    isKnown: true,
    meanOverallScore: quality.meanOverallScore,
    qualityBand: quality.band,
    qualityWarnings,
    meanProvenanceScore: computeMeanProvenanceScore(evidence),
    warningPenalty: computeQualityWarningPenalty(qualityWarnings),
  };
}

/**
 * Compute mean provenance dimension score from per-item quality assessments.
 */
export function computeMeanProvenanceScore(
  evidence: EvidenceCollection,
): number | null {
  const scores: number[] = [];

  for (const item of evidence.items) {
    const provenance = item.quality?.dimensions.find(
      (dimension) => dimension.id === "provenance",
    );

    if (provenance?.status === "known" && provenance.score !== null) {
      scores.push(provenance.score);
    }
  }

  if (scores.length === 0) {
    return null;
  }

  return Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length);
}

/**
 * Build the evidence quality confidence factor from collection quality summary.
 */
export function buildEvidenceQualityFactor(
  evidence: EvidenceCollection,
): ConfidenceFactor {
  const weight = EVIDENCE_QUALITY_FACTOR_WEIGHT;
  const context = extractQualityIntegrationContext(evidence);

  if (evidence.items.length === 0) {
    return {
      id: "evidence-quality",
      label: "Evidence Quality",
      weight,
      score: 0,
      detail: "No evidence items — quality factor not applicable.",
    };
  }

  if (!context.isKnown || context.meanOverallScore === null) {
    return {
      id: "evidence-quality",
      label: "Evidence Quality",
      weight,
      score: QUALITY_UNKNOWN_FACTOR_SCORE,
      detail:
        "Collection quality summary unavailable — conservative substitute score applied.",
    };
  }

  const weightedScore = weightQualityForConfidence(context.meanOverallScore);
  const provenanceDetail =
    context.meanProvenanceScore !== null
      ? ` Mean provenance dimension: ${context.meanProvenanceScore}/100.`
      : "";

  return {
    id: "evidence-quality",
    label: "Evidence Quality",
    weight,
    score: weightedScore,
    detail: `Collection quality band "${context.qualityBand}" — mean overall score ${context.meanOverallScore}/100 (weighted ${weightedScore}/100).${provenanceDetail}`,
  };
}

/**
 * Apply quality integration adjustments to raw composite confidence score.
 *
 * Quality influences confidence conservatively — never replaces evidence volume.
 */
export function applyQualityIntegrationAdjustments(
  rawScore: number,
  context: ConfidenceQualityIntegrationContext,
): { score: number; summary: ConfidenceQualityIntegrationSummary } {
  let score = clampConfidenceScore(rawScore);
  let qualityBandCapApplied: number | null = null;

  if (context.isKnown && context.qualityBand) {
    const capped = applyQualityBandCap(score, context.qualityBand);

    if (capped < score) {
      qualityBandCapApplied = capped;
      score = capped;
    }
  }

  const warningPenaltyApplied = context.warningPenalty;
  score = applyQualityWarningDegradation(score, warningPenaltyApplied);

  if (!context.isKnown) {
    score = Math.min(score, 50);
  }

  return {
    score: clampConfidenceScore(score),
    summary: {
      meanOverallScore: context.meanOverallScore,
      qualityBand: context.qualityBand,
      qualityWarnings: [...context.qualityWarnings],
      meanProvenanceScore: context.meanProvenanceScore,
      warningPenaltyApplied,
      qualityBandCapApplied,
      qualityUnknown: !context.isKnown,
    },
  };
}

/**
 * Build degradation reason text from quality integration state.
 */
export function buildQualityDegradationReason(
  context: ConfidenceQualityIntegrationContext,
  summary: ConfidenceQualityIntegrationSummary,
  deferredFactorsActive: boolean,
): string | undefined {
  const reasons: string[] = [];

  if (!context.isKnown) {
    reasons.push(
      "Collection quality summary unavailable — confidence capped conservatively.",
    );
  }

  if (summary.warningPenaltyApplied > 0) {
    reasons.push(
      `Quality warnings applied ${summary.warningPenaltyApplied}-point confidence reduction.`,
    );
  }

  if (summary.qualityBandCapApplied !== null) {
    reasons.push(
      `Quality band "${context.qualityBand}" capped confidence at ${summary.qualityBandCapApplied}.`,
    );
  }

  if (deferredFactorsActive) {
    reasons.push(
      "Graph connectivity and entity signal factors are not yet implemented.",
    );
  }

  if (reasons.length === 0) {
    return undefined;
  }

  return reasons.join(" ");
}
