import type { TranslationDictionary } from "@/lib/i18n/dictionary-types";
import { GRAPH_ENTITY_TYPES, GRAPH_RELATIONSHIP_TYPES } from "@/lib/graph/graph-platform";
import type { GraphEdge } from "@/lib/graph/graph.types";

export function translateGraphEntityTypes(dictionary: TranslationDictionary) {
  return GRAPH_ENTITY_TYPES.map((entry) => {
    const copy = dictionary.graphUi.entityTypes[entry.id as keyof typeof dictionary.graphUi.entityTypes];
    return copy ? { ...entry, label: copy.label, note: copy.note } : entry;
  });
}

export function translateGraphRelationshipTypes(dictionary: TranslationDictionary) {
  return GRAPH_RELATIONSHIP_TYPES.map((entry) => {
    const copy =
      dictionary.graphUi.relationshipTypes[entry.id as keyof typeof dictionary.graphUi.relationshipTypes];
    return copy ? { ...entry, label: copy.label, description: copy.description } : entry;
  });
}

export function translateGraphEvidenceLabel(
  dictionary: TranslationDictionary,
  label: string,
): string {
  const gp = dictionary.graphPlatform;
  const gui = dictionary.graphUi;

  if (label === "Evidence Available") return gui.evidenceAvailable;
  if (label === "Evidence Missing") return gui.evidenceMissing;
  if (label === "Local platform registry") return gui.evidenceLabels.localPlatformRegistry;
  if (label === "Partnership verification — not inferred")
    return gui.evidenceLabels.partnershipVerification;
  if (label === "Registry available") return gp.registryAvailable;
  if (label === "Evidence connected") return gp.evidenceConnected;
  if (label === "Evidence unavailable") return gp.evidenceUnavailable;
  if (label === "Insufficient Evidence") return gp.insufficientEvidence;
  if (label === "Evidence Source Not Connected") return gp.notConnected;
  if (label === "Country adapter") return gui.sourceAdapterCountry;
  if (label === "Company adapter") return gui.sourceAdapterCompany;
  if (label === "University adapter") return gui.sourceAdapterUniversity;
  return label;
}

export function translateGraphEvidenceStatus(
  dictionary: TranslationDictionary,
  status: GraphEdge["evidenceStatus"],
): string {
  return status === "evidence_available"
    ? dictionary.graphUi.evidenceAvailable
    : dictionary.graphUi.evidenceMissing;
}
