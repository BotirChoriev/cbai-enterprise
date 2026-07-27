import { countries } from "@/lib/countries";
import { buildKnowledgeGraph } from "@/lib/graph/graph.builder";
import type { GraphEdgeType } from "@/lib/graph/graph.types";
import {
  type WimEntityNode,
  type WimProjection,
  type WimRelationship,
  type WimRelationshipType,
  WIM_SCHEMA_VERSION,
} from "@/lib/world-and-me-intelligence/types";
import { migrateWimEntityNode, migrateWimRelationship } from "@/lib/world-and-me-intelligence/migrate";

const EDGE_MAP: Partial<Record<GraphEdgeType, WimRelationshipType>> = {
  "located-in": "located_in",
  partner: "partners_with",
  competitor: "depends_on",
  "research-partner": "partners_with",
  industry: "relevant_to",
  investment: "funds",
};

/**
 * Project World and Me map from local registries + knowledge graph only.
 * Live records stay empty until verified connectors exist.
 */
export function buildWorldAndMeProjection(opts?: { readonly maxNodes?: number }): WimProjection {
  const maxNodes = opts?.maxNodes ?? 80;
  const kg = buildKnowledgeGraph();
  const nodes: WimEntityNode[] = [];

  nodes.push(
    migrateWimEntityNode({
      id: "user:local",
      kind: "user",
      officialName: "Local user",
      fullLabel: "Local user (consent-based My World)",
      shortCode: null,
      contentLocale: "en",
      evidenceStatus: "partial",
      classification: "user_entered",
      href: "/my-work",
    }),
  );

  for (const c of countries.slice(0, 40)) {
    nodes.push(
      migrateWimEntityNode({
        id: `country:${c.id}`,
        kind: "country",
        officialName: c.name,
        fullLabel: `${c.name} (country)`,
        shortCode: c.id.toUpperCase().slice(0, 3),
        contentLocale: "en",
        sourceLanguage: "en",
        geographicCoverage: c.name,
        evidenceStatus: "partial",
        classification: "official_source",
        href: `/countries?country=${encodeURIComponent(c.id)}`,
      }),
    );
  }

  for (const n of kg.nodes.slice(0, maxNodes)) {
    if (nodes.some((x) => x.id === n.id)) continue;
    nodes.push(
      migrateWimEntityNode({
        id: n.id,
        kind: n.type,
        officialName: n.label,
        fullLabel: `${n.label} (${n.type})`,
        shortCode: null,
        contentLocale: "en",
        evidenceStatus: "partial",
        classification: "official_source",
        href:
          n.type === "company"
            ? `/companies?company=${encodeURIComponent(n.entityId)}`
            : n.type === "university"
              ? `/universities?university=${encodeURIComponent(n.entityId)}`
              : `/countries?country=${encodeURIComponent(n.entityId)}`,
      }),
    );
  }

  const relationships: WimRelationship[] = kg.edges.slice(0, 120).map((e) => {
    const type = EDGE_MAP[e.type] ?? "relevant_to";
    return migrateWimRelationship({
      id: e.id,
      type,
      labelKey: `rel.${type}`,
      sourceNodeId: e.source,
      targetNodeId: e.target,
      evidenceStatus: e.evidenceStatus === "evidence_available" ? "evidence_available" : "evidence_missing",
      provenanceRefs: e.evidenceStatus === "evidence_available" ? [`graph:${e.id}`] : [],
      confidenceOrCoverage: e.evidenceStatus === "evidence_available" ? "partial" : "unknown",
      classification: "cbai_inference",
      relevanceExplanation: e.label || null,
    });
  });

  // Ensure every relationship has a type (contract).
  for (const rel of relationships) {
    if (!rel.type) throw new Error("Relationship missing type");
  }

  const listFallback = nodes.slice(0, 40).map((n) => ({
    label: n.fullLabel,
    detail: `${n.kind} · ${n.evidenceStatus}${n.shortCode ? ` · code ${n.shortCode} = ${n.officialName}` : ""}`,
  }));

  return {
    schemaVersion: WIM_SCHEMA_VERSION,
    nodes,
    relationships,
    liveRecords: [],
    liveSourceStatus: "no_verified_live_source",
    honestyNotice:
      "No verified live source is connected yet. Map nodes and edges come from local registries and catalog relationships only — never decorative activity.",
    listFallback,
  };
}

export function forbidUnexplainedAbbreviation(node: WimEntityNode): boolean {
  if (!node.shortCode) return true;
  return Boolean(node.fullLabel && node.officialName && node.abbreviationForbiddenAlone);
}
