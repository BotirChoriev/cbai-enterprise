/**
 * Canonical interface-locale resolution — single source of truth for UI language codes.
 *
 * Priority (callers must honor this order when choosing a value to pass in):
 *   1. Explicit current user selection
 *   2. Persisted user/profile preference
 *   3. Supported initial browser locale (optional, first visit only — never after explicit choice)
 *   4. Product default (`en`)
 *
 * Once the user explicitly chooses a language, browser language must never override it.
 */

import {
  DEFAULT_LANGUAGE_CODE,
  getActiveLanguages,
  isActiveLanguageCode,
} from "@/lib/i18n/languages";

/** Active UI locales with full dictionaries today. */
export const CANONICAL_UI_LOCALES = ["en", "uz", "ru", "tr"] as const;
export type CanonicalUiLocale = (typeof CANONICAL_UI_LOCALES)[number];

const LEGACY_LOCALE_ALIASES: Record<string, CanonicalUiLocale> = {
  en: "en",
  "en-us": "en",
  "en-gb": "en",
  "en-au": "en",
  uz: "uz",
  "uz-uz": "uz",
  "uz-latn": "uz",
  "uz-cyrl": "uz", // Cyrillic UI pack not active — map to Latin UZ dictionary until activated
  ru: "ru",
  "ru-ru": "ru",
  "ru-ua": "ru",
  tr: "tr",
  "tr-tr": "tr",
};

/**
 * Normalize any stored/requested locale tag to a canonical active UI code.
 * Idempotent: `canonicalizeUiLocale(canonicalizeUiLocale(x)) === canonicalizeUiLocale(x)`.
 * Unsupported or empty values fall back to the product default — never to `ru` under UZ.
 */
export function canonicalizeUiLocale(raw: unknown): CanonicalUiLocale {
  if (typeof raw !== "string" || !raw.trim()) return DEFAULT_LANGUAGE_CODE as CanonicalUiLocale;
  const normalized = raw.trim().replace(/_/g, "-").toLowerCase();

  const exact = LEGACY_LOCALE_ALIASES[normalized];
  if (exact && isActiveLanguageCode(exact)) return exact;

  const primary = normalized.split("-")[0] ?? "";
  const primaryMapped = LEGACY_LOCALE_ALIASES[primary];
  if (primaryMapped && isActiveLanguageCode(primaryMapped)) return primaryMapped;

  if (isActiveLanguageCode(primary)) return primary as CanonicalUiLocale;

  return DEFAULT_LANGUAGE_CODE as CanonicalUiLocale;
}

/** True when `raw` already equals its canonical form (no migration needed). */
export function isCanonicalUiLocale(raw: unknown): raw is CanonicalUiLocale {
  return typeof raw === "string" && CANONICAL_UI_LOCALES.includes(raw as CanonicalUiLocale);
}

/**
 * Optional first-visit browser locale hint — only for callers that have confirmed
 * there is no explicit selection and no persisted preference yet.
 * Never use after the user has chosen a language.
 */
export function browserLocaleHint(languages: readonly string[] | undefined | null): CanonicalUiLocale | null {
  if (!languages?.length) return null;
  for (const tag of languages) {
    const canonical = canonicalizeUiLocale(tag);
    if (getActiveLanguages().some((l) => l.code === canonical)) {
      // Only accept if the primary language actually matched an active pack.
      const primary = tag.trim().replace(/_/g, "-").toLowerCase().split("-")[0];
      if (primary === canonical || LEGACY_LOCALE_ALIASES[tag.trim().replace(/_/g, "-").toLowerCase()] === canonical) {
        return canonical;
      }
    }
  }
  return null;
}
