/**
 * CBAI Evidence Infrastructure — core type system.
 * Architecture only. No HTTP, fetch, API, credentials, or scraping.
 */

export const INFRASTRUCTURE_VERSION = "1.0.0" as const;

/** Infrastructure schema version — supports future v1, v2, v3 evolution. */
export type EvidenceSchemaVersion = "v1" | "v2" | "v3";

export type ConnectionStatus = "planned" | "connected" | "deprecated";

export type VerificationStatus =
  | "not_started"
  | "verification_pending"
  | "verified"
  | "failed"
  | "not_applicable";

export type SupportedEntityType =
  | "country"
  | "company"
  | "university"
  | "government"
  | "institution";

/** Official evidence source record — registered once in infrastructure registry. */
export type EvidenceSourceRecord = {
  id: string;
  slug: string;
  name: string;
  organization: string;
  officialWebsite: string;
  coverage: string;
  supportedIndicators: readonly string[];
  updateFrequency: string;
  license: string;
  connectionStatus: ConnectionStatus;
  verificationStatus: VerificationStatus;
  infrastructureVersion: typeof INFRASTRUCTURE_VERSION;
};

/** Connector metadata — declarative contract surface (no runtime). */
export type ConnectorMetadata = {
  connectorId: string;
  sourceSlug: string;
  title: string;
  description: string;
  maintainer: string;
  documentationUrl?: string;
};

/** Connector health snapshot shape — populated by future runtime, not here. */
export type ConnectorHealth = {
  status: "unknown" | "healthy" | "degraded" | "unavailable";
  lastCheckedAt: string | null;
  message: string;
};

/** Connector contract — every future connector exposes this shape. */
export type ConnectorContract = {
  metadata: ConnectorMetadata;
  health: ConnectorHealth;
  version: string;
  supportedEntities: readonly SupportedEntityType[];
  supportedIndicators: readonly string[];
  schemaVersion: EvidenceSchemaVersion;
};

/** Adapter contract — transforms external structure into CBAI Evidence Model. */
export type AdapterContract = {
  adapterId: string;
  sourceSlug: string;
  title: string;
  description: string;
  inputFormat: string;
  outputSchema: EvidenceSchemaVersion;
  version: string;
  normalizersRequired: readonly NormalizerKind[];
};

export type NormalizerKind =
  | "date"
  | "unit"
  | "country-code"
  | "language"
  | "currency"
  | "classification";

/** Normalizer definition — converts external values to CBAI canonical form. */
export type NormalizerDefinition = {
  id: string;
  kind: NormalizerKind;
  title: string;
  description: string;
  inputExamples: readonly string[];
  outputFormat: string;
  standardReference?: string;
  version: typeof INFRASTRUCTURE_VERSION;
};

/** Provenance metadata on every evidence item. */
export type EvidenceProvenance = {
  sourceId: string;
  sourceSlug: string;
  retrievedAt: string | null;
  publishedAt: string | null;
  documentUrl: string | null;
  license: string;
  verificationStatus: VerificationStatus;
};

/** Typed evidence value — no scores or rankings. */
export type EvidenceValue =
  | { type: "text"; value: string }
  | { type: "number"; value: number; unit?: string }
  | { type: "boolean"; value: boolean }
  | { type: "date"; value: string }
  | { type: "code"; system: string; value: string }
  | { type: "reference"; entityType: SupportedEntityType; entityId: string }
  | { type: "unavailable"; reason: string };

/** CBAI Evidence Model — canonical internal representation. */
export type CbaiEvidenceItem = {
  id: string;
  schemaVersion: EvidenceSchemaVersion;
  sourceId: string;
  sourceSlug: string;
  indicatorSlug: string;
  entityType: SupportedEntityType;
  entityId: string;
  fieldKey: string;
  value: EvidenceValue;
  provenance: EvidenceProvenance;
  normalizedBy: readonly NormalizerKind[];
  infrastructureVersion: typeof INFRASTRUCTURE_VERSION;
};

/** Aggregated infrastructure registry. */
export type EvidenceInfrastructureRegistry = {
  version: typeof INFRASTRUCTURE_VERSION;
  sources: readonly EvidenceSourceRecord[];
  connectors: readonly ConnectorContract[];
  adapters: readonly AdapterContract[];
  normalizers: readonly NormalizerDefinition[];
};

/** Version manifest for schema evolution. */
export type SchemaVersionManifest = {
  version: EvidenceSchemaVersion;
  title: string;
  status: "active" | "deprecated" | "planned";
  introducedIn: typeof INFRASTRUCTURE_VERSION;
  breakingChanges?: readonly string[];
  compatibleWith: readonly EvidenceSchemaVersion[];
};
