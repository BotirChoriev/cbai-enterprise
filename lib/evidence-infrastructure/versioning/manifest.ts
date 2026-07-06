import type { SchemaVersionManifest } from "@/lib/evidence-infrastructure/types";
import { INFRASTRUCTURE_VERSION } from "@/lib/evidence-infrastructure/types";

/** Schema version manifest — supports future v1, v2, v3 evolution. */
export const SCHEMA_VERSION_MANIFEST: readonly SchemaVersionManifest[] = [
  {
    version: "v1",
    title: "CBAI Evidence Model v1",
    status: "active",
    introducedIn: INFRASTRUCTURE_VERSION,
    compatibleWith: ["v1"],
    breakingChanges: [],
  },
  {
    version: "v2",
    title: "CBAI Evidence Model v2",
    status: "planned",
    introducedIn: INFRASTRUCTURE_VERSION,
    compatibleWith: ["v1", "v2"],
    breakingChanges: [
      "Temporal evidence windows (validFrom, validTo)",
      "Multi-source provenance chains",
      "Structured document attachments",
    ],
  },
  {
    version: "v3",
    title: "CBAI Evidence Model v3",
    status: "planned",
    introducedIn: INFRASTRUCTURE_VERSION,
    compatibleWith: ["v2", "v3"],
    breakingChanges: [
      "Cross-entity evidence bundles",
      "Cryptographic attestation fields",
      "Tenant-scoped private evidence tier",
    ],
  },
] as const;

export const ACTIVE_SCHEMA_VERSION = "v1" as const;

export function getSchemaManifest(
  version: SchemaVersionManifest["version"],
): SchemaVersionManifest | undefined {
  return SCHEMA_VERSION_MANIFEST.find((m) => m.version === version);
}

export function getActiveSchemaVersions(): SchemaVersionManifest[] {
  return SCHEMA_VERSION_MANIFEST.filter((m) => m.status === "active");
}

export function isCompatibleSchema(
  from: SchemaVersionManifest["version"],
  to: SchemaVersionManifest["version"],
): boolean {
  const manifest = getSchemaManifest(to);
  return manifest?.compatibleWith.includes(from) ?? false;
}
