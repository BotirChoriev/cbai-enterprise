import { countries } from "@/lib/countries";
import { companies } from "@/lib/companies";
import { universities } from "@/lib/universities";
import { toCountryEntity, getCountryRelationships } from "@/lib/countries.adapter";
import { toCompanyEntity, getCompanyRelationships } from "@/lib/companies.adapter";
import { toUniversityEntity } from "@/lib/universities.adapter";
import type { Entity } from "@/lib/entity/entity.types";
import type {
  GraphNode,
  GraphEdge,
  GraphEdgeType,
  GraphEdgeEvidenceStatus,
  KnowledgeGraph,
  GraphNodeType,
  GraphStats,
  GraphSelection,
} from "@/lib/graph/graph.types";
import { graphNodeId } from "@/lib/graph/graph.types";
import { GRAPH_LAYOUT } from "@/lib/graph/graph.mock";

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function namesMatch(a: string, b: string): boolean {
  const na = normalizeName(a);
  const nb = normalizeName(b);
  return na === nb || na.includes(nb) || nb.includes(na);
}

function placeOnRing(
  index: number,
  total: number,
  radius: number,
  cx: number,
  cy: number,
): { x: number; y: number } {
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function buildNodes(): GraphNode[] {
  const { centerX, centerY, countryRadius, companyRadius, universityRadius } =
    GRAPH_LAYOUT;

  const countryNodes: GraphNode[] = countries.map((country, index) => {
    const entity = toCountryEntity(country);
    const pos = placeOnRing(index, countries.length, countryRadius, centerX, centerY);
    return {
      id: graphNodeId("country", country.id),
      entityId: country.id,
      type: "country",
      label: country.name,
      entity,
      x: pos.x,
      y: pos.y,
    };
  });

  const companyNodes: GraphNode[] = companies.map((company, index) => {
    const entity = toCompanyEntity(company);
    const pos = placeOnRing(index, companies.length, companyRadius, centerX, centerY);
    return {
      id: graphNodeId("company", company.id),
      entityId: company.id,
      type: "company",
      label: company.name,
      entity,
      x: pos.x,
      y: pos.y,
    };
  });

  const universityNodes: GraphNode[] = universities.map((university, index) => {
    const entity = toUniversityEntity(university);
    const pos = placeOnRing(
      index,
      universities.length,
      universityRadius,
      centerX,
      centerY,
    );
    return {
      id: graphNodeId("university", university.id),
      entityId: university.id,
      type: "university",
      label: university.name,
      entity,
      x: pos.x,
      y: pos.y,
    };
  });

  return [...countryNodes, ...companyNodes, ...universityNodes];
}

function findNode(
  name: string,
  type: GraphNodeType,
  nodes: GraphNode[],
): GraphNode | undefined {
  return nodes.find(
    (node) =>
      node.type === type &&
      (namesMatch(node.label, name) || namesMatch(node.entity.name, name)),
  );
}

function findCountryByName(name: string, nodes: GraphNode[]): GraphNode | undefined {
  return findNode(name, "country", nodes);
}

function addEdge(
  edges: GraphEdge[],
  seen: Set<string>,
  source: string,
  target: string,
  type: GraphEdgeType,
  label: string,
  evidenceStatus: GraphEdgeEvidenceStatus = "evidence_available",
) {
  if (source === target) return;
  const key = [source, target, type].sort().join("|");
  if (seen.has(key)) return;
  seen.add(key);
  edges.push({
    id: `edge-${source}-${type}-${target}`,
    source,
    target,
    type,
    label,
    evidenceStatus,
  });
}

function buildEdges(nodes: GraphNode[]): GraphEdge[] {
  const edges: GraphEdge[] = [];
  const seen = new Set<string>();

  for (const company of companies) {
    const companyNode = nodes.find(
      (node) => node.type === "company" && node.entityId === company.id,
    );
    const countryNode = findCountryByName(company.country, nodes);
    if (companyNode && countryNode) {
      addEdge(
        edges,
        seen,
        companyNode.id,
        countryNode.id,
        "located-in",
        "Located In",
      );
    }
  }

  for (const university of universities) {
    const universityNode = nodes.find(
      (node) => node.type === "university" && node.entityId === university.id,
    );
    const countryNode = findCountryByName(university.country, nodes);
    if (universityNode && countryNode) {
      addEdge(
        edges,
        seen,
        universityNode.id,
        countryNode.id,
        "located-in",
        "Located In",
      );
    }
  }

  for (const country of countries) {
    const countryNode = nodes.find(
      (node) => node.type === "country" && node.entityId === country.id,
    );
    if (!countryNode) continue;

    const countryRelationships = getCountryRelationships(country);

    for (const companyName of countryRelationships.relatedCompanies) {
      const companyNode = findNode(companyName, "company", nodes);
      if (companyNode) {
        addEdge(
          edges,
          seen,
          companyNode.id,
          countryNode.id,
          "industry",
          "Registered In",
        );
      }
    }

    for (const universityName of countryRelationships.universities) {
      const universityNode = findNode(universityName, "university", nodes);
      if (universityNode) {
        addEdge(
          edges,
          seen,
          universityNode.id,
          countryNode.id,
          "industry",
          "Registered In",
        );
      }
    }
  }

  for (const company of companies) {
    const companyNode = nodes.find(
      (node) => node.type === "company" && node.entityId === company.id,
    );
    if (!companyNode) continue;

    const relationships = getCompanyRelationships(company);

    for (const universityName of relationships.universities) {
      const universityNode = findNode(universityName, "university", nodes);
      if (universityNode) {
        addEdge(
          edges,
          seen,
          companyNode.id,
          universityNode.id,
          "research-partner",
          "Belongs To",
        );
      }
    }
  }

  return edges;
}

export function buildKnowledgeGraph(): KnowledgeGraph {
  const nodes = buildNodes();
  const edges = buildEdges(nodes);
  return { nodes, edges };
}

export function computeGraphStats(graph: KnowledgeGraph): GraphStats {
  const edgeTypeCounts: Partial<Record<GraphEdgeType, number>> = {};
  for (const edge of graph.edges) {
    edgeTypeCounts[edge.type] = (edgeTypeCounts[edge.type] ?? 0) + 1;
  }

  return {
    totalNodes: graph.nodes.length,
    totalEdges: graph.edges.length,
    countryCount: graph.nodes.filter((node) => node.type === "country").length,
    companyCount: graph.nodes.filter((node) => node.type === "company").length,
    universityCount: graph.nodes.filter((node) => node.type === "university").length,
    verifiedEdgeCount: graph.edges.filter(
      (edge) => edge.evidenceStatus === "evidence_available",
    ).length,
    edgeTypeCounts,
  };
}

export function computeGraphSelection(
  graph: KnowledgeGraph,
  nodeId: string | null,
): GraphSelection {
  if (!nodeId) {
    return {
      nodeId: null,
      connectedNodeIds: new Set(),
      connectedEdgeIds: new Set(),
    };
  }

  const connectedNodeIds = new Set<string>([nodeId]);
  const connectedEdgeIds = new Set<string>();

  for (const edge of graph.edges) {
    if (edge.source === nodeId || edge.target === nodeId) {
      connectedEdgeIds.add(edge.id);
      connectedNodeIds.add(edge.source);
      connectedNodeIds.add(edge.target);
    }
  }

  return { nodeId, connectedNodeIds, connectedEdgeIds };
}

export function getNodeEntity(
  graph: KnowledgeGraph,
  nodeId: string,
): Entity | undefined {
  return graph.nodes.find((node) => node.id === nodeId)?.entity;
}

export function filterNodesBySearch(
  nodes: GraphNode[],
  query: string,
): Set<string> {
  if (!query.trim()) return new Set(nodes.map((node) => node.id));
  const tokens = query.toLowerCase().trim().split(/\s+/);
  const matching = nodes.filter((node) => {
    const text = [
      node.label,
      node.entity.category,
      node.entity.subtitle ?? "",
      String(node.entity.metadata.country ?? ""),
    ]
      .join(" ")
      .toLowerCase();
    return tokens.every((token) => text.includes(token));
  });
  return new Set(matching.map((node) => node.id));
}
