/**
 * CBAI UN / Human Rights Connector Readiness — expected future record schema.
 * Shape definition only — no sample records or fabricated values.
 */

/** Future UN / human-rights evidence record shape after adapter normalization. */
export type UnHumanRightsRecordSchema = {
  /** ISO 3166-1 alpha-2 or alpha-3 country code from source metadata. */
  countryCode: string;
  /** Country display name as published by official UN or agency source. */
  countryName: string;
  /** UN, SDG, or agency indicator code — taxonomy reference only. */
  indicatorCode: string;
  /** Indicator title as published by official source. */
  indicatorName: string;
  /** Observation year — integer calendar year. */
  year: number;
  /** Numeric observation value when applicable; null when not reported. */
  value: number | null;
  /** Unit label from source metadata. */
  unit: string;
  /** Official source attribution string. */
  source: string;
  /** Publishing UN agency or body (e.g. OHCHR, UNDP, UNICEF). */
  sourceAgency: string;
  /** URL or document reference to official methodology. */
  methodologyReference: string;
  /** ISO 8601 date string for last source update. */
  lastUpdated: string;
  /** License terms reference from official source. */
  license: string;
  /** Additional source metadata key-value pairs — structure only. */
  metadata: Readonly<Record<string, string>>;
};

export const UN_HUMAN_RIGHTS_RECORD_REQUIRED_FIELDS = [
  "countryCode",
  "indicatorCode",
  "year",
  "source",
  "sourceAgency",
  "methodologyReference",
] as const satisfies readonly (keyof UnHumanRightsRecordSchema)[];

export const UN_HUMAN_RIGHTS_RECORD_OPTIONAL_FIELDS = [
  "countryName",
  "indicatorName",
  "value",
  "unit",
  "lastUpdated",
  "license",
  "metadata",
] as const satisfies readonly (keyof UnHumanRightsRecordSchema)[];

export type UnHumanRightsRequiredField =
  (typeof UN_HUMAN_RIGHTS_RECORD_REQUIRED_FIELDS)[number];

export type UnHumanRightsOptionalField =
  (typeof UN_HUMAN_RIGHTS_RECORD_OPTIONAL_FIELDS)[number];

export type UnHumanRightsRecordSchemaDescriptor = {
  version: string;
  schemaId: string;
  requiredFields: readonly (keyof UnHumanRightsRecordSchema)[];
  optionalFields: readonly (keyof UnHumanRightsRecordSchema)[];
  valueType: string;
  yearType: string;
  metadataType: string;
};

export const UN_HUMAN_RIGHTS_RECORD_SCHEMA_DESCRIPTOR: UnHumanRightsRecordSchemaDescriptor = {
  version: "1.0.0",
  schemaId: "cbai-un-human-rights-record-v1",
  requiredFields: UN_HUMAN_RIGHTS_RECORD_REQUIRED_FIELDS,
  optionalFields: UN_HUMAN_RIGHTS_RECORD_OPTIONAL_FIELDS,
  valueType: "number | null",
  yearType: "integer",
  metadataType: "Record<string, string>",
};

/** Partial record accepted by validation helpers — for future pipeline ingress. */
export type UnHumanRightsRecordInput = Partial<UnHumanRightsRecordSchema>;
