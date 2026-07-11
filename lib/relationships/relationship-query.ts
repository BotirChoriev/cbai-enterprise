import type { Relationship } from "@/lib/foundation/foundation-model";
import type { RelationshipType } from "@/lib/foundation/relationship-types";

/**
 * Pure, in-memory graph-traversal primitives over a Relationship collection. This is the
 * engine a future visual Knowledge Graph consumes — no rendering, no layout, no visualization
 * concerns live here, so a graph UI can be built or swapped without changing this file.
 */

/** All relationships where the subject is either the source or the target. */
export function findRelationshipsForSubject(
  relationships: readonly Relationship[],
  subjectId: string,
): readonly Relationship[] {
  return relationships.filter(
    (relationship) => relationship.sourceId === subjectId || relationship.targetId === subjectId,
  );
}

/** All relationships of a given type. */
export function findRelationshipsByType(
  relationships: readonly Relationship[],
  relationshipType: RelationshipType,
): readonly Relationship[] {
  return relationships.filter(
    (relationship) => relationship.relationshipType === relationshipType,
  );
}

/** The distinct set of subject IDs directly connected to a subject, in either direction. */
export function resolveConnectedSubjectIds(
  relationships: readonly Relationship[],
  subjectId: string,
): readonly string[] {
  const connected = new Set<string>();

  for (const relationship of findRelationshipsForSubject(relationships, subjectId)) {
    if (relationship.sourceId !== subjectId) {
      connected.add(relationship.sourceId);
    }
    if (relationship.targetId !== subjectId) {
      connected.add(relationship.targetId);
    }
  }

  return [...connected];
}

/** One hop of bounded traversal: relationships connecting any of the given subject IDs. */
export function findRelationshipsAmongSubjects(
  relationships: readonly Relationship[],
  subjectIds: readonly string[],
): readonly Relationship[] {
  const idSet = new Set(subjectIds);
  return relationships.filter(
    (relationship) => idSet.has(relationship.sourceId) || idSet.has(relationship.targetId),
  );
}
