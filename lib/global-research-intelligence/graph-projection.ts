/**
 * Graph / map projection for GRI — uses existing catalog + university/country registry only.
 */

import { RESEARCH_TOPICS } from "@/lib/research/research-topics";
import { universities } from "@/lib/universities";
import { countries } from "@/lib/countries";
import { namesMatch } from "@/lib/name-match";

export type GriGraphNode = {
  readonly id: string;
  readonly kind: "country" | "university" | "topic" | "method";
  readonly label: string;
  readonly evidenceStatus: "catalog_available" | "registry" | "not_connected";
};

export type GriGraphEdge = {
  readonly id: string;
  readonly fromId: string;
  readonly toId: string;
  readonly kind: "LOCATED_IN" | "CATALOG_METHOD" | "TOPIC_IN_DOMAIN";
  readonly provenance: "registry" | "catalog";
};

export type GriGraphProjection = {
  readonly nodes: readonly GriGraphNode[];
  readonly edges: readonly GriGraphEdge[];
  readonly honestyNotice: string;
  readonly listFallback: readonly { readonly label: string; readonly detail: string }[];
};

export function buildGriGraphProjection(limitTopics = 12): GriGraphProjection {
  const nodes: GriGraphNode[] = [];
  const edges: GriGraphEdge[] = [];
  const listFallback: { label: string; detail: string }[] = [];

  for (const c of countries) {
    nodes.push({
      id: `country:${c.id}`,
      kind: "country",
      label: c.name,
      evidenceStatus: "registry",
    });
  }

  for (const u of universities) {
    nodes.push({
      id: `university:${u.id}`,
      kind: "university",
      label: u.name,
      evidenceStatus: "registry",
    });
    const country = countries.find((c) => namesMatch(c.name, u.country));
    if (country) {
      edges.push({
        id: `edge:uni-${u.id}-country`,
        fromId: `university:${u.id}`,
        toId: `country:${country.id}`,
        kind: "LOCATED_IN",
        provenance: "registry",
      });
    }
    listFallback.push({
      label: u.name,
      detail: `${u.city}, ${u.country} — registry identity only`,
    });
  }

  for (const t of RESEARCH_TOPICS.slice(0, limitTopics)) {
    nodes.push({
      id: `topic:${t.topicId}`,
      kind: "topic",
      label: t.topicName,
      evidenceStatus: "catalog_available",
    });
    edges.push({
      id: `edge:topic-${t.topicId}-domain`,
      fromId: `topic:${t.topicId}`,
      toId: `topic:${t.topicId}`,
      kind: "TOPIC_IN_DOMAIN",
      provenance: "catalog",
    });
    for (const m of t.relatedMethods.slice(0, 2)) {
      const mid = `method:${t.topicId}:${m.slice(0, 24)}`;
      nodes.push({
        id: mid,
        kind: "method",
        label: m,
        evidenceStatus: "catalog_available",
      });
      edges.push({
        id: `edge:${mid}`,
        fromId: `topic:${t.topicId}`,
        toId: mid,
        kind: "CATALOG_METHOD",
        provenance: "catalog",
      });
    }
    listFallback.push({
      label: t.topicName,
      detail: `${t.domain} — catalog topic; researchers/publications not connected`,
    });
  }

  return {
    nodes,
    edges,
    honestyNotice:
      "Graph nodes/edges come only from local country/university registry and research topic catalog. No fabricated researchers, labs, or collaborations.",
    listFallback,
  };
}
