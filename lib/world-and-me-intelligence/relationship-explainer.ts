import type { WimEntityNode, WimRelationship } from "@/lib/world-and-me-intelligence/types";

export type RelationshipExplanation =
  | {
      readonly found: true;
      readonly path: readonly { readonly from: string; readonly to: string; readonly type: string; readonly evidenceStatus: string }[];
      readonly provenance: readonly string[];
      readonly uncertainty: string;
      readonly missingLinks: readonly string[];
      readonly conflicting: readonly string[];
      readonly whyItMayMatter: string;
      readonly nextActions: readonly string[];
      readonly requiresHumanApproval: true;
    }
  | {
      readonly found: false;
      readonly message: string;
      readonly manufacturedConnection: false;
    };

/**
 * Explain path between two nodes using only existing relationships.
 * Never manufactures a plausible connection.
 */
export function explainRelationship(
  nodes: readonly WimEntityNode[],
  relationships: readonly WimRelationship[],
  fromId: string,
  toId: string,
): RelationshipExplanation {
  if (fromId === toId) {
    return { found: false, message: "Select two distinct entities.", manufacturedConnection: false };
  }
  const byId = new Map(nodes.map((n) => [n.id, n]));
  if (!byId.has(fromId) || !byId.has(toId)) {
    return {
      found: false,
      message: "No evidence-backed relationship exists for the selected nodes.",
      manufacturedConnection: false,
    };
  }

  // BFS one/two hop
  const adj = new Map<string, WimRelationship[]>();
  for (const rel of relationships) {
    const a = adj.get(rel.sourceNodeId) ?? [];
    a.push(rel);
    adj.set(rel.sourceNodeId, a);
    const b = adj.get(rel.targetNodeId) ?? [];
    b.push(rel);
    adj.set(rel.targetNodeId, b);
  }

  const queue: { id: string; path: WimRelationship[] }[] = [{ id: fromId, path: [] }];
  const seen = new Set<string>([fromId]);
  while (queue.length) {
    const cur = queue.shift()!;
    if (cur.id === toId && cur.path.length) {
      return {
        found: true,
        path: cur.path.map((rel) => ({
          from: rel.sourceNodeId,
          to: rel.targetNodeId,
          type: rel.type,
          evidenceStatus: rel.evidenceStatus,
        })),
        provenance: cur.path.flatMap((rel) => rel.provenanceRefs),
        uncertainty: cur.path.some((r) => r.evidenceStatus !== "evidence_available")
          ? "Some steps lack evidence_available status"
          : "Path found with available or partial evidence markers",
        missingLinks: cur.path.filter((r) => r.evidenceStatus === "evidence_missing").map((r) => r.id),
        conflicting: [],
        whyItMayMatter: relRelevance(cur.path),
        nextActions: ["View Evidence", "Open Draft Work Card", "Confirm human review"],
        requiresHumanApproval: true,
      };
    }
    if (cur.path.length >= 3) continue;
    for (const rel of adj.get(cur.id) ?? []) {
      const nextId = rel.sourceNodeId === cur.id ? rel.targetNodeId : rel.sourceNodeId;
      if (seen.has(nextId)) continue;
      seen.add(nextId);
      queue.push({ id: nextId, path: [...cur.path, rel] });
    }
  }

  return {
    found: false,
    message: "No evidence-backed relationship path exists between these entities in the local registry.",
    manufacturedConnection: false,
  };
}

function relRelevance(path: readonly WimRelationship[]): string {
  const types = path.map((p) => p.type).join(" → ");
  return `Registry path uses relationship types: ${types}. Relevance to your work requires human judgment.`;
}
