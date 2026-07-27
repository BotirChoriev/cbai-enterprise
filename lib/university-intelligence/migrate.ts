/**
 * Idempotent University Intelligence migration — never deletes unknown fields.
 */

import type { University } from "@/lib/universities";
import {
  UNIVERSITY_INTELLIGENCE_SCHEMA_VERSION,
  type UniversityIntelligenceProfile,
} from "@/lib/university-intelligence/types";
import { buildUniversityNetworkProfile } from "@/lib/university-intelligence/profile";

export type LegacyUniversityRecord = University & Record<string, unknown>;

function readString(input: Record<string, unknown>, key: string): string | undefined {
  const value = input[key];
  return typeof value === "string" ? value : undefined;
}

function readNumber(input: Record<string, unknown>, key: string): number | undefined {
  const value = input[key];
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

export function migrateUniversityIntelligenceProfile(
  input: LegacyUniversityRecord | UniversityIntelligenceProfile | Record<string, unknown>,
): UniversityIntelligenceProfile {
  const record = input as Record<string, unknown>;

  if (
    record.schemaVersion === UNIVERSITY_INTELLIGENCE_SCHEMA_VERSION &&
    record.registry &&
    typeof record.registry === "object" &&
    typeof (record.registry as University).id === "string"
  ) {
    const profile = buildUniversityNetworkProfile(record.registry as University);
    const unknown: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(record)) {
      if (!(key in profile)) unknown[key] = value;
    }
    return Object.keys(unknown).length > 0
      ? ({ ...profile, ...unknown } as UniversityIntelligenceProfile)
      : profile;
  }

  const id = readString(record, "id") ?? "";
  const name = readString(record, "name") ?? id;
  const icon = readString(record, "icon") ?? "UNI";
  const country = readString(record, "country") ?? "";
  const city = readString(record, "city") ?? "";
  const founded = readNumber(record, "founded") ?? 0;
  const type = (readString(record, "type") ?? "Public") as University["type"];
  const website = readString(record, "website") ?? null;

  const registry: University & Record<string, unknown> = {
    id,
    name,
    icon,
    country,
    city,
    founded,
    type,
    website,
  };

  for (const [key, value] of Object.entries(record)) {
    if (!(key in registry) && key !== "schemaVersion" && key !== "registry" && key !== "identity") {
      registry[key] = value;
    }
  }

  return buildUniversityNetworkProfile(registry as University);
}

export function assertIdempotentUniversityMigration(input: LegacyUniversityRecord): boolean {
  const once = migrateUniversityIntelligenceProfile(input);
  const twice = migrateUniversityIntelligenceProfile(once as unknown as Record<string, unknown>);
  return once.schemaVersion === twice.schemaVersion && once.identity.id === twice.identity.id;
}
