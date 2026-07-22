/**
 * Ontology migrations — idempotent, non-destructive, backward compatible.
 */

import { ONTOLOGY_SCHEMA_VERSION } from "@/lib/ontology/types";
import type { OntologyObjectRecord } from "@/lib/ontology/types";
import { normalizeOntologyRecord } from "@/lib/ontology/normalization";

export const ONTOLOGY_STORAGE_KEY = "cbai-ontology-objects";
export const ONTOLOGY_RELATIONSHIPS_KEY = "cbai-ontology-relationships";
export const ONTOLOGY_AUDIT_KEY = "cbai-ontology-audit";
export const ONTOLOGY_MIGRATION_VERSION_KEY = "cbai-ontology-migration-version";

export const CURRENT_ONTOLOGY_MIGRATION_VERSION = 1 as const;

export type OntologyMigrationResult = {
  readonly migrated: boolean;
  readonly fromVersion: number;
  readonly toVersion: number;
  readonly objectsProcessed: number;
  readonly unknownFieldsPreserved: number;
};

/** Run idempotent migration on raw storage payload. Safe to call on every load. */
export function migrateOntologyStore(rawObjects: unknown): {
  objects: OntologyObjectRecord[];
  result: OntologyMigrationResult;
} {
  const fromVersion = 0;
  let unknownFieldsPreserved = 0;

  if (!Array.isArray(rawObjects)) {
    return {
      objects: [],
      result: { migrated: true, fromVersion, toVersion: CURRENT_ONTOLOGY_MIGRATION_VERSION, objectsProcessed: 0, unknownFieldsPreserved: 0 },
    };
  }

  const objects: OntologyObjectRecord[] = [];
  for (const item of rawObjects) {
    if (typeof item !== "object" || item === null) continue;
    const raw = item as Record<string, unknown>;
    const knownKeys = new Set([
      "id", "kind", "title", "description", "status", "contentLocale", "createdLocale",
      "provenance", "sourceReferences", "relationshipIds", "createdAt", "updatedAt",
      "schemaVersion", "metadata",
    ]);
    for (const key of Object.keys(raw)) {
      if (!knownKeys.has(key)) unknownFieldsPreserved++;
    }
    const normalized = normalizeOntologyRecord({
      ...raw,
      schemaVersion: ONTOLOGY_SCHEMA_VERSION,
    });
    if (normalized) objects.push(normalized);
  }

  return {
    objects,
    result: {
      migrated: true,
      fromVersion,
      toVersion: CURRENT_ONTOLOGY_MIGRATION_VERSION,
      objectsProcessed: objects.length,
      unknownFieldsPreserved,
    },
  };
}

/** Check if client-side migration marker needs update. */
export function needsOntologyMigration(storedVersion: unknown): boolean {
  const version = typeof storedVersion === "number" ? storedVersion : 0;
  return version < CURRENT_ONTOLOGY_MIGRATION_VERSION;
}
