/**
 * CBAI UN / Human Rights Connector Readiness Layer — public API.
 * Architecture only — no HTTP, fetch, credentials, political scoring, or live data.
 */

export {
  UN_HUMAN_RIGHTS_READINESS_VERSION,
  UN_HUMAN_RIGHTS_SOURCE_ID,
  UN_HUMAN_RIGHTS_CONNECTOR_ID,
  UN_HUMAN_RIGHTS_INDICATOR_AREAS,
  UN_HUMAN_RIGHTS_NEUTRALITY_RULES,
  type UnHumanRightsIndicatorArea,
  type UnHumanRightsMappingStatus,
  type UnHumanRightsReadinessStatus,
  type UnHumanRightsIndicatorCodeRef,
  type UnHumanRightsSourceFamilyId,
  type UnHumanRightsSourceFamily,
  type UnHumanRightsIndicatorFamily,
  type UnHumanRightsMappedIndicator,
  type UnHumanRightsUnmappedIndicator,
  type UnHumanRightsVerificationRequirement,
  type UnHumanRightsNeutralityRule,
  type UnHumanRightsConnectorReadinessModel,
  type UnHumanRightsConnectorReadinessReport,
  type UnHumanRightsRecordValidationIssueCode,
  type UnHumanRightsRecordValidationIssue,
  type UnHumanRightsRecordValidationReport,
} from "@/lib/connectors/un-human-rights/un-human-rights.types";

export {
  UN_HUMAN_RIGHTS_RECORD_REQUIRED_FIELDS,
  UN_HUMAN_RIGHTS_RECORD_OPTIONAL_FIELDS,
  UN_HUMAN_RIGHTS_RECORD_SCHEMA_DESCRIPTOR,
  type UnHumanRightsRecordSchema,
  type UnHumanRightsRecordSchemaDescriptor,
  type UnHumanRightsRequiredField,
  type UnHumanRightsOptionalField,
  type UnHumanRightsRecordInput,
} from "@/lib/connectors/un-human-rights/un-human-rights.schema";

export {
  UN_HUMAN_RIGHTS_SOURCE_FAMILIES,
  UN_HUMAN_RIGHTS_INDICATOR_FAMILIES,
  getUnHumanRightsSourceFamilyById,
  getUnHumanRightsIndicatorFamilyById,
  getUnHumanRightsFamiliesByArea,
} from "@/lib/connectors/un-human-rights/un-human-rights.indicators";

export {
  resolveUnHumanRightsIndicatorFamily,
  resolveCbaiIndicatorIdFromUnHumanRightsCode,
  getMappedUnHumanRightsIndicators,
  getUnmappedUnHumanRightsIndicators,
  getSupportedUnHumanRightsCbaiIndicatorIds,
  isUnHumanRightsCodeMapped,
  UN_HUMAN_RIGHTS_INDICATOR_CODE_INDEX,
} from "@/lib/connectors/un-human-rights/un-human-rights.mapping";

export {
  validateUnHumanRightsCountryCode,
  validateUnHumanRightsIndicatorCode,
  validateUnHumanRightsYear,
  validateUnHumanRightsSource,
  validateUnHumanRightsSourceAgency,
  validateUnHumanRightsMethodologyReference,
  validateUnHumanRightsValue,
  validateUnHumanRightsSentimentRisk,
  validateUnHumanRightsPoliticalSensitivityRisk,
  validateUnHumanRightsRecord,
  isCompleteUnHumanRightsRecord,
  assertValidUnHumanRightsRecord,
} from "@/lib/connectors/un-human-rights/un-human-rights.validation";

export {
  buildUnHumanRightsConnectorReadinessModel,
  getUnHumanRightsConnectorReadiness,
  summarizeUnHumanRightsReadiness,
} from "@/lib/connectors/un-human-rights/un-human-rights.readiness";
