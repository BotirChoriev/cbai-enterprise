import type { IntelligenceNetwork } from "@/lib/foundation/network-types";

export interface NetworkValidationResult {
  valid: boolean;
  issues: readonly string[];
}

/**
 * Deterministic structural validation only — confirms the network is internally honest, not
 * that its content is correct. Enforces the mission's two hard rules at the data level: every
 * node has a real identity, and every edge is evidence-aware (it declares real evidence or
 * real, honest limitations explaining why none is connected yet — never silent about it).
 */
export function validateIntelligenceNetwork(network: IntelligenceNetwork): NetworkValidationResult {
  const issues: string[] = [];
  const seenNodeIds = new Set<string>();

  for (const node of network.nodes) {
    if (!node.subject.subjectId.trim()) {
      issues.push("A network node is missing an identity (subject.subjectId).");
      continue;
    }
    if (seenNodeIds.has(node.subject.subjectId)) {
      issues.push(`Duplicate node id "${node.subject.subjectId}" in network.`);
    }
    seenNodeIds.add(node.subject.subjectId);
  }

  for (const edge of network.edges) {
    if (!edge.relationshipId.trim()) {
      issues.push("A network edge is missing an identity (relationshipId).");
    }

    const isEvidenceAware = (edge.evidence?.length ?? 0) > 0 || (edge.limitations?.length ?? 0) > 0;
    if (!isEvidenceAware) {
      issues.push(
        `Edge "${edge.relationshipId}" is not evidence-aware — it declares neither evidence nor limitations.`,
      );
    }
  }

  return { valid: issues.length === 0, issues };
}
