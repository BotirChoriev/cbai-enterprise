import type { TranslationDictionary } from "@/lib/i18n/dictionary-types";
import { GRAPH_ENTITY_TYPES, GRAPH_RELATIONSHIP_TYPES } from "@/lib/graph/graph-platform";

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
  if (label === "Evidence Available") return dictionary.graphUi.evidenceAvailable;
  if (label === "Evidence Missing") return dictionary.graphUi.evidenceMissing;
  if (label === "Local platform registry") return dictionary.graphUi.evidenceLabels.localPlatformRegistry;
  if (label === "Partnership verification — not inferred")
    return dictionary.graphUi.evidenceLabels.partnershipVerification;
  return label;
}
