import type {
  Evidence,
  EvidenceStaleness,
  ProvenanceStrength,
} from "@/lib/intelligence/evidence.types";
import type { EvidenceQualityDimensionScore } from "@/lib/intelligence/evidence/quality/quality.types";

/** Conservative score used in overall composite when freshness is unknown. */
export const FRESHNESS_UNKNOWN_CONSERVATIVE_SCORE = 35;

/** Minimum excerpt length considered structurally complete. */
export const MIN_COMPLETE_EXCERPT_LENGTH = 20;

/** Overall score below this threshold triggers low-quality warning. */
export const LOW_QUALITY_OVERALL_THRESHOLD = 40;

/** Provenance strength below this mapped score triggers weak-provenance warning. */
export const WEAK_PROVENANCE_SCORE_THRESHOLD = 40;

/** Context for consistency scoring across a collection. */
export interface QualityAssessmentContext {
  /** Normalized excerpt → first evidence id that used it. */
  excerptFirstId: Map<string, string>;
  /** Total items in collection. */
  itemCount: number;
}

/**
 * Build assessment context for collection-wide consistency checks.
 */
export function buildQualityAssessmentContext(
  items: Evidence[],
): QualityAssessmentContext {
  const excerptFirstId = new Map<string, string>();

  for (const item of items) {
    const key = normalizeExcerpt(item.excerpt);

    if (!excerptFirstId.has(key)) {
      excerptFirstId.set(key, item.id);
    }
  }

  return { excerptFirstId, itemCount: items.length };
}

/**
 * Score structural completeness from available evidence fields.
 */
export function scoreCompleteness(evidence: Evidence): EvidenceQualityDimensionScore {
  let points = 0;
  const checks: string[] = [];

  if (evidence.id.trim()) {
    points += 15;
    checks.push("id");
  }

  if (evidence.entityId.trim() && evidence.entityName.trim()) {
    points += 20;
    checks.push("entity-ref");
  }

  if (evidence.source.class) {
    points += 20;
    checks.push("source-class");
  }

  if (evidence.excerpt.trim().length >= MIN_COMPLETE_EXCERPT_LENGTH) {
    points += 25;
    checks.push("excerpt");
  } else if (evidence.excerpt.trim().length > 0) {
    points += 10;
    checks.push("excerpt-short");
  }

  if (evidence.source.ref?.trim()) {
    points += 10;
    checks.push("source-ref");
  }

  if (evidence.source.label?.trim()) {
    points += 10;
    checks.push("source-label");
  }

  return {
    id: "completeness",
    label: "Completeness",
    score: Math.min(100, points),
    status: "known",
    detail: `Structural fields present: ${checks.join(", ") || "none"}.`,
  };
}

/**
 * Score provenance from declared {@link ProvenanceStrength} only.
 */
export function scoreProvenance(evidence: Evidence): EvidenceQualityDimensionScore {
  const strength = evidence.source.provenanceStrength;
  const score = mapProvenanceStrength(strength);

  return {
    id: "provenance",
    label: "Provenance",
    score,
    status: "known",
    detail: strength
      ? `Declared provenance strength: ${strength}.`
      : "No provenance strength declared on evidence source.",
  };
}

/**
 * Deterministic mapping from provenance strength to score.
 */
export function mapProvenanceStrength(
  strength: ProvenanceStrength | undefined,
): number {
  switch (strength) {
    case "verified":
      return 90;
    case "inferred":
      return 55;
    case "unverified":
      return 25;
    default:
      return 15;
  }
}

/**
 * Score relevance from the evidence item's existing relevance field.
 */
export function scoreRelevance(evidence: Evidence): EvidenceQualityDimensionScore {
  return {
    id: "relevance",
    label: "Relevance",
    score: evidence.relevance,
    status: "known",
    detail: `Adapter-assigned relevance: ${evidence.relevance}/100.`,
  };
}

/**
 * Score freshness from staleness metadata only — never invented.
 */
export function scoreFreshness(evidence: Evidence): EvidenceQualityDimensionScore {
  if (evidence.staleness === undefined) {
    return {
      id: "freshness",
      label: "Freshness",
      score: null,
      status: "unknown",
      detail: "Freshness cannot be determined — no staleness metadata on evidence item.",
    };
  }

  return {
    id: "freshness",
    label: "Freshness",
    score: mapStalenessScore(evidence.staleness),
    status: "known",
    detail: `Declared staleness: ${evidence.staleness}.`,
  };
}

function mapStalenessScore(staleness: EvidenceStaleness): number {
  switch (staleness) {
    case "fresh":
      return 85;
    case "aging":
      return 50;
    case "stale":
      return 20;
    default:
      return 35;
  }
}

/**
 * Score consistency based on duplicate excerpt detection within the collection.
 */
export function scoreConsistency(
  evidence: Evidence,
  context: QualityAssessmentContext,
): EvidenceQualityDimensionScore {
  const key = normalizeExcerpt(evidence.excerpt);
  const firstId = context.excerptFirstId.get(key);

  if (context.itemCount <= 1) {
    return {
      id: "consistency",
      label: "Consistency",
      score: 80,
      status: "known",
      detail: "Single evidence item — no duplicate excerpt conflict.",
    };
  }

  if (firstId === evidence.id) {
    return {
      id: "consistency",
      label: "Consistency",
      score: 80,
      status: "known",
      detail: "First occurrence of excerpt in collection.",
    };
  }

  return {
    id: "consistency",
    label: "Consistency",
    score: 30,
    status: "known",
    detail: `Duplicate excerpt detected — first occurrence: ${firstId ?? "unknown"}.`,
  };
}

/**
 * Returns true when excerpt content is duplicated elsewhere in the collection.
 */
export function isDuplicateExcerpt(
  evidence: Evidence,
  context: QualityAssessmentContext,
): boolean {
  const key = normalizeExcerpt(evidence.excerpt);
  const firstId = context.excerptFirstId.get(key);

  return firstId !== undefined && firstId !== evidence.id;
}

/**
 * Returns true when provenance is weak or undeclared.
 */
export function isWeakProvenance(evidence: Evidence): boolean {
  const score = mapProvenanceStrength(evidence.source.provenanceStrength);
  return score <= WEAK_PROVENANCE_SCORE_THRESHOLD;
}

export function normalizeExcerpt(excerpt: string): string {
  return excerpt.trim().toLowerCase().replace(/\s+/g, " ");
}
