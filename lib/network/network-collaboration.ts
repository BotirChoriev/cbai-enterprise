import type {
  CollaborationCandidate,
  IntelligenceNetwork,
  IntelligenceNetworkNode,
  SharedIntelligenceKind,
} from "@/lib/foundation/network-types";

/**
 * Collaboration discovery — every candidate here is grounded in a real, named reference
 * (an Evidence id or a shared relationship target id), never in a connection count, a follower
 * count, or any other popularity signal. This is the one genuinely new derivation in
 * lib/network/; everything else in this module composes or reuses lib/relationships/ and the
 * Foundation's own Evidence/Relationship shapes.
 */

/** Every unordered pair drawn from a list, without duplicating a pair in either order. */
function unorderedPairs<T>(items: readonly T[]): ReadonlyArray<readonly [T, T]> {
  const pairs: Array<readonly [T, T]> = [];
  for (let i = 0; i < items.length; i += 1) {
    for (let j = i + 1; j < items.length; j += 1) {
      pairs.push([items[i], items[j]]);
    }
  }
  return pairs;
}

/**
 * Two nodes are candidates when they are both named as related subjects on the same real
 * Evidence record. Evidence is drawn only from what edges actually carry
 * (Relationship.evidence) — this module never fetches or invents an evidence pool.
 */
export function findSharedEvidenceCollaborationCandidates(
  network: IntelligenceNetwork,
): readonly CollaborationCandidate[] {
  const evidencePool = network.edges.flatMap((edge) => edge.evidence ?? []);
  const candidates: CollaborationCandidate[] = [];

  for (const evidence of evidencePool) {
    const relatedSubjectIds = evidence.relatedSubjectIds ?? [];
    for (const [nodeAId, nodeBId] of unorderedPairs(relatedSubjectIds)) {
      candidates.push({
        nodeAId,
        nodeBId,
        basis: "shared_evidence",
        sharedReferenceIds: [evidence.evidenceId],
      });
    }
  }

  return candidates;
}

function classifySharedTargetBasis(
  targetNode: IntelligenceNetworkNode | undefined,
): SharedIntelligenceKind {
  return targetNode?.entityKind === "mission" ? "shared_mission" : "shared_relationship_target";
}

/**
 * Two nodes are candidates when they both have a real edge pointing at the same third entity —
 * e.g. two laboratories that both connect to the same mission, or two researchers who both cite
 * the same publication. When the shared target is itself a "mission"-kind node, the basis is
 * reported as "shared_mission" rather than the generic form, since that is a more specific,
 * real fact about what the two nodes share.
 */
export function findSharedRelationshipTargetCollaborationCandidates(
  network: IntelligenceNetwork,
): readonly CollaborationCandidate[] {
  const sourceIdsByTarget = new Map<string, Set<string>>();
  for (const edge of network.edges) {
    const sources = sourceIdsByTarget.get(edge.targetId) ?? new Set<string>();
    sources.add(edge.sourceId);
    sourceIdsByTarget.set(edge.targetId, sources);
  }

  const nodesById = new Map(network.nodes.map((node) => [node.subject.subjectId, node]));
  const candidates: CollaborationCandidate[] = [];

  for (const [targetId, sourceIdSet] of sourceIdsByTarget) {
    const basis = classifySharedTargetBasis(nodesById.get(targetId));
    for (const [nodeAId, nodeBId] of unorderedPairs([...sourceIdSet])) {
      candidates.push({ nodeAId, nodeBId, basis, sharedReferenceIds: [targetId] });
    }
  }

  return candidates;
}

/** Every real, evidence-grounded collaboration candidate in the network. */
export function findCollaborationCandidates(
  network: IntelligenceNetwork,
): readonly CollaborationCandidate[] {
  return [
    ...findSharedEvidenceCollaborationCandidates(network),
    ...findSharedRelationshipTargetCollaborationCandidates(network),
  ];
}
