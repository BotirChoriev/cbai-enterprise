import type { TranslationDictionary } from "@/lib/i18n/dictionary-types";

export function translateGraphPlatform(dictionary: TranslationDictionary) {
  return dictionary.graphPlatform;
}

export function translateGraphEvidenceLabel(
  dictionary: TranslationDictionary,
  label: keyof TranslationDictionary["graphPlatform"],
): string {
  return dictionary.graphPlatform[label];
}
