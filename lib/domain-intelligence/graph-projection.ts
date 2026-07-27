/**
 * Project Domain Intelligence relationships into the platform Knowledge Graph
 * without fabricating nodes. Only registry-backed country/university/company edges.
 */

import { buildCountryIntelligenceWorkspace } from "@/lib/domain-intelligence/country-workspace";
import type { DomainRelationshipRecord } from "@/lib/domain-intelligence/typed-relationship";
import type { GraphEdge, GraphEdgeType, KnowledgeGraph } from "@/lib/graph/graph.types";
import { graphNodeId } from "@/lib/graph/graph.types";
import { buildKnowledgeGraph } from "@/lib/graph/graph.builder";

/** Map domain relationship kinds onto existing visual graph edge types when possible. */
export function mapDomainKindToGraphEdgeType(
  kind: DomainRelationshipRecord["kind"],
): GraphEdgeType | null {
  switch (kind) {
    case "LOCATED_IN":
      return "located-in";
    case "COLLABORATES_WITH":
      return "partner";
    case "FUNDED_BY":
      return "investment";
    default:
      // Academic / evidence kinds are not yet first-class visual edge types —
      // keep them in the domain relationship list, not as decorative graph edges.
      return null;
  }
}

export function domainRelationshipsForCountry(countryId: string): readonly DomainRelationshipRecord[] {
  const workspace = buildCountryIntelligenceWorkspace(countryId);
  return workspace?.relationships ?? [];
}

/**
 * Augment the platform knowledge graph with domain-derived LOCATED_IN edges
 * that already match registry facts. Skips edges whose endpoints are missing.
 */
export function buildDomainAugmentedKnowledgeGraph(countryId?: string): {
  readonly graph: KnowledgeGraph;
  readonly domainRelationships: readonly DomainRelationshipRecord[];
  readonly addedEdgeIds: readonly string[];
} {
  const graph = buildKnowledgeGraph();
  const domainRelationships = countryId
    ? domainRelationshipsForCountry(countryId)
    : [];

  const nodeIds = new Set(graph.nodes.map((n) => n.id));
  const existingEdgeIds = new Set(graph.edges.map((e) => e.id));
  const added: GraphEdge[] = [];
  const addedEdgeIds: string[] = [];

  for (const rel of domainRelationships) {
    const edgeType = mapDomainKindToGraphEdgeType(rel.kind);
    if (!edgeType) continue;
    if (rel.fromKind !== "university" && rel.fromKind !== "company") continue;
    if (rel.toKind !== "country") continue;

    const source = graphNodeId(rel.fromKind, rel.fromId);
    const target = graphNodeId("country", rel.toId);
    if (!nodeIds.has(source) || !nodeIds.has(target)) continue;

    const id = `domain:${rel.id}`;
    if (existingEdgeIds.has(id) || graph.edges.some((e) => e.source === source && e.target === target && e.type === edgeType)) {
      continue;
    }
    const edge: GraphEdge = {
      id,
      source,
      target,
      type: edgeType,
      label: rel.kind.replace(/_/g, " "),
      evidenceStatus: rel.confidence === "registry_derived" ? "evidence_available" : "evidence_missing",
    };
    added.push(edge);
    addedEdgeIds.push(id);
  }

  return {
    graph: {
      nodes: graph.nodes,
      edges: [...graph.edges, ...added],
    },
    domainRelationships,
    addedEdgeIds,
  };
}
