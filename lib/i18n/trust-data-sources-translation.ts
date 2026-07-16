import type { TranslationDictionary } from "@/lib/i18n/dictionary-types";

const SOURCE_SCOPE_KEYS: Record<string, keyof TranslationDictionary["trustDataSources"]> = {
  "United Nations": "un",
  "World Bank Group": "worldBank",
  "International Monetary Fund": "imf",
  "World Health Organization": "who",
  UNESCO: "unesco",
  "International Labour Organization": "ilo",
  "International Telecommunication Union": "itu",
  OECD: "oecd",
  "Open Contracting Partnership": "ocp",
  "National statistical authorities": "nationalStats",
  "Government procurement authorities": "procurement",
  "Ministries of finance and audit institutions": "financeAudit",
};

export function translateDataSourceScope(
  dictionary: TranslationDictionary,
  sourceName: string,
): string {
  const key = SOURCE_SCOPE_KEYS[sourceName];
  return key ? dictionary.trustDataSources[key] : sourceName;
}
