/**
 * CBAI World Bank Connector Readiness — readiness model and report.
 * No external data, HTTP, fetch, or runtime side effects.
 */

import { countries } from "@/lib/countries";
import { findConnectorByIdString } from "@/lib/connectors";
import {
  getMappedWorldBankIndicators,
  getSupportedCbaiIndicatorIds,
  getUnmappedWorldBankIndicators,
} from "@/lib/connectors/world-bank/world-bank.mapping";
import { WORLD_BANK_INDICATOR_FAMILIES } from "@/lib/connectors/world-bank/world-bank.indicators";
import {
  WORLD_BANK_RECORD_OPTIONAL_FIELDS,
  WORLD_BANK_RECORD_REQUIRED_FIELDS,
  WORLD_BANK_RECORD_SCHEMA_DESCRIPTOR,
} from "@/lib/connectors/world-bank/world-bank.schema";
import type {
  WorldBankConnectorReadinessModel,
  WorldBankConnectorReadinessReport,
  WorldBankReadinessStatus,
  WorldBankVerificationRequirement,
} from "@/lib/connectors/world-bank/world-bank.types";
import {
  WORLD_BANK_CONNECTOR_ID,
  WORLD_BANK_READINESS_VERSION,
  WORLD_BANK_SOURCE_ID,
} from "@/lib/connectors/world-bank/world-bank.types";

const WORLD_BANK_LIMITATIONS: readonly string[] = [
  "No live World Bank Open Data API connection in v1 readiness architecture.",
  "WDI access metrics do not substitute for infrastructure asset registry disclosure.",
  "FDI flow statistics differ from FDI registration disclosure requirements.",
  "Fiscal aggregates do not substitute for open budget document publication evidence.",
  "Country coverage limited to CBAI local country registry until Global Registry wiring is complete.",
  "Indicator values are never synthesized — only mapping readiness is defined.",
] as const;

const VERIFICATION_REQUIREMENTS: readonly WorldBankVerificationRequirement[] = [
  {
    id: "wb-verify-source-attribution",
    label: "Source Attribution",
    description:
      "Every ingested record must include official World Bank source attribution in the source field.",
    required: true,
  },
  {
    id: "wb-verify-license",
    label: "License Compliance",
    description:
      "Records must declare World Bank Open Data Terms of Use in the license field.",
    required: true,
  },
  {
    id: "wb-verify-country-binding",
    label: "Country Entity Binding",
    description:
      "Country codes must resolve to Global Registry country entity IDs before evidence attachment.",
    required: true,
  },
  {
    id: "wb-verify-indicator-mapping",
    label: "Indicator Mapping Review",
    description:
      "Records with requires_review or planned mapping status must not auto-populate user-facing indicators.",
    required: true,
  },
  {
    id: "wb-verify-reproducibility",
    label: "Reproducibility Metadata",
    description:
      "lastUpdated and metadata fields must be preserved for audit and reproducibility.",
    required: true,
  },
  {
    id: "wb-verify-no-synthetic-values",
    label: "No Synthetic Values",
    description:
      "Missing observations remain null — no interpolation, estimation, or AI-generated values.",
    required: true,
  },
] as const;

const REQUIRED_NORMALIZERS: readonly string[] = [
  "norm-country-iso3166",
  "norm-date-iso8601",
  "norm-unit-si",
  "norm-currency-iso4217",
] as const;

function resolveReadinessStatus(): WorldBankReadinessStatus {
  const unmapped = getUnmappedWorldBankIndicators();
  const hasReviewItems = unmapped.some(
    (item) => item.mappingStatus === "requires_review" || item.mappingStatus === "planned",
  );

  if (hasReviewItems) return "mapping_in_progress";
  return "validation_ready";
}

/** Build the static World Bank connector readiness model. */
export function buildWorldBankConnectorReadinessModel(): WorldBankConnectorReadinessModel {
  const connector = findConnectorByIdString(WORLD_BANK_CONNECTOR_ID);

  return {
    sourceId: WORLD_BANK_SOURCE_ID,
    connectorId: WORLD_BANK_CONNECTOR_ID,
    supportedIndicators: getSupportedCbaiIndicatorIds(),
    supportedCountries: countries.map((country) => country.code),
    expectedDataShape: WORLD_BANK_RECORD_SCHEMA_DESCRIPTOR,
    requiredFields: WORLD_BANK_RECORD_REQUIRED_FIELDS,
    optionalFields: WORLD_BANK_RECORD_OPTIONAL_FIELDS,
    licenseNotes:
      connector?.license ??
      "World Bank Open Data Terms of Use — per-dataset attribution required.",
    updateFrequency:
      connector?.updateFrequency ?? "Annual and quarterly for WDI; ad hoc for reports",
    verificationRequirements: VERIFICATION_REQUIREMENTS,
    limitations: WORLD_BANK_LIMITATIONS,
    readinessStatus: resolveReadinessStatus(),
    version: WORLD_BANK_READINESS_VERSION,
  };
}

/** Produce the World Bank connector readiness report — no external data. */
export function getWorldBankConnectorReadiness(): WorldBankConnectorReadinessReport {
  const model = buildWorldBankConnectorReadinessModel();
  const mappedIndicators = getMappedWorldBankIndicators();
  const unmappedIndicators = getUnmappedWorldBankIndicators();

  const nextSteps: string[] = [
    "Complete governance review for requires_review indicator families.",
    "Define adapter pipeline in Evidence Infrastructure for WDI JSON responses.",
    "Provision World Bank API credentials in secure vault (never in repository).",
    "Wire country codes to Global Registry entity IDs via norm-country-iso3166.",
    "Transition connector status from planned to ready after validation gates pass.",
    "Attach verified evidence records to country entities — no user-facing values until verified.",
  ];

  if (unmappedIndicators.some((item) => item.mappingStatus === "planned")) {
    nextSteps.unshift(
      "Resolve planned mappings (e.g. fiscal transparency proxies vs budget document publication).",
    );
  }

  return {
    connectorId: WORLD_BANK_CONNECTOR_ID,
    sourceId: WORLD_BANK_SOURCE_ID,
    status: model.readinessStatus,
    mappedIndicators,
    unmappedIndicators,
    requiredNormalizers: REQUIRED_NORMALIZERS,
    verificationChecklist: VERIFICATION_REQUIREMENTS,
    limitations: WORLD_BANK_LIMITATIONS,
    nextSteps,
    builtAt: new Date().toISOString(),
    version: WORLD_BANK_READINESS_VERSION,
  };
}

/** Summary counts for readiness dashboards — no external data. */
export function summarizeWorldBankReadiness(): {
  familyCount: number;
  mappedCount: number;
  unmappedCount: number;
  areaCount: number;
} {
  const mapped = getMappedWorldBankIndicators();
  const unmapped = getUnmappedWorldBankIndicators();
  const areas = new Set(WORLD_BANK_INDICATOR_FAMILIES.map((family) => family.area));

  return {
    familyCount: WORLD_BANK_INDICATOR_FAMILIES.length,
    mappedCount: mapped.length,
    unmappedCount: unmapped.length,
    areaCount: areas.size,
  };
}
