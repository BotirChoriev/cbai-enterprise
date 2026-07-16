import type { Entity } from "@/lib/entity/entity.types";
import type { GraphEdge, GraphNode } from "@/lib/graph/graph.types";
import { GRAPH_EVIDENCE_LABELS } from "@/lib/graph/graph-platform";
import type { TranslationDictionary } from "@/lib/i18n/dictionary-types";
import { translateGraphEvidenceLabel } from "@/lib/i18n/graph-ui-translation";

export type EntityGraphEvidenceSummary = {
  evidenceStatus: string;
  relationshipCount: number;
  availableSources: string[];
  availableInformation: string;
  futureEvidence: string;
};

export function resolveEntityEvidenceStatus(entity: Entity, dictionary?: TranslationDictionary): string {
  let status: string;
  if (entity.type === "country" || entity.type === "company") {
    status = GRAPH_EVIDENCE_LABELS.registryAvailable;
  } else if (entity.type === "university") {
    status =
      entity.aiSummary === GRAPH_EVIDENCE_LABELS.insufficientEvidence
        ? GRAPH_EVIDENCE_LABELS.registryAvailable
        : GRAPH_EVIDENCE_LABELS.registryAvailable;
  } else {
    status = GRAPH_EVIDENCE_LABELS.evidenceUnavailable;
  }

  return dictionary ? translateGraphEvidenceLabel(dictionary, status) : status;
}

export function resolveAvailableSources(entity: Entity, dictionary?: TranslationDictionary): string[] {
  const sources = ["Local platform registry"];

  if (entity.type === "country") {
    sources.push("Country adapter");
  }
  if (entity.type === "company") {
    sources.push("Company adapter");
  }
  if (entity.type === "university") {
    sources.push("University adapter");
  }

  return dictionary
    ? sources.map((source) => translateGraphEvidenceLabel(dictionary, source))
    : sources;
}

export function buildEntityGraphEvidenceSummary(
  node: GraphNode,
  connectedEdges: GraphEdge[],
  dictionary?: TranslationDictionary,
): EntityGraphEvidenceSummary {
  const entity = node.entity;
  const relationshipCount = connectedEdges.length;

  return {
    evidenceStatus: resolveEntityEvidenceStatus(entity, dictionary),
    relationshipCount,
    availableSources: resolveAvailableSources(entity, dictionary),
    availableInformation: entity.overview,
    futureEvidence: dictionary
      ? dictionary.graphUi.futureEvidenceDefault
      : "Partnership verification, collaboration contracts, and extended neighbor types require connected evidence sources.",
  };
}

export function formatEdgeEvidenceStatus(
  status: GraphEdge["evidenceStatus"],
  dictionary?: TranslationDictionary,
): string {
  const label = status === "evidence_available" ? "Evidence Available" : "Evidence Missing";
  return dictionary ? translateGraphEvidenceLabel(dictionary, label) : label;
}
