/**
 * CBAI World Bank Connector Readiness — core type system.
 * Architecture only — no HTTP, fetch, credentials, or live data.
 */

import type {
  WorldBankRecordSchema,
  WorldBankRecordSchemaDescriptor,
} from "@/lib/connectors/world-bank/world-bank.schema";

export const WORLD_BANK_READINESS_VERSION = "1.0.0" as const;

export const WORLD_BANK_SOURCE_ID = "src-world-bank" as const;
export const WORLD_BANK_CONNECTOR_ID = "connector-world-bank" as const;

/** World Bank Open Data indicator area taxonomy for future country-level mapping. */
export type WorldBankIndicatorArea =
  | "economy"
  | "trade"
  | "employment"
  | "infrastructure"
  | "energy"
  | "health"
  | "education"
  | "digital-development"
  | "investment"
  | "industry"
  | "agriculture"
  | "climate";

export type WorldBankMappingStatus = "mapped" | "planned" | "requires_review";

/** Readiness lifecycle — no live connection implied. */
export type WorldBankReadinessStatus =
  | "architecture_defined"
  | "mapping_in_progress"
  | "validation_ready"
  | "awaiting_credentials"
  | "ready_for_implementation";

/** Official WDI indicator code reference — taxonomy identifier, not a data value. */
export type WorldBankIndicatorCodeRef = string & {
  readonly __brand: "WorldBankIndicatorCodeRef";
};

export type WorldBankIndicatorFamily = {
  familyId: string;
  area: WorldBankIndicatorArea;
  title: string;
  description: string;
  /** Public WDI indicator code references for future adapter binding. */
  referenceIndicatorCodes: readonly WorldBankIndicatorCodeRef[];
  /** CBAI Global Indicator Framework ID when mapped. */
  cbaiIndicatorId: string | null;
  cbaiIndicatorSlug: string | null;
  mappingStatus: WorldBankMappingStatus;
  mappingNotes: string;
};

export type WorldBankMappedIndicator = {
  familyId: string;
  area: WorldBankIndicatorArea;
  cbaiIndicatorId: string;
  cbaiIndicatorSlug: string;
  referenceIndicatorCodes: readonly WorldBankIndicatorCodeRef[];
};

export type WorldBankUnmappedIndicator = {
  familyId: string;
  area: WorldBankIndicatorArea;
  mappingStatus: Exclude<WorldBankMappingStatus, "mapped">;
  mappingNotes: string;
  referenceIndicatorCodes: readonly WorldBankIndicatorCodeRef[];
};

export type WorldBankVerificationRequirement = {
  id: string;
  label: string;
  description: string;
  required: boolean;
};

export type WorldBankConnectorReadinessModel = {
  sourceId: typeof WORLD_BANK_SOURCE_ID;
  connectorId: typeof WORLD_BANK_CONNECTOR_ID;
  supportedIndicators: readonly string[];
  supportedCountries: readonly string[];
  expectedDataShape: WorldBankRecordSchemaDescriptor;
  requiredFields: readonly (keyof WorldBankRecordSchema)[];
  optionalFields: readonly (keyof WorldBankRecordSchema)[];
  licenseNotes: string;
  updateFrequency: string;
  verificationRequirements: readonly WorldBankVerificationRequirement[];
  limitations: readonly string[];
  readinessStatus: WorldBankReadinessStatus;
  version: typeof WORLD_BANK_READINESS_VERSION;
};

export type WorldBankConnectorReadinessReport = {
  connectorId: typeof WORLD_BANK_CONNECTOR_ID;
  sourceId: typeof WORLD_BANK_SOURCE_ID;
  status: WorldBankReadinessStatus;
  mappedIndicators: readonly WorldBankMappedIndicator[];
  unmappedIndicators: readonly WorldBankUnmappedIndicator[];
  requiredNormalizers: readonly string[];
  verificationChecklist: readonly WorldBankVerificationRequirement[];
  limitations: readonly string[];
  nextSteps: readonly string[];
  builtAt: string;
  version: typeof WORLD_BANK_READINESS_VERSION;
};

export type WorldBankRecordValidationIssueCode =
  | "missing_country_code"
  | "missing_indicator_code"
  | "missing_year"
  | "missing_source"
  | "invalid_value_type"
  | "unknown_indicator_mapping"
  | "unknown_country";

export type WorldBankRecordValidationIssue = {
  code: WorldBankRecordValidationIssueCode;
  severity: "error" | "warning";
  message: string;
  field?: keyof WorldBankRecordSchema;
};

export type WorldBankRecordValidationReport = {
  valid: boolean;
  issueCount: number;
  errors: readonly WorldBankRecordValidationIssue[];
  warnings: readonly WorldBankRecordValidationIssue[];
};

export const WORLD_BANK_INDICATOR_AREAS: readonly WorldBankIndicatorArea[] = [
  "economy",
  "trade",
  "employment",
  "infrastructure",
  "energy",
  "health",
  "education",
  "digital-development",
  "investment",
  "industry",
  "agriculture",
  "climate",
] as const;
