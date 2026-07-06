/**
 * CBAI Evidence Pipeline Architecture — processing stage definitions.
 * Declarative stage graph only — no execution.
 */

import type { PipelineStageId } from "@/lib/evidence-pipeline/pipeline-types";

export type PipelineStageDefinition = {
  id: PipelineStageId;
  label: string;
  description: string;
  order: number;
  /** Validation rule IDs enforced at this stage. */
  validationRuleIds: readonly string[];
  /** Normalizer contract kinds applied at this stage (if any). */
  normalizerKinds: readonly NormalizationContractKind[];
};

/** Normalization contract kinds — architecture only, no implementation. */
export type NormalizationContractKind =
  | "country-code"
  | "language"
  | "currency"
  | "unit"
  | "date"
  | "identifier";

export type NormalizationContract = {
  kind: NormalizationContractKind;
  label: string;
  description: string;
  normalizerId: string;
  standardReference: string;
};

export const NORMALIZATION_CONTRACTS: readonly NormalizationContract[] = [
  {
    kind: "country-code",
    label: "Country Codes",
    description: "ISO 3166-1 alpha-2 country code normalization for entity binding.",
    normalizerId: "norm-country-iso3166",
    standardReference: "ISO 3166-1",
  },
  {
    kind: "language",
    label: "Languages",
    description: "ISO 639 language tag normalization for metadata evidence.",
    normalizerId: "norm-language-iso639",
    standardReference: "ISO 639-1",
  },
  {
    kind: "currency",
    label: "Currencies",
    description: "ISO 4217 currency code normalization for financial evidence.",
    normalizerId: "norm-currency-iso4217",
    standardReference: "ISO 4217",
  },
  {
    kind: "unit",
    label: "Units",
    description: "SI-aligned unit normalization for numeric evidence values.",
    normalizerId: "norm-unit-si",
    standardReference: "SI Brochure",
  },
  {
    kind: "date",
    label: "Dates",
    description: "ISO 8601 date normalization for evidence timestamps.",
    normalizerId: "norm-date-iso8601",
    standardReference: "ISO 8601",
  },
  {
    kind: "identifier",
    label: "Identifiers",
    description: "Stable identifier normalization for entity and source references.",
    normalizerId: "norm-registry-entity-id",
    standardReference: "CBAI Global Registry entity ID format",
  },
] as const;

/** Canonical ordered pipeline stages — every connector must traverse this graph. */
export const PIPELINE_STAGES: readonly PipelineStageDefinition[] = [
  {
    id: "connector",
    label: "Connector",
    description: "Official evidence connector produces raw adapter output.",
    order: 1,
    validationRuleIds: ["connector_registered"],
    normalizerKinds: [],
  },
  {
    id: "schema-validation",
    label: "Schema Validation",
    description: "Validate incoming record against connector-specific schema contract.",
    order: 2,
    validationRuleIds: ["schema_valid", "required_fields_present"],
    normalizerKinds: [],
  },
  {
    id: "normalization",
    label: "Normalization",
    description: "Apply normalization contracts to country, date, unit, and identifier fields.",
    order: 3,
    validationRuleIds: [],
    normalizerKinds: ["country-code", "language", "currency", "unit", "date", "identifier"],
  },
  {
    id: "evidence-record",
    label: "Evidence Record",
    description: "Materialize CBAI Evidence Model record with provenance metadata.",
    order: 4,
    validationRuleIds: ["evidence_source_registered"],
    normalizerKinds: [],
  },
  {
    id: "evidence-registry",
    label: "Evidence Registry",
    description: "Register evidence record in platform evidence registry index.",
    order: 5,
    validationRuleIds: [],
    normalizerKinds: [],
  },
  {
    id: "indicator-resolution",
    label: "Indicator Resolution",
    description: "Resolve evidence to Global Indicator Framework indicator IDs.",
    order: 6,
    validationRuleIds: ["indicator_mapped"],
    normalizerKinds: [],
  },
  {
    id: "entity-resolution",
    label: "Entity Resolution",
    description: "Bind evidence to Global Registry permanent entity IDs.",
    order: 7,
    validationRuleIds: ["country_exists"],
    normalizerKinds: ["identifier"],
  },
  {
    id: "mission-availability",
    label: "Mission Availability",
    description: "Evaluate mission catalog compatibility for resolved evidence.",
    order: 8,
    validationRuleIds: ["mission_compatibility"],
    normalizerKinds: [],
  },
  {
    id: "report-readiness",
    label: "Report Readiness",
    description: "Evaluate Reports Center readiness for resolved entity and indicators.",
    order: 9,
    validationRuleIds: [],
    normalizerKinds: [],
  },
  {
    id: "workspace-availability",
    label: "Workspace Availability",
    description: "Evaluate intelligence workspace availability for resolved context.",
    order: 10,
    validationRuleIds: ["workspace_compatibility"],
    normalizerKinds: [],
  },
] as const;

const STAGE_BY_ID = new Map<PipelineStageId, PipelineStageDefinition>(
  PIPELINE_STAGES.map((stage) => [stage.id, stage]),
);

export function getPipelineStageById(
  stageId: PipelineStageId,
): PipelineStageDefinition | undefined {
  return STAGE_BY_ID.get(stageId);
}

export function getOrderedPipelineStages(): readonly PipelineStageDefinition[] {
  return PIPELINE_STAGES;
}

export function getNormalizationContractByKind(
  kind: NormalizationContractKind,
): NormalizationContract | undefined {
  return NORMALIZATION_CONTRACTS.find((contract) => contract.kind === kind);
}

export function getRequiredNormalizerIds(): readonly string[] {
  return NORMALIZATION_CONTRACTS.map((contract) => contract.normalizerId);
}
