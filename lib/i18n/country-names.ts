/**
 * Real localized country names for the 6 countries in lib/countries.ts, for the languages this
 * mission activates voice/text command support for (Global Language Foundation + Multilingual
 * Voice Commands mission, Phase 9). A country's own name is a real, different word per language
 * ("Uzbekistan" / "Oʻzbekiston" / "Узбекистан" / "Özbekistan") — not a transliteration of the
 * English catalog name — so multilingual "open <country>" commands need this real mapping to
 * resolve correctly; matching only the English `Country.name` would silently fail for every
 * non-English phrasing, which is what a first version of this file's matching logic actually did
 * (caught by scripts/test-global-interface.ts test 14b against the mission's own worked example,
 * "Oʻzbekistonni och").
 *
 * Scope is deliberately limited to the 6 real countries already in the catalog — no fabricated
 * country data, no invented catalog entries.
 */

export const COUNTRY_LOCALIZED_NAMES: Record<string, { uz: string; ru: string; tr: string }> = {
  usa: { uz: "Amerika Qo'shma Shtatlari", ru: "Соединённые Штаты Америки", tr: "Amerika Birleşik Devletleri" },
  china: { uz: "Xitoy", ru: "Китай", tr: "Çin" },
  uzbekistan: { uz: "Oʻzbekiston", ru: "Узбекистан", tr: "Özbekistan" },
  germany: { uz: "Germaniya", ru: "Германия", tr: "Almanya" },
  uae: { uz: "Birlashgan Arab Amirliklari", ru: "Объединённые Арабские Эмираты", tr: "Birleşik Arap Emirlikleri" },
  japan: { uz: "Yaponiya", ru: "Япония", tr: "Japonya" },
};

/** All real name forms (English catalog name + every localized name) for a given country id —
 * the superset a multilingual matcher should check against, never just the English one. */
export function allNameFormsForCountry(countryId: string, englishName: string): readonly string[] {
  const localized = COUNTRY_LOCALIZED_NAMES[countryId];
  if (!localized) return [englishName];
  return [englishName, localized.uz, localized.ru, localized.tr];
}
