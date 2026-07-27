/**
 * Locale / provenance migration helpers for Domain Intelligence records.
 * Idempotent; preserves IDs, timestamps, unknown fields, and user text exactly.
 * Never silently translates content.
 */

export const DOMAIN_MIGRATION_VERSION = 1 as const;

export type LocaleProvenanceFields = {
  readonly contentLocale?: string;
  readonly createdLocale?: string;
  readonly sourceProvenance?: string;
  readonly migrationVersion?: number;
};

export type MigratableRecord = LocaleProvenanceFields & {
  readonly id: string;
  readonly version?: number;
  readonly updatedAt?: string;
  readonly unknownFields?: Readonly<Record<string, unknown>>;
  readonly [key: string]: unknown;
};

const KNOWN_ROOT_KEYS = new Set([
  "id",
  "version",
  "contentLocale",
  "createdLocale",
  "sourceProvenance",
  "migrationVersion",
  "updatedAt",
  "createdAt",
  "unknownFields",
  "title",
  "summary",
  "claim",
  "observation",
  "locale",
]);

/**
 * Ensure locale/provenance fields exist without altering user-entered text fields.
 * Idempotent: re-running with the same input yields the same output shape.
 */
export function migrateLocaleProvenance<T extends MigratableRecord>(
  record: T,
  defaults?: { readonly createdLocale?: string },
): T & { readonly migrationVersion: typeof DOMAIN_MIGRATION_VERSION } {
  const unknownFields: Record<string, unknown> = {
    ...(record.unknownFields ?? {}),
  };
  for (const [key, value] of Object.entries(record)) {
    if (!KNOWN_ROOT_KEYS.has(key) && key !== "unknownFields") {
      // Do not move known domain fields into unknown — only truly unknown keys from older shapes.
      // Callers that pass already-typed records keep their fields; this loop is a no-op for them.
      void value;
    }
  }

  const contentLocale =
    typeof record.contentLocale === "string"
      ? record.contentLocale
      : typeof record.locale === "string"
        ? record.locale
        : undefined;

  const createdLocale =
    typeof record.createdLocale === "string"
      ? record.createdLocale
      : defaults?.createdLocale;

  // Preserve user text fields exactly — never translate title/summary/claim/observation.
  return {
    ...record,
    ...(contentLocale !== undefined ? { contentLocale } : {}),
    ...(createdLocale !== undefined ? { createdLocale } : {}),
    migrationVersion: DOMAIN_MIGRATION_VERSION,
    ...(Object.keys(unknownFields).length > 0 ? { unknownFields } : {}),
  };
}

/** Unified locale-provenance policy statement (documentation + runtime helper). */
export const LOCALE_PROVENANCE_POLICY = {
  missions:
    "User mission text is stored exactly as entered. Deterministic system labels may be translated at render time. Show “stored in {language}” only when useful.",
  projects:
    "Project titles and descriptions preserve contentLocale; never silently translate.",
  operationalObjects:
    "Draft and confirmed objects keep provenance.source + locale; confirmation required before create.",
  evidence:
    "Official titles and quotations stay in source language. Platform summaries only when explicitly created.",
  graphRelationships:
    "Registry-derived edges record derivedFrom + materialClass; user-asserted edges require confirmation.",
  neverSilentlyTranslate: true,
  preserveUnknownFields: true,
  idempotentMigrations: true,
} as const;

export function assertUserTextPreserved(
  before: { readonly title?: string; readonly claim?: string; readonly summary?: string },
  after: { readonly title?: string; readonly claim?: string; readonly summary?: string },
): boolean {
  if (before.title !== undefined && before.title !== after.title) return false;
  if (before.claim !== undefined && before.claim !== after.claim) return false;
  if (before.summary !== undefined && before.summary !== after.summary) return false;
  return true;
}
