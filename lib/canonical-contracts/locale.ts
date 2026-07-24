/**
 * Locale provenance contracts (Stage 1).
 * @see docs/architecture/locale-provenance-policy.md
 */

export type CanonicalUiLocale = "en" | "uz" | "ru" | "tr";

/**
 * Additive locale fields for user-authored records.
 * Records without these fields remain valid (backward compatible).
 */
export type LocaleProvenanceFields = {
  readonly contentLocale?: string;
  readonly createdLocale?: string;
  readonly systemCopyKey?: string;
};

export const LOCALE_PRESERVATION_RULES = {
  neverSilentlyTranslateUserContent: true,
  translateSystemLabelsAtRender: true,
  preserveOfficialSourceLanguage: true,
  unknownFieldsPreserved: true,
  migrationMustBeAdditiveOnly: true,
} as const;

/** Type guard: provenance object does not require both fields (backward compatible). */
export function hasCompleteLocaleProvenance(value: LocaleProvenanceFields): boolean {
  return Boolean(value.contentLocale && value.createdLocale);
}
