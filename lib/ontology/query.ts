/**
 * Ontology query — filter, traverse relationships, discover related work.
 */

import type { OntologyObjectFilter, OntologyObjectId, OntologyObjectRecord } from "@/lib/ontology/types";
import type { OntologyRelationship, OntologyRelationshipKind } from "@/lib/ontology/relationship-kinds";

export function filterOntologyObjects(
  objects: readonly OntologyObjectRecord[],
  filter: OntologyObjectFilter = {},
): OntologyObjectRecord[] {
  return objects.filter((obj) => {
    if (filter.kind) {
      const kinds = Array.isArray(filter.kind) ? filter.kind : [filter.kind];
      if (!kinds.includes(obj.kind)) return false;
    }
    if (filter.status) {
      const statuses = Array.isArray(filter.status) ? filter.status : [filter.status];
      if (!statuses.includes(obj.status)) return false;
    }
    if (filter.contentLocale && obj.contentLocale !== filter.contentLocale) return false;
    if (filter.legacyRecordId && obj.provenance.legacyRecordId !== filter.legacyRecordId) return false;
    if (filter.legacyStoreKey && obj.provenance.legacyStoreKey !== filter.legacyStoreKey) return false;
    return true;
  });
}

export function getObjectById(
  objects: readonly OntologyObjectRecord[],
  id: OntologyObjectId | string,
): OntologyObjectRecord | undefined {
  return objects.find((o) => o.id === id);
}

export function getRelationshipsForObject(
  relationships: readonly OntologyRelationship[],
  objectId: string,
  direction: "outbound" | "inbound" | "both" = "both",
): OntologyRelationship[] {
  return relationships.filter((rel) => {
    if (direction === "outbound") return rel.fromId === objectId;
    if (direction === "inbound") return rel.toId === objectId;
    return rel.fromId === objectId || rel.toId === objectId;
  });
}

export function traverseRelationships(
  startId: string,
  relationships: readonly OntologyRelationship[],
  kind?: OntologyRelationshipKind,
  maxDepth = 3,
): string[] {
  const visited = new Set<string>();
  const queue: { id: string; depth: number }[] = [{ id: startId, depth: 0 }];
  const result: string[] = [];

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (visited.has(current.id)) continue;
    visited.add(current.id);
    if (current.id !== startId) result.push(current.id);
    if (current.depth >= maxDepth) continue;

    for (const rel of relationships) {
      if (kind && rel.kind !== kind) continue;
      if (rel.fromId === current.id && !visited.has(rel.toId)) {
        queue.push({ id: rel.toId, depth: current.depth + 1 });
      }
      if (rel.toId === current.id && !visited.has(rel.fromId)) {
        queue.push({ id: rel.fromId, depth: current.depth + 1 });
      }
    }
  }

  return result;
}

export function findRelatedWork(
  objectId: string,
  objects: readonly OntologyObjectRecord[],
  relationships: readonly OntologyRelationship[],
): OntologyObjectRecord[] {
  const relatedIds = traverseRelationships(objectId, relationships);
  const workKinds = new Set(["project", "mission", "task", "work_plan", "review", "report"]);
  return relatedIds
    .map((id) => getObjectById(objects, id))
    .filter((o): o is OntologyObjectRecord => Boolean(o && workKinds.has(o.kind)));
}

export function findDependencies(
  objectId: string,
  relationships: readonly OntologyRelationship[],
): OntologyRelationship[] {
  return relationships.filter(
    (rel) => rel.fromId === objectId && (rel.kind === "depends_on" || rel.kind === "derived_from"),
  );
}
