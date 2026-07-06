/**
 * CBAI Official Evidence Connector Architecture — core type system.
 * Connector definitions only — no HTTP, fetch, credentials, or scraping.
 */

import type { ConnectorCapability } from "@/lib/connectors/connector-capabilities";
import type { ConnectorStatus } from "@/lib/connectors/connector-status";

export const CONNECTOR_RECORD_VERSION = "1.0.0" as const;

/** Branded permanent connector identifier — format `connector-{slug}`. */
export type ConnectorId = string & { readonly __brand: "ConnectorId" };

/** Entity types a connector may serve — aligned with Evidence Infrastructure. */
export type ConnectorSupportedEntityType =
  | "country"
  | "company"
  | "university"
  | "government"
  | "institution";

/** Declarative authentication model — secrets never stored in code. */
export type ConnectorAuthenticationKind =
  | "none"
  | "api_key_vault"
  | "oauth2"
  | "certificate"
  | "custom";

export type ConnectorAuthentication = {
  kind: ConnectorAuthenticationKind;
  description: string;
  /** Future vault key reference — never contains secrets. */
  vaultKeyRef?: string;
};

/** Declarative rate limit contract for future runtime enforcement. */
export type ConnectorRateLimits = {
  description: string;
  requestsPerMinute?: number;
  requestsPerDay?: number;
};

/** Geographic or jurisdictional coverage scope. */
export type ConnectorCoverageScope = {
  /** Human-readable coverage summary. */
  summary: string;
  /** ISO country codes, region codes, or `global` for worldwide sources. */
  supportedCountries: readonly string[];
  /** BCP-47 language tags or `multilingual`. */
  supportedLanguages: readonly string[];
};

export type ConnectorDefinition = {
  connectorId: ConnectorId;
  connectorName: string;
  organization: string;
  officialWebsite: string;
  coverage: ConnectorCoverageScope;
  supportedEntities: readonly ConnectorSupportedEntityType[];
  /** Global Indicator Framework indicator IDs. */
  supportedIndicators: readonly string[];
  authentication: ConnectorAuthentication;
  rateLimits: ConnectorRateLimits;
  updateFrequency: string;
  license: string;
  capabilities: readonly ConnectorCapability[];
  status: ConnectorStatus;
  version: typeof CONNECTOR_RECORD_VERSION;
  /** Evidence Infrastructure source ID when registered — optional for future sources. */
  evidenceSourceId?: string;
  /** Evidence Infrastructure source slug for adapter binding. */
  evidenceSourceSlug?: string;
  /** Global Registry entity types this connector can enrich. */
  registryEntityTypes: readonly ("country" | "company" | "university")[];
  /** Mission IDs that may require this connector when implemented. */
  missionIds: readonly string[];
};

export type ConnectorRegistry = {
  version: string;
  connectorRecordVersion: typeof CONNECTOR_RECORD_VERSION;
  builtAt: string;
  connectors: readonly ConnectorDefinition[];
  connectorCount: number;
  byStatus: Readonly<Partial<Record<ConnectorStatus, number>>>;
  byCapability: Readonly<Partial<Record<ConnectorCapability, number>>>;
};

export type ConnectorRegistryIndex = {
  byId: ReadonlyMap<ConnectorId, ConnectorDefinition>;
  byStatus: ReadonlyMap<ConnectorStatus, readonly ConnectorDefinition[]>;
  byEntityType: ReadonlyMap<ConnectorSupportedEntityType, readonly ConnectorDefinition[]>;
  byEvidenceSourceId: ReadonlyMap<string, readonly ConnectorDefinition[]>;
  byCapability: ReadonlyMap<ConnectorCapability, readonly ConnectorDefinition[]>;
};

export type ConnectorValidationIssue = {
  code:
    | "duplicate_connector_id"
    | "invalid_connector_id_format"
    | "unknown_indicator"
    | "unknown_entity_type"
    | "broken_capability"
    | "broken_coverage"
    | "unknown_evidence_source"
    | "invalid_authentication"
    | "invalid_status";
  severity: "error" | "warning";
  message: string;
  connectorId?: ConnectorId;
  reference?: string;
};

export type ConnectorValidationReport = {
  valid: boolean;
  issueCount: number;
  errors: readonly ConnectorValidationIssue[];
  warnings: readonly ConnectorValidationIssue[];
};

/** Declarative catalog entry before requirement resolution. */
export type ConnectorCatalogEntry = {
  slug: string;
  connectorName: string;
  organization: string;
  officialWebsite: string;
  coverageSummary: string;
  supportedCountries: readonly string[];
  supportedLanguages: readonly string[];
  supportedEntities: readonly ConnectorSupportedEntityType[];
  /** Indicator slugs from Global Indicator Framework. */
  supportedIndicatorSlugs: readonly string[];
  capabilities: readonly ConnectorCapability[];
  authentication: ConnectorAuthentication;
  rateLimits: ConnectorRateLimits;
  updateFrequency: string;
  license: string;
  status?: ConnectorStatus;
  evidenceSourceId?: string;
  evidenceSourceSlug?: string;
  registryEntityTypes?: readonly ("country" | "company" | "university")[];
};

export const CONNECTOR_SUPPORTED_ENTITY_TYPES: readonly ConnectorSupportedEntityType[] = [
  "country",
  "company",
  "university",
  "government",
  "institution",
] as const;

export const CONNECTOR_REGISTRY_ENTITY_TYPES = [
  "country",
  "company",
  "university",
] as const;

export type ConnectorRegistryEntityType = (typeof CONNECTOR_REGISTRY_ENTITY_TYPES)[number];
