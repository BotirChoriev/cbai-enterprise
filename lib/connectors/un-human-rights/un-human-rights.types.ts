/**
 * CBAI UN / Human Rights Connector Readiness — core type system.
 * Architecture only — no HTTP, fetch, credentials, political scoring, or live data.
 */

import type {
  UnHumanRightsRecordSchema,
  UnHumanRightsRecordSchemaDescriptor,
} from "@/lib/connectors/un-human-rights/un-human-rights.schema";

export const UN_HUMAN_RIGHTS_READINESS_VERSION = "1.0.0" as const;

export const UN_HUMAN_RIGHTS_SOURCE_ID = "src-un" as const;
export const UN_HUMAN_RIGHTS_CONNECTOR_ID = "connector-united-nations" as const;

/** UN / human-rights policy area taxonomy for future country-level mapping. */
export type UnHumanRightsIndicatorArea =
  | "human-rights"
  | "governance"
  | "judicial-system"
  | "public-services"
  | "education"
  | "health"
  | "employment"
  | "gender-equality"
  | "child-protection"
  | "disability-inclusion"
  | "migration"
  | "civil-registration"
  | "sustainable-development";

export type UnHumanRightsMappingStatus = "mapped" | "planned" | "requires_review";

export type UnHumanRightsReadinessStatus =
  | "architecture_defined"
  | "mapping_in_progress"
  | "validation_ready"
  | "awaiting_credentials"
  | "ready_for_implementation";

/** Official UN / agency indicator code reference — taxonomy identifier, not a data value. */
export type UnHumanRightsIndicatorCodeRef = string & {
  readonly __brand: "UnHumanRightsIndicatorCodeRef";
};

/** Official UN agency source family — reference only, not connected. */
export type UnHumanRightsSourceFamilyId =
  | "united-nations-data"
  | "ohchr"
  | "undp"
  | "unicef"
  | "un-women"
  | "unhcr"
  | "ilo"
  | "who"
  | "unesco"
  | "sdg-global-database";

export type UnHumanRightsSourceFamily = {
  familyId: UnHumanRightsSourceFamilyId;
  label: string;
  organization: string;
  officialWebsite: string;
  description: string;
};

export type UnHumanRightsIndicatorFamily = {
  familyId: string;
  area: UnHumanRightsIndicatorArea;
  title: string;
  description: string;
  sourceFamilies: readonly UnHumanRightsSourceFamilyId[];
  referenceIndicatorCodes: readonly UnHumanRightsIndicatorCodeRef[];
  cbaiIndicatorId: string | null;
  cbaiIndicatorSlug: string | null;
  mappingStatus: UnHumanRightsMappingStatus;
  mappingNotes: string;
};

export type UnHumanRightsMappedIndicator = {
  familyId: string;
  area: UnHumanRightsIndicatorArea;
  cbaiIndicatorId: string;
  cbaiIndicatorSlug: string;
  referenceIndicatorCodes: readonly UnHumanRightsIndicatorCodeRef[];
  sourceFamilies: readonly UnHumanRightsSourceFamilyId[];
};

export type UnHumanRightsUnmappedIndicator = {
  familyId: string;
  area: UnHumanRightsIndicatorArea;
  mappingStatus: Exclude<UnHumanRightsMappingStatus, "mapped">;
  mappingNotes: string;
  referenceIndicatorCodes: readonly UnHumanRightsIndicatorCodeRef[];
  sourceFamilies: readonly UnHumanRightsSourceFamilyId[];
};

export type UnHumanRightsVerificationRequirement = {
  id: string;
  label: string;
  description: string;
  required: boolean;
};

export type UnHumanRightsNeutralityRule = {
  id: string;
  rule: string;
  description: string;
  enforced: boolean;
};

export type UnHumanRightsConnectorReadinessModel = {
  sourceId: typeof UN_HUMAN_RIGHTS_SOURCE_ID;
  connectorId: typeof UN_HUMAN_RIGHTS_CONNECTOR_ID;
  supportedIndicators: readonly string[];
  supportedCountries: readonly string[];
  expectedDataShape: UnHumanRightsRecordSchemaDescriptor;
  requiredFields: readonly (keyof UnHumanRightsRecordSchema)[];
  optionalFields: readonly (keyof UnHumanRightsRecordSchema)[];
  licenseNotes: string;
  updateFrequency: string;
  verificationRequirements: readonly UnHumanRightsVerificationRequirement[];
  neutralityRequirements: readonly UnHumanRightsNeutralityRule[];
  limitations: readonly string[];
  readinessStatus: UnHumanRightsReadinessStatus;
  version: typeof UN_HUMAN_RIGHTS_READINESS_VERSION;
};

export type UnHumanRightsConnectorReadinessReport = {
  connectorId: typeof UN_HUMAN_RIGHTS_CONNECTOR_ID;
  sourceId: typeof UN_HUMAN_RIGHTS_SOURCE_ID;
  status: UnHumanRightsReadinessStatus;
  mappedIndicators: readonly UnHumanRightsMappedIndicator[];
  unmappedIndicators: readonly UnHumanRightsUnmappedIndicator[];
  requiredNormalizers: readonly string[];
  verificationChecklist: readonly UnHumanRightsVerificationRequirement[];
  neutralityChecklist: readonly UnHumanRightsNeutralityRule[];
  limitations: readonly string[];
  nextSteps: readonly string[];
  builtAt: string;
  version: typeof UN_HUMAN_RIGHTS_READINESS_VERSION;
};

export type UnHumanRightsRecordValidationIssueCode =
  | "missing_country_code"
  | "missing_indicator_code"
  | "missing_year"
  | "missing_source"
  | "missing_source_agency"
  | "missing_methodology_reference"
  | "invalid_value_type"
  | "unknown_indicator_mapping"
  | "unknown_country"
  | "politically_sensitive_wording_risk"
  | "social_sentiment_scoring_risk";

export type UnHumanRightsRecordValidationIssue = {
  code: UnHumanRightsRecordValidationIssueCode;
  severity: "error" | "warning";
  message: string;
  field?: keyof UnHumanRightsRecordSchema;
};

export type UnHumanRightsRecordValidationReport = {
  valid: boolean;
  issueCount: number;
  errors: readonly UnHumanRightsRecordValidationIssue[];
  warnings: readonly UnHumanRightsRecordValidationIssue[];
};

export const UN_HUMAN_RIGHTS_INDICATOR_AREAS: readonly UnHumanRightsIndicatorArea[] = [
  "human-rights",
  "governance",
  "judicial-system",
  "public-services",
  "education",
  "health",
  "employment",
  "gender-equality",
  "child-protection",
  "disability-inclusion",
  "migration",
  "civil-registration",
  "sustainable-development",
] as const;

/** Neutrality rules for future connector implementation — local ruleset only. */
export const UN_HUMAN_RIGHTS_NEUTRALITY_RULES: readonly UnHumanRightsNeutralityRule[] = [
  {
    id: "neutrality-no-endorsement",
    rule: "No political endorsement",
    description: "Platform must not endorse governments, parties, or political movements.",
    enforced: true,
  },
  {
    id: "neutrality-no-condemnation",
    rule: "No political condemnation",
    description: "Platform must not condemn governments or leaders outside published official record citation.",
    enforced: true,
  },
  {
    id: "neutrality-no-popularity",
    rule: "No government popularity metrics",
    description: "Approval ratings and popularity indices are prohibited as user-facing metrics.",
    enforced: true,
  },
  {
    id: "neutrality-no-unrest-scoring",
    rule: "No social unrest scoring",
    description: "Unrest intensity, protest scores, and instability indices are prohibited.",
    enforced: true,
  },
  {
    id: "neutrality-no-sentiment",
    rule: "No citizen sentiment scoring",
    description: "Social sentiment, mood, or opinion mining scores are prohibited.",
    enforced: true,
  },
  {
    id: "neutrality-no-party-rec",
    rule: "No party or leader recommendations",
    description: "Platform must not recommend parties, candidates, or leaders.",
    enforced: true,
  },
  {
    id: "neutrality-no-prescription",
    rule: "No policy prescription",
    description: "Platform must not prescribe policy actions — methodology and evidence only.",
    enforced: true,
  },
  {
    id: "neutrality-source-required",
    rule: "Source attribution required",
    description: "Every record must cite official UN or agency source in source and sourceAgency fields.",
    enforced: true,
  },
  {
    id: "neutrality-methodology-required",
    rule: "Methodology reference required",
    description: "Every record must include methodologyReference for reproducibility.",
    enforced: true,
  },
] as const;
