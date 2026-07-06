/**
 * CBAI World Bank Connector Readiness Layer — public API.
 * Architecture only — no HTTP, fetch, credentials, or live data.
 */

export {
  WORLD_BANK_READINESS_VERSION,
  WORLD_BANK_SOURCE_ID,
  WORLD_BANK_CONNECTOR_ID,
  WORLD_BANK_INDICATOR_AREAS,
  type WorldBankIndicatorArea,
  type WorldBankMappingStatus,
  type WorldBankReadinessStatus,
  type WorldBankIndicatorCodeRef,
  type WorldBankIndicatorFamily,
  type WorldBankMappedIndicator,
  type WorldBankUnmappedIndicator,
  type WorldBankVerificationRequirement,
  type WorldBankConnectorReadinessModel,
  type WorldBankConnectorReadinessReport,
  type WorldBankRecordValidationIssueCode,
  type WorldBankRecordValidationIssue,
  type WorldBankRecordValidationReport,
} from "@/lib/connectors/world-bank/world-bank.types";

export {
  WORLD_BANK_RECORD_REQUIRED_FIELDS,
  WORLD_BANK_RECORD_OPTIONAL_FIELDS,
  WORLD_BANK_RECORD_SCHEMA_DESCRIPTOR,
  type WorldBankRecordSchema,
  type WorldBankRecordSchemaDescriptor,
  type WorldBankRequiredField,
  type WorldBankOptionalField,
  type WorldBankRecordInput,
} from "@/lib/connectors/world-bank/world-bank.schema";

export {
  WORLD_BANK_INDICATOR_FAMILIES,
  getWorldBankIndicatorFamilyById,
  getWorldBankFamiliesByArea,
} from "@/lib/connectors/world-bank/world-bank.indicators";

export {
  resolveWorldBankIndicatorFamily,
  resolveCbaiIndicatorIdFromWorldBankCode,
  getMappedWorldBankIndicators,
  getUnmappedWorldBankIndicators,
  getSupportedCbaiIndicatorIds,
  isWorldBankCodeMapped,
  WORLD_BANK_INDICATOR_CODE_INDEX,
} from "@/lib/connectors/world-bank/world-bank.mapping";

export {
  validateWorldBankCountryCode,
  validateWorldBankIndicatorCode,
  validateWorldBankYear,
  validateWorldBankSource,
  validateWorldBankValue,
  validateWorldBankRecord,
  isCompleteWorldBankRecord,
  assertValidWorldBankRecord,
} from "@/lib/connectors/world-bank/world-bank.validation";

export {
  buildWorldBankConnectorReadinessModel,
  getWorldBankConnectorReadiness,
  summarizeWorldBankReadiness,
} from "@/lib/connectors/world-bank/world-bank.readiness";
