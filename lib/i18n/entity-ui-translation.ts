import type { TranslationDictionary } from "@/lib/i18n/dictionary-types";

export const REGISTRY_SOURCE_LABEL = "Available — CBAI Local Registry";
export const INSUFFICIENT_EVIDENCE_LABEL = "Insufficient Evidence";

const INDICATOR_CONNECTED_RE = /^(\d+) indicator connected$/;

/** Translate entity list-card evidence badges (countries, companies, universities). */
export function translateEntityListEvidenceLabel(
  dictionary: TranslationDictionary,
  label: string,
): string {
  const gp = dictionary.graphPlatform;
  const match = INDICATOR_CONNECTED_RE.exec(label);
  if (match) {
    const count = Number(match[1]);
    if (count === 1) return dictionary.entityUi.indicatorConnectedOne;
    return dictionary.entityUi.indicatorConnectedMany.replace("{count}", String(count));
  }
  if (label === "Registry available") return gp.registryAvailable;
  if (label === INSUFFICIENT_EVIDENCE_LABEL) return gp.insufficientEvidence;
  if (label === "Evidence connected") return gp.evidenceConnected;
  if (label === "Evidence unavailable") return gp.evidenceUnavailable;
  if (label === "Evidence Source Not Connected") return gp.notConnected;
  return label;
}

/** Translate registry availability lines in entity overview sections. */
export function translateOfficialInformationLabel(
  dictionary: TranslationDictionary,
  sourceLabel: string,
): string {
  if (sourceLabel === REGISTRY_SOURCE_LABEL) {
    return dictionary.entityUi.officialInformationAvailable;
  }
  if (sourceLabel === INSUFFICIENT_EVIDENCE_LABEL) {
    return dictionary.entityUi.officialInformationNotAvailableYet;
  }
  return sourceLabel;
}

/** Known English UI phrases that must not appear in translated entity runtime strings. */
export const UZ_ENTITY_UI_LEAKAGE_PHRASES = [
  "Create Project",
  "Selected",
  "Official information available",
  "indicator connected",
  "Registry available",
  "Share",
  "Capital:",
] as const;

export function translateCountryRegion(dictionary: TranslationDictionary, region: string): string {
  const map: Record<string, string> = {
    Americas: dictionary.filters.regionAmericas,
    Asia: dictionary.filters.regionAsia,
    Europe: dictionary.filters.regionEurope,
    "Middle East": dictionary.filters.regionMiddleEast,
  };
  return map[region] ?? region;
}

export function assertNoEnglishEntityUiLeakage(translated: string, context: string): void {
  for (const phrase of UZ_ENTITY_UI_LEAKAGE_PHRASES) {
    if (translated.includes(phrase)) {
      throw new Error(`English UI leakage (${context}): "${phrase}" in "${translated}"`);
    }
  }
}
