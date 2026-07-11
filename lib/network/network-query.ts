import type { Relationship } from "@/lib/foundation/foundation-model";
import type {
  IntelligenceEntityKind,
  IntelligenceNetwork,
  IntelligenceNetworkEdgeTrace,
  IntelligenceNetworkNode,
} from "@/lib/foundation/network-types";
import {
  findRelationshipsForSubject,
  resolveConnectedSubjectIds,
} from "@/lib/relationships/relationship-query";

/**
 * Pure, in-memory query primitives over an IntelligenceNetwork. Reuses the Universal
 * Relationship Engine's own traversal (lib/relationships/relationship-query.ts) rather than
 * re-implementing graph walking — a network's edges are just Relationship records.
 */

export function findNodesByEntityKind(
  network: IntelligenceNetwork,
  entityKind: IntelligenceEntityKind,
): readonly IntelligenceNetworkNode[] {
  return network.nodes.filter((node) => node.entityKind === entityKind);
}

export function findNodeById(
  network: IntelligenceNetwork,
  subjectId: string,
): IntelligenceNetworkNode | undefined {
  return network.nodes.find((node) => node.subject.subjectId === subjectId);
}

/** Every real edge touching a node — delegates to lib/relationships/, never re-derived. */
export function findEdgesForNode(
  network: IntelligenceNetwork,
  subjectId: string,
): readonly Relationship[] {
  return findRelationshipsForSubject(network.edges, subjectId);
}

/** Every real node directly connected to a node, one hop, in either direction. */
export function findConnectedNodes(
  network: IntelligenceNetwork,
  subjectId: string,
): readonly IntelligenceNetworkNode[] {
  const connectedIds = new Set(resolveConnectedSubjectIds(network.edges, subjectId));
  return network.nodes.filter((node) => connectedIds.has(node.subject.subjectId));
}

/** How traceable one edge's evidence backing is — a real count, never a fabricated score. */
export function traceEdgeEvidence(edge: Relationship): IntelligenceNetworkEdgeTrace {
  const evidenceCount = edge.evidence?.length ?? 0;
  return {
    relationshipId: edge.relationshipId,
    evidenceCount,
    hasTraceableEvidence: evidenceCount > 0,
  };
}
