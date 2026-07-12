/**
 * One reusable translation lookup — not four separate hardcoded interfaces (Global Language
 * Foundation mission, Phase 6). Every non-English dictionary is type-checked against
 * `TranslationDictionary` at compile time (see lib/i18n/dictionary-types.ts), so a missing key is
 * a build error, not a silent gap. At runtime, a lookup that somehow still fails falls back to the
 * English dictionary at the same path, and only as an absolute last resort returns the dotted key
 * itself — a raw technical key is never shown to a user under normal operation.
 */

import type { TranslationDictionary } from "@/lib/i18n/dictionary-types";
import en from "@/lib/i18n/dictionaries/en";
import uz from "@/lib/i18n/dictionaries/uz";
import ru from "@/lib/i18n/dictionaries/ru";
import tr from "@/lib/i18n/dictionaries/tr";
import { DEFAULT_LANGUAGE_CODE } from "@/lib/i18n/languages";

const DICTIONARIES: Record<string, TranslationDictionary> = { en, uz, ru, tr };

export function getDictionary(languageCode: string): TranslationDictionary {
  return DICTIONARIES[languageCode] ?? DICTIONARIES[DEFAULT_LANGUAGE_CODE];
}

function lookup(dictionary: TranslationDictionary, path: string): string | undefined {
  const segments = path.split(".");
  let node: unknown = dictionary;
  for (const segment of segments) {
    if (typeof node !== "object" || node === null || !(segment in (node as Record<string, unknown>))) {
      return undefined;
    }
    node = (node as Record<string, unknown>)[segment];
  }
  return typeof node === "string" ? node : undefined;
}

/** Real dotted-path lookup (e.g. "project.status.active") within one dictionary, honestly falling
 * back to English, then to the path itself — never a raw i18n key shown as final output silently
 * unless every dictionary (including English) is missing it, which a full English dictionary
 * should never allow. */
export function translate(dictionary: TranslationDictionary, path: string): string {
  return lookup(dictionary, path) ?? lookup(en, path) ?? path;
}

/** Replaces `{placeholder}` tokens — e.g. interpolate("Welcome, {name}", {name: "Botir"}). */
export function interpolate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) => vars[key] ?? match);
}
