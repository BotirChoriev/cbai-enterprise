import { countries } from "@/lib/countries";
import { companies } from "@/lib/companies";
import { universities } from "@/lib/universities";
import { toCountryEntity, getCountryRelationships } from "@/lib/countries.adapter";
import { toCompanyEntity } from "@/lib/companies.adapter";
import { toUniversityEntity } from "@/lib/universities.adapter";
import type { Entity } from "@/lib/entity/entity.types";
import type {
  GraphNode,
  GraphEdge,
  GraphEdgeType,
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

  const countryNodes: GraphNode[] = countries.map((c, i) => {
    const entity = toCountryEntity(c);
    const pos = placeOnRing(i, countries.length, countryRadius, centerX, centerY);
    return {
      id: graphNodeId("country", c.id),
      entityId: c.id,
      type: "country",
      label: c.name,
      entity,
      x: pos.x,
      y: pos.y,
    };
  });

  const companyNodes: GraphNode[] = companies.map((c, i) => {
    const entity = toCompanyEntity(c);
    const pos = placeOnRing(i, companies.length, companyRadius, centerX, centerY);
    return {
      id: graphNodeId("company", c.id),
      entityId: c.id,
      type: "company",
      label: c.name,
      entity,
      x: pos.x,
      y: pos.y,
    };
  });

  const universityNodes: GraphNode[] = universities.map((u, i) => {
    const entity = toUniversityEntity(u);
    const pos = placeOnRing(
      i,
      universities.length,
      universityRadius,
      centerX,
      centerY,
    );
    return {
      id: graphNodeId("university", u.id),
      entityId: u.id,
      type: "university",
      label: u.name,
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
    (n) =>
      n.type === type &&
      (namesMatch(n.label, name) || namesMatch(n.entity.name, name)),
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
  });
}

function buildEdges(nodes: GraphNode[]): GraphEdge[] {
  const edges: GraphEdge[] = [];
  const seen = new Set<string>();

  // Company → Country: located-in
  for (const company of companies) {
    const companyNode = nodes.find(
      (n) => n.type === "company" && n.entityId === company.id,
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

  // University → Country: located-in
  for (const uni of universities) {
    const uniNode = nodes.find(
      (n) => n.type === "university" && n.entityId === uni.id,
    );
    const countryNode = findCountryByName(uni.country, nodes);
    if (uniNode && countryNode) {
      addEdge(
        edges,
        seen,
        uniNode.id,
        countryNode.id,
        "located-in",
        "Located In",
      );
    }
  }

  // Company ↔ Company: partner & competitor
  for (const company of companies) {
    const sourceNode = nodes.find(
      (n) => n.type === "company" && n.entityId === company.id,
    );
    if (!sourceNode) continue;

    for (const partner of company.relationships.partners) {
      const target = findNode(partner, "company", nodes);
      if (target) {
        addEdge(edges, seen, sourceNode.id, target.id, "partner", "Partner");
      }
    }

    for (const competitor of company.relationships.competitors) {
      const target = findNode(competitor, "company", nodes);
      if (target) {
        addEdge(edges, seen, sourceNode.id, target.id, "competitor", "Competitor");
      }
    }

    for (const uniName of company.relationships.relatedUniversities) {
      const target = findNode(uniName, "university", nodes);
      if (target) {
        addEdge(
          edges,
          seen,
          sourceNode.id,
          target.id,
          "research-partner",
          "Research Partner",
        );
      }
    }
  }

  // University ↔ Company: research-partner
  for (const uni of universities) {
    const sourceNode = nodes.find(
      (n) => n.type === "university" && n.entityId === uni.id,
    );
    if (!sourceNode) continue;

    for (const partner of uni.relationships.industryPartners) {
      const target = findNode(partner, "company", nodes);
      if (target) {
        addEdge(
          edges,
          seen,
          sourceNode.id,
          target.id,
          "research-partner",
          "Research Partner",
        );
      }
    }

    for (const companyName of uni.relationships.relatedCompanies) {
      const target = findNode(companyName, "company", nodes);
      if (target) {
        addEdge(
          edges,
          seen,
          sourceNode.id,
          target.id,
          "research-partner",
          "Research Partner",
        );
      }
    }
  }

  // Country → Company: investment (from country adapter)
  for (const country of countries) {
    const countryNode = nodes.find(
      (n) => n.type === "country" && n.entityId === country.id,
    );
    if (!countryNode) continue;

    const rels = getCountryRelationships(country);

    for (const companyName of rels.relatedCompanies) {
      const target = findNode(companyName, "company", nodes);
      if (target) {
        addEdge(
          edges,
          seen,
          countryNode.id,
          target.id,
          "investment",
          "Investment",
        );
      }
    }

    for (const uniName of rels.universities) {
      const target = findNode(uniName, "university", nodes);
      if (target) {
        addEdge(
          edges,
          seen,
          countryNode.id,
          target.id,
          "research-partner",
          "Research Partner",
        );
      }
    }

    // Industry: company industry matches country top industries
    for (const company of companies) {
      const companyNode = nodes.find(
        (n) => n.type === "company" && n.entityId === company.id,
      );
      if (!companyNode) continue;
      if (
        country.topIndustries.some((ind) =>
          namesMatch(ind, company.industry),
        ) &&
        namesMatch(company.country, country.name)
      ) {
        addEdge(
          edges,
          seen,
          companyNode.id,
          countryNode.id,
          "industry",
          "Industry",
        );
      }
    }
  }

  return edges;
}

/** Build the complete knowledge graph from entity adapters */
export function buildKnowledgeGraph(): KnowledgeGraph {
  const nodes = buildNodes();
  const edges = buildEdges(nodes);
  return { nodes, edges };
}

/** Compute graph-level statistics */
export function computeGraphStats(graph: KnowledgeGraph): GraphStats {
  const edgeTypeCounts = {} as Record<GraphEdgeType, number>;
  for (const edge of graph.edges) {
    edgeTypeCounts[edge.type] = (edgeTypeCounts[edge.type] ?? 0) + 1;
  }

  return {
    totalNodes: graph.nodes.length,
    totalEdges: graph.edges.length,
    countryCount: graph.nodes.filter((n) => n.type === "country").length,
    companyCount: graph.nodes.filter((n) => n.type === "company").length,
    universityCount: graph.nodes.filter((n) => n.type === "university").length,
    edgeTypeCounts,
  };
}

/** Resolve connected nodes and edges for selection highlighting */
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

/** Get entity for inspector from selected node */
export function getNodeEntity(
  graph: KnowledgeGraph,
  nodeId: string,
): Entity | undefined {
  return graph.nodes.find((n) => n.id === nodeId)?.entity;
}

/** Filter nodes by search query */
export function filterNodesBySearch(
  nodes: GraphNode[],
  query: string,
): Set<string> {
  if (!query.trim()) return new Set(nodes.map((n) => n.id));
  const tokens = query.toLowerCase().trim().split(/\s+/);
  const matching = nodes.filter((n) => {
    const text = [
      n.label,
      n.entity.category,
      n.entity.subtitle ?? "",
      ...n.entity.tags.map((t) => t.label),
    ]
      .join(" ")
      .toLowerCase();
    return tokens.every((t) => text.includes(t));
  });
  return new Set(matching.map((n) => n.id));
}
