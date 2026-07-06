import type { Evidence } from "@/lib/intelligence/evidence.types";
import {
  buildQualityAssessmentContext,
  isDuplicateExcerpt,
  isWeakProvenance,
  LOW_QUALITY_OVERALL_THRESHOLD,
  scoreCompleteness,
  scoreConsistency,
  scoreFreshness,
  scoreProvenance,
  scoreRelevance,
  type QualityAssessmentContext,
} from "@/lib/intelligence/evidence/quality/quality-rules";
import {
  computeMeanOverallScore,
  computeOverallQualityScore,
  resolveQualityBand,
} from "@/lib/intelligence/evidence/quality/quality-score";
import type {
  EvidenceCollectionQualitySummary,
  EvidenceQualityAssessment,
  EvidenceQualityAssessmentResult,
  EvidenceQualityDimensionScore,
} from "@/lib/intelligence/evidence/quality/quality.types";

/** Stable identifier for audit metadata. */
export const DEFAULT_EVIDENCE_QUALITY_ASSESSOR_ID =
  "default-evidence-quality-assessor";

/** Semantic version of the default evidence quality assessor. */
export const EVIDENCE_QUALITY_ASSESSOR_VERSION = "0.1.0-quality";

/** Warning when overall quality is below threshold. */
export const QUALITY_WARNING_LOW = "low-quality-evidence";

/** Warning when freshness metadata is absent. */
export const QUALITY_WARNING_MISSING_FRESHNESS = "missing-freshness";

/** Warning when provenance is weak or undeclared. */
export const QUALITY_WARNING_WEAK_PROVENANCE = "weak-provenance";

/** Warning when excerpt duplicates another item in the collection. */
export const QUALITY_WARNING_DUPLICATE_CONTENT = "duplicate-content";

/**
 * Contract for the Evidence Quality Assessment Layer (BUILD-034).
 */
export interface EvidenceQualityAssessor {
  /**
   * Assess quality for all items in a collected evidence set.
   */
  assessCollection(items: Evidence[]): EvidenceQualityAssessmentResult;
}

/**
 * Default evidence quality assessor — deterministic rules only.
 *
 * Does not call AI models or external services. Confidence layer does not
 * consume quality scores until BUILD-035.
 */
export class DefaultEvidenceQualityAssessor implements EvidenceQualityAssessor {
  private readonly assessorId: string;
  private readonly assessorVersion: string;

  constructor(
    assessorId: string = DEFAULT_EVIDENCE_QUALITY_ASSESSOR_ID,
    assessorVersion: string = EVIDENCE_QUALITY_ASSESSOR_VERSION,
  ) {
    this.assessorId = assessorId;
    this.assessorVersion = assessorVersion;
  }

  assessCollection(items: Evidence[]): EvidenceQualityAssessmentResult {
    const assessedAt = new Date().toISOString();
    const context = buildQualityAssessmentContext(items);
    const assessedItems: Evidence[] = [];
    const itemScores: number[] = [];
    const allWarnings = new Set<string>();

    for (const item of items) {
      const quality = this.assessItem(item, context, assessedAt);
      assessedItems.push({ ...item, quality });
      itemScores.push(quality.overallScore);

      for (const warning of quality.warnings) {
        allWarnings.add(warning);
      }
    }

    const meanOverallScore = computeMeanOverallScore(itemScores);
    const summary: EvidenceCollectionQualitySummary = {
      meanOverallScore,
      band: resolveQualityBand(meanOverallScore),
      itemCount: assessedItems.length,
      warnings: Array.from(allWarnings).sort(),
      assessedAt,
      assessorId: this.assessorId,
      assessorVersion: this.assessorVersion,
    };

    return { items: assessedItems, summary };
  }

  /**
   * Assess a single evidence item within collection context.
   */
  assessItem(
    evidence: Evidence,
    context: QualityAssessmentContext,
    assessedAt: string,
  ): EvidenceQualityAssessment {
    const dimensions: EvidenceQualityDimensionScore[] = [
      scoreCompleteness(evidence),
      scoreProvenance(evidence),
      scoreRelevance(evidence),
      scoreFreshness(evidence),
      scoreConsistency(evidence, context),
    ];

    const overallScore = computeOverallQualityScore(dimensions);
    const band = resolveQualityBand(overallScore);
    const warnings = buildItemQualityWarnings(evidence, dimensions, overallScore, context);

    return {
      dimensions,
      overallScore,
      band,
      warnings,
      assessedAt,
      assessorId: this.assessorId,
      assessorVersion: this.assessorVersion,
    };
  }
}

function buildItemQualityWarnings(
  evidence: Evidence,
  dimensions: EvidenceQualityDimensionScore[],
  overallScore: number,
  context: QualityAssessmentContext,
): string[] {
  const warnings: string[] = [];
  const freshness = dimensions.find((dimension) => dimension.id === "freshness");

  if (freshness?.status === "unknown") {
    warnings.push(`${QUALITY_WARNING_MISSING_FRESHNESS}:${evidence.id}`);
  }

  if (isWeakProvenance(evidence)) {
    warnings.push(`${QUALITY_WARNING_WEAK_PROVENANCE}:${evidence.id}`);
  }

  if (isDuplicateExcerpt(evidence, context)) {
    warnings.push(`${QUALITY_WARNING_DUPLICATE_CONTENT}:${evidence.id}`);
  }

  if (overallScore < LOW_QUALITY_OVERALL_THRESHOLD) {
    warnings.push(`${QUALITY_WARNING_LOW}:${evidence.id}`);
  }

  return warnings;
}

/** Shared default quality assessor singleton. */
export const defaultEvidenceQualityAssessor = new DefaultEvidenceQualityAssessor();
