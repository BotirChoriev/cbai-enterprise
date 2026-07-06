/**
 * CBAI World Bank Connector Readiness — expected future record schema.
 * Shape definition only — no sample records or fabricated values.
 */

/** Future World Bank evidence record shape after adapter normalization. */
export type WorldBankRecordSchema = {
  /** ISO 3166-1 alpha-2 or alpha-3 country code from source metadata. */
  countryCode: string;
  /** Country display name as published by World Bank Open Data. */
  countryName: string;
  /** WDI or World Bank indicator code — taxonomy reference only. */
  indicatorCode: string;
  /** Indicator title as published by World Bank Open Data. */
  indicatorName: string;
  /** Observation year — integer calendar year. */
  year: number;
  /** Numeric observation value when applicable; null when not reported. */
  value: number | null;
  /** Unit label from source metadata (e.g. percent, USD, index). */
  unit: string;
  /** Official source attribution string from World Bank metadata. */
  source: string;
  /** ISO 8601 date string for last source update. */
  lastUpdated: string;
  /** License terms reference from World Bank Open Data. */
  license: string;
  /** Additional source metadata key-value pairs — structure only. */
  metadata: Readonly<Record<string, string>>;
};

export const WORLD_BANK_RECORD_REQUIRED_FIELDS = [
  "countryCode",
  "indicatorCode",
  "year",
  "source",
] as const satisfies readonly (keyof WorldBankRecordSchema)[];

export const WORLD_BANK_RECORD_OPTIONAL_FIELDS = [
  "countryName",
  "indicatorName",
  "value",
  "unit",
  "lastUpdated",
  "license",
  "metadata",
] as const satisfies readonly (keyof WorldBankRecordSchema)[];

export type WorldBankRequiredField = (typeof WORLD_BANK_RECORD_REQUIRED_FIELDS)[number];
export type WorldBankOptionalField = (typeof WORLD_BANK_RECORD_OPTIONAL_FIELDS)[number];

/** Declarative schema descriptor for readiness documentation and validation. */
export type WorldBankRecordSchemaDescriptor = {
  version: string;
  schemaId: string;
  requiredFields: readonly (keyof WorldBankRecordSchema)[];
  optionalFields: readonly (keyof WorldBankRecordSchema)[];
  valueType: string;
  yearType: string;
  metadataType: string;
};

export const WORLD_BANK_RECORD_SCHEMA_DESCRIPTOR: WorldBankRecordSchemaDescriptor = {
  version: "1.0.0",
  schemaId: "cbai-world-bank-record-v1",
  requiredFields: WORLD_BANK_RECORD_REQUIRED_FIELDS,
  optionalFields: WORLD_BANK_RECORD_OPTIONAL_FIELDS,
  valueType: "number | null",
  yearType: "integer",
  metadataType: "Record<string, string>",
} as const;

/** Partial record accepted by validation helpers — for future pipeline ingress. */
export type WorldBankRecordInput = Partial<WorldBankRecordSchema>;
