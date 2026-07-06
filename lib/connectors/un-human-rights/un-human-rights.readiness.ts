/**
 * CBAI UN / Human Rights Connector Readiness — readiness model and report.
 * No external data, HTTP, fetch, or runtime side effects.
 */

import { countries } from "@/lib/countries";
import { findConnectorByIdString } from "@/lib/connectors";
import {
  getMappedUnHumanRightsIndicators,
  getSupportedUnHumanRightsCbaiIndicatorIds,
  getUnmappedUnHumanRightsIndicators,
} from "@/lib/connectors/un-human-rights/un-human-rights.mapping";
import { UN_HUMAN_RIGHTS_INDICATOR_FAMILIES } from "@/lib/connectors/un-human-rights/un-human-rights.indicators";
import {
  UN_HUMAN_RIGHTS_RECORD_OPTIONAL_FIELDS,
  UN_HUMAN_RIGHTS_RECORD_REQUIRED_FIELDS,
  UN_HUMAN_RIGHTS_RECORD_SCHEMA_DESCRIPTOR,
} from "@/lib/connectors/un-human-rights/un-human-rights.schema";
import type {
  UnHumanRightsConnectorReadinessModel,
  UnHumanRightsConnectorReadinessReport,
  UnHumanRightsReadinessStatus,
  UnHumanRightsVerificationRequirement,
} from "@/lib/connectors/un-human-rights/un-human-rights.types";
import {
  UN_HUMAN_RIGHTS_CONNECTOR_ID,
  UN_HUMAN_RIGHTS_NEUTRALITY_RULES,
  UN_HUMAN_RIGHTS_READINESS_VERSION,
  UN_HUMAN_RIGHTS_SOURCE_ID,
} from "@/lib/connectors/un-human-rights/un-human-rights.types";

const UN_HUMAN_RIGHTS_LIMITATIONS: readonly string[] = [
  "No live UN or agency API connection in v1 readiness architecture.",
  "No human rights scores, rankings, or composite indices are produced.",
  "No political conclusions, endorsements, or condemnations.",
  "No social sentiment or citizen mood scoring.",
  "Gender equality, child protection, disability inclusion, and migration require CBAI framework extension.",
  "Agency-specific series (WHO, ILO, UNESCO) require disambiguation from UN SDG proxy data.",
  "Country coverage limited to CBAI local country registry until Global Registry wiring is complete.",
  "Indicator values are never synthesized — only mapping readiness is defined.",
] as const;

const VERIFICATION_REQUIREMENTS: readonly UnHumanRightsVerificationRequirement[] = [
  {
    id: "unhr-verify-source-attribution",
    label: "Source Attribution",
    description: "Every record must cite official UN or agency source in the source field.",
    required: true,
  },
  {
    id: "unhr-verify-source-agency",
    label: "Source Agency Identification",
    description: "Publishing UN body must be identified in sourceAgency.",
    required: true,
  },
  {
    id: "unhr-verify-methodology",
    label: "Methodology Reference",
    description: "methodologyReference must link to official published methodology.",
    required: true,
  },
  {
    id: "unhr-verify-no-hr-scoring",
    label: "No Human Rights Scoring",
    description: "Platform must not produce human rights scores or country rankings from UN data.",
    required: true,
  },
  {
    id: "unhr-verify-neutrality",
    label: "Political Neutrality",
    description: "Records must pass neutrality and sentiment risk validation before display.",
    required: true,
  },
  {
    id: "unhr-verify-reproducibility",
    label: "Reproducibility Metadata",
    description: "lastUpdated and metadata fields must be preserved for audit.",
    required: true,
  },
  {
    id: "unhr-verify-no-synthetic",
    label: "No Synthetic Values",
    description: "Missing observations remain null — no interpolation or AI-generated values.",
    required: true,
  },
] as const;

const REQUIRED_NORMALIZERS: readonly string[] = [
  "norm-country-iso3166",
  "norm-date-iso8601",
  "norm-unit-si",
  "norm-language-iso639",
] as const;

function resolveReadinessStatus(): UnHumanRightsReadinessStatus {
  const unmapped = getUnmappedUnHumanRightsIndicators();
  const hasReviewItems = unmapped.some(
    (item) => item.mappingStatus === "requires_review" || item.mappingStatus === "planned",
  );

  if (hasReviewItems) return "mapping_in_progress";
  return "validation_ready";
}

export function buildUnHumanRightsConnectorReadinessModel(): UnHumanRightsConnectorReadinessModel {
  const connector = findConnectorByIdString(UN_HUMAN_RIGHTS_CONNECTOR_ID);

  return {
    sourceId: UN_HUMAN_RIGHTS_SOURCE_ID,
    connectorId: UN_HUMAN_RIGHTS_CONNECTOR_ID,
    supportedIndicators: getSupportedUnHumanRightsCbaiIndicatorIds(),
    supportedCountries: countries.map((country) => country.code),
    expectedDataShape: UN_HUMAN_RIGHTS_RECORD_SCHEMA_DESCRIPTOR,
    requiredFields: UN_HUMAN_RIGHTS_RECORD_REQUIRED_FIELDS,
    optionalFields: UN_HUMAN_RIGHTS_RECORD_OPTIONAL_FIELDS,
    licenseNotes: connector?.license ?? "UN data terms — per dataset",
    updateFrequency:
      connector?.updateFrequency ?? "Varies by dataset — annual to real-time for some registries",
    verificationRequirements: VERIFICATION_REQUIREMENTS,
    neutralityRequirements: UN_HUMAN_RIGHTS_NEUTRALITY_RULES,
    limitations: UN_HUMAN_RIGHTS_LIMITATIONS,
    readinessStatus: resolveReadinessStatus(),
    version: UN_HUMAN_RIGHTS_READINESS_VERSION,
  };
}

export function getUnHumanRightsConnectorReadiness(): UnHumanRightsConnectorReadinessReport {
  const model = buildUnHumanRightsConnectorReadinessModel();
  const mappedIndicators = getMappedUnHumanRightsIndicators();
  const unmappedIndicators = getUnmappedUnHumanRightsIndicators();

  const nextSteps: string[] = [
    "Complete governance review for requires_review indicator families.",
    "Define CBAI framework extensions for gender equality, child protection, disability, and migration.",
    "Implement UN / agency adapter pipeline in Evidence Infrastructure.",
    "Apply neutrality and sentiment risk validation on all ingested records.",
    "Wire country codes to Global Registry entity IDs via norm-country-iso3166.",
    "Transition connector status from planned to ready after validation gates pass.",
    "Attach verified evidence to country entities — no scores or political conclusions.",
  ];

  if (unmappedIndicators.some((item) => item.mappingStatus === "planned")) {
    nextSteps.unshift(
      "Resolve planned mappings requiring new CBAI indicator definitions.",
    );
  }

  return {
    connectorId: UN_HUMAN_RIGHTS_CONNECTOR_ID,
    sourceId: UN_HUMAN_RIGHTS_SOURCE_ID,
    status: model.readinessStatus,
    mappedIndicators,
    unmappedIndicators,
    requiredNormalizers: REQUIRED_NORMALIZERS,
    verificationChecklist: VERIFICATION_REQUIREMENTS,
    neutralityChecklist: UN_HUMAN_RIGHTS_NEUTRALITY_RULES,
    limitations: UN_HUMAN_RIGHTS_LIMITATIONS,
    nextSteps,
    builtAt: new Date().toISOString(),
    version: UN_HUMAN_RIGHTS_READINESS_VERSION,
  };
}

export function summarizeUnHumanRightsReadiness(): {
  familyCount: number;
  mappedCount: number;
  unmappedCount: number;
  areaCount: number;
  sourceFamilyCount: number;
} {
  const mapped = getMappedUnHumanRightsIndicators();
  const unmapped = getUnmappedUnHumanRightsIndicators();
  const areas = new Set(UN_HUMAN_RIGHTS_INDICATOR_FAMILIES.map((family) => family.area));

  return {
    familyCount: UN_HUMAN_RIGHTS_INDICATOR_FAMILIES.length,
    mappedCount: mapped.length,
    unmappedCount: unmapped.length,
    areaCount: areas.size,
    sourceFamilyCount: 10,
  };
}
