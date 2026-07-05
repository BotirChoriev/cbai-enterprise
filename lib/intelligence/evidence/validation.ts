import type { EntityType } from "@/lib/entity/entity.types";
import type {
  Evidence,
  EvidenceCollection,
  EvidenceSource,
  EvidenceSourceClass,
} from "@/lib/intelligence/evidence.types";

/** Minimum valid relevance score inclusive. */
export const EVIDENCE_RELEVANCE_MIN = 0;

/** Maximum valid relevance score inclusive. */
export const EVIDENCE_RELEVANCE_MAX = 100;

const EVIDENCE_SOURCE_CLASSES: readonly EvidenceSourceClass[] = [
  "entity-profile",
  "search",
  "knowledge-graph",
  "document",
  "agent-output",
  "human-input",
  "external-feed",
];

const ENTITY_TYPES: readonly EntityType[] = [
  "country",
  "company",
  "university",
  "government",
  "investor",
  "person",
];

/**
 * Validation failure for evidence shape checks.
 *
 * Validates structure only — not truth, provenance accuracy, or relevance quality.
 */
export class EvidenceValidationError extends Error {
  readonly code = "EVIDENCE_VALIDATION_ERROR";

  constructor(message: string) {
    super(message);
    this.name = "EvidenceValidationError";
  }
}

/**
 * Type guard for {@link EvidenceSourceClass} values.
 */
export function isEvidenceSourceClass(value: unknown): value is EvidenceSourceClass {
  return (
    typeof value === "string" &&
    (EVIDENCE_SOURCE_CLASSES as readonly string[]).includes(value)
  );
}

/**
 * Type guard for {@link EntityType} values on evidence items.
 */
export function isEvidenceEntityType(value: unknown): value is EntityType {
  return typeof value === "string" && (ENTITY_TYPES as readonly string[]).includes(value);
}

/**
 * Returns true when a relevance score is within the 0–100 inclusive range.
 */
export function isValidRelevanceScore(score: number): boolean {
  return (
    Number.isFinite(score) &&
    score >= EVIDENCE_RELEVANCE_MIN &&
    score <= EVIDENCE_RELEVANCE_MAX
  );
}

/**
 * Validates the shape of an {@link EvidenceSource} object.
 *
 * @throws {@link EvidenceValidationError} when required fields are invalid
 */
export function validateEvidenceSourceShape(source: EvidenceSource): void {
  if (!isEvidenceSourceClass(source.class)) {
    throw new EvidenceValidationError(
      `Evidence source class must be a valid EvidenceSourceClass, received: ${String(source.class)}`,
    );
  }

  if (source.ref !== undefined && typeof source.ref !== "string") {
    throw new EvidenceValidationError("Evidence source ref must be a string when provided");
  }

  if (source.label !== undefined && typeof source.label !== "string") {
    throw new EvidenceValidationError("Evidence source label must be a string when provided");
  }

  if (source.retrievedAt !== undefined && typeof source.retrievedAt !== "string") {
    throw new EvidenceValidationError(
      "Evidence source retrievedAt must be an ISO string when provided",
    );
  }
}

/**
 * Validates the structural shape of a single {@link Evidence} item.
 *
 * Does not verify excerpt truth, entity existence, or source authenticity.
 *
 * @throws {@link EvidenceValidationError} when shape requirements fail
 */
export function validateEvidenceShape(evidence: Evidence): void {
  if (typeof evidence.id !== "string" || !evidence.id.trim()) {
    throw new EvidenceValidationError("Evidence id must be a non-empty string");
  }

  if (typeof evidence.entityId !== "string" || !evidence.entityId.trim()) {
    throw new EvidenceValidationError("Evidence entityId must be a non-empty string");
  }

  if (!isEvidenceEntityType(evidence.entityType)) {
    throw new EvidenceValidationError(
      `Evidence entityType must be a valid EntityType, received: ${String(evidence.entityType)}`,
    );
  }

  if (typeof evidence.entityName !== "string" || !evidence.entityName.trim()) {
    throw new EvidenceValidationError("Evidence entityName must be a non-empty string");
  }

  if (typeof evidence.excerpt !== "string") {
    throw new EvidenceValidationError("Evidence excerpt must be a string");
  }

  if (!isValidRelevanceScore(evidence.relevance)) {
    throw new EvidenceValidationError(
      `Evidence relevance must be between ${EVIDENCE_RELEVANCE_MIN} and ${EVIDENCE_RELEVANCE_MAX}`,
    );
  }

  validateEvidenceSourceShape(evidence.source);
}

/**
 * Validates structural consistency of an {@link EvidenceCollection}.
 *
 * Does not evaluate sufficiency thresholds against Intelligence Specification §3.6 —
 * only ensures collection fields are well-formed.
 *
 * @throws {@link EvidenceValidationError} when shape requirements fail
 */
export function validateEvidenceCollectionShape(collection: EvidenceCollection): void {
  if (!Array.isArray(collection.items)) {
    throw new EvidenceValidationError("EvidenceCollection items must be an array");
  }

  for (const item of collection.items) {
    validateEvidenceShape(item);
  }

  if (typeof collection.meanRelevance !== "number" || !Number.isFinite(collection.meanRelevance)) {
    throw new EvidenceValidationError("EvidenceCollection meanRelevance must be a finite number");
  }

  if (
    typeof collection.sourceClassCount !== "number" ||
    !Number.isInteger(collection.sourceClassCount) ||
    collection.sourceClassCount < 0
  ) {
    throw new EvidenceValidationError(
      "EvidenceCollection sourceClassCount must be a non-negative integer",
    );
  }
}

/**
 * Type guard combining {@link validateEvidenceShape} for unknown values.
 */
export function isEvidenceShape(value: unknown): value is Evidence {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  try {
    validateEvidenceShape(value as Evidence);
    return true;
  } catch {
    return false;
  }
}

/**
 * Computes mean relevance and distinct source class count from evidence items.
 *
 * Used by collectors after merging adapter output — not a scoring algorithm.
 */
export function summarizeEvidenceItems(items: Evidence[]): {
  meanRelevance: number;
  sourceClassCount: number;
} {
  if (items.length === 0) {
    return { meanRelevance: 0, sourceClassCount: 0 };
  }

  const meanRelevance =
    items.reduce((sum, item) => sum + item.relevance, 0) / items.length;

  const sourceClassCount = new Set(items.map((item) => item.source.class)).size;

  return { meanRelevance, sourceClassCount };
}
