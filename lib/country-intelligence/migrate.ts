/**
 * Idempotent CountryProfile migration — never deletes unknown fields.
 */

import type { Country } from "@/lib/countries";
import {
  COUNTRY_INTELLIGENCE_SCHEMA_VERSION,
  type CountryProfile,
} from "@/lib/country-intelligence/types";
import { buildCountryProfile } from "@/lib/country-intelligence/profile";

export type LegacyCountryRecord = Country & Record<string, unknown>;

function readString(input: Record<string, unknown>, key: string): string | undefined {
  const value = input[key];
  return typeof value === "string" ? value : undefined;
}

/**
 * Migrate a legacy country registry record (or prior profile blob) into
 * CountryProfile. Idempotent: applying twice yields the same schemaVersion
 * and preserves unknown legacy keys on `registry` via shallow merge.
 */
export function migrateCountryProfile(
  input: LegacyCountryRecord | CountryProfile | Record<string, unknown>,
): CountryProfile {
  const record = input as Record<string, unknown>;

  if (
    record &&
    typeof record === "object" &&
    record.schemaVersion === COUNTRY_INTELLIGENCE_SCHEMA_VERSION &&
    record.registry &&
    typeof record.registry === "object" &&
    typeof (record.registry as Country).id === "string"
  ) {
    // Already migrated — rebuild from registry to refresh derived slots,
    // then re-attach any unknown top-level keys that callers stored.
    const profile = buildCountryProfile(record.registry as Country);
    const unknown: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(record)) {
      if (!(key in profile)) unknown[key] = value;
    }
    return Object.keys(unknown).length > 0 ? ({ ...profile, ...unknown } as CountryProfile) : profile;
  }

  // Legacy Country-shaped record (or partial).
  const id = readString(record, "id") ?? "";
  const name = readString(record, "name") ?? id;
  const code = readString(record, "code") ?? "";
  const region = record.region as Country["region"];
  const capital = readString(record, "capital") ?? "";
  const government = readString(record, "government") ?? "";
  const officialWebsite = readString(record, "officialWebsite");

  const registry: Country & Record<string, unknown> = {
    id,
    name,
    code,
    region,
    capital,
    government,
    ...(officialWebsite ? { officialWebsite } : {}),
  };

  // Preserve unknown legacy fields on the registry object.
  for (const [key, value] of Object.entries(record)) {
    if (!(key in registry) && key !== "schemaVersion" && key !== "registry") {
      registry[key] = value;
    }
  }

  return buildCountryProfile(registry as Country);
}

/** True when migrate(migrate(x)) preserves schemaVersion and id. */
export function assertIdempotentMigration(input: LegacyCountryRecord): boolean {
  const once = migrateCountryProfile(input);
  const twice = migrateCountryProfile(once as unknown as Record<string, unknown>);
  return once.schemaVersion === twice.schemaVersion && once.id === twice.id;
}
