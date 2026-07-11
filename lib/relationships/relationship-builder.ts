import type { Evidence, Relationship } from "@/lib/foundation/foundation-model";
import type {
  RelationshipConfidence,
  RelationshipDirection,
  RelationshipStatus,
  RelationshipStrength,
  RelationshipType,
} from "@/lib/foundation/relationship-types";

/**
 * Deterministically derive confidence from evidence count — never a fabricated score.
 * 0 evidence → unverified. 1 → single_source. 2+ → corroborated. Callers may still pass an
 * explicit "disputed" confidence when a real, known contradiction exists — this function only
 * supplies the honest default when nothing else is known.
 */
export function deriveRelationshipConfidence(
  evidence: readonly Evidence[],
): RelationshipConfidence {
  if (evidence.length === 0) {
    return "unverified";
  }
  if (evidence.length === 1) {
    return "single_source";
  }
  return "corroborated";
}

export interface BuildRelationshipInput {
  sourceId: string;
  targetId: string;
  relationshipType: RelationshipType;
  explanation: string;
  direction?: RelationshipDirection;
  strength?: RelationshipStrength;
  evidence?: readonly Evidence[];
  confidence?: RelationshipConfidence;
  status?: RelationshipStatus;
  source?: string;
  limitations?: readonly string[];
  observedAt?: string;
}

/**
 * Construct a fully-honest Relationship record. Strength defaults to "unknown" — never
 * guessed. Confidence defaults to the deterministic evidence-count derivation unless the
 * caller supplies a real, known value. Limitations default to stating that no live evidence
 * source is connected when no evidence was supplied, rather than staying silent about it.
 */
export function buildRelationship(input: BuildRelationshipInput): Relationship {
  const evidence = input.evidence ?? [];

  return {
    relationshipId: `relationship:${input.sourceId}:${input.relationshipType}:${input.targetId}`,
    sourceId: input.sourceId,
    targetId: input.targetId,
    relationshipType: input.relationshipType,
    explanation: input.explanation,
    direction: input.direction ?? "directed",
    strength: input.strength ?? "unknown",
    evidence,
    confidence: input.confidence ?? deriveRelationshipConfidence(evidence),
    time: input.observedAt ? { observedAt: input.observedAt } : undefined,
    status: input.status ?? "active",
    source: input.source,
    limitations:
      input.limitations ??
      (evidence.length === 0
        ? ["No live evidence source is connected for this relationship yet."]
        : []),
  };
}
