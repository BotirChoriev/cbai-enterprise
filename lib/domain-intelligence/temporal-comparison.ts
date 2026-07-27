/**
 * Temporal intelligence model — five-year / current / trend / plans / scenarios.
 * Never invents values or implies causation from correlation.
 */

import type {
  ChangeFactorClass,
  MaterialClass,
  ProvenancedClaim,
} from "@/lib/domain-intelligence/evidence-provenance";
import { unavailableClaim } from "@/lib/domain-intelligence/evidence-provenance";

export type TrendDirection = "up" | "down" | "stable" | "unknown" | "unavailable";

export type ChangeFactor = {
  readonly id: string;
  readonly label: string;
  readonly classification: ChangeFactorClass;
  readonly supportingSourceIds: readonly string[];
  readonly materialClass: MaterialClass;
};

export type OfficialPlanRecord = {
  readonly id: string;
  readonly title: string;
  readonly issuingAuthority: string;
  readonly publicationDate: string | null;
  readonly targetDate: string | null;
  readonly sourceUrl: string | null;
  readonly materialClass: "official_source";
  readonly status: "published" | "unavailable";
};

export type ScenarioRecord = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  /** Always labeled as scenario — never a prediction. */
  readonly materialClass: "cbai_scenario";
  readonly assumptions: readonly string[];
  readonly status: "draft" | "unavailable";
};

export type TemporalComparison = {
  readonly id: string;
  readonly subjectLabel: string;
  readonly geographicScope: string;
  /** Observation ~5 years before the current window when available. */
  readonly fiveYearsAgo: ProvenancedClaim;
  readonly current: ProvenancedClaim;
  readonly trendDirection: TrendDirection;
  /** Absolute delta only when both values are numeric and units match. */
  readonly absoluteChange: number | null;
  /** Percentage change only when mathematically valid (baseline ≠ 0, same unit). */
  readonly percentageChange: number | null;
  readonly changeFactors: readonly ChangeFactor[];
  readonly supportingSourceIds: readonly string[];
  readonly conflictingInterpretations: readonly string[];
  readonly officialPlans: readonly OfficialPlanRecord[];
  readonly scenarios: readonly ScenarioRecord[];
  readonly knowledgeGaps: readonly string[];
  readonly unit: string | null;
};

export type ComputeTemporalInput = {
  readonly id: string;
  readonly subjectLabel: string;
  readonly geographicScope: string;
  readonly fiveYearsAgo: ProvenancedClaim | null;
  readonly current: ProvenancedClaim | null;
  readonly changeFactors?: readonly ChangeFactor[];
  readonly supportingSourceIds?: readonly string[];
  readonly conflictingInterpretations?: readonly string[];
  readonly officialPlans?: readonly OfficialPlanRecord[];
  readonly scenarios?: readonly ScenarioRecord[];
  readonly knowledgeGaps?: readonly string[];
};

function numericValue(claim: ProvenancedClaim | null): number | null {
  if (!claim || claim.value === null || claim.value === undefined) return null;
  if (typeof claim.value === "number" && Number.isFinite(claim.value)) return claim.value;
  if (typeof claim.value === "string" && claim.value.trim() !== "") {
    const n = Number(claim.value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function computeTrendDirection(
  before: number | null,
  current: number | null,
): TrendDirection {
  if (before === null || current === null) return "unavailable";
  if (before === current) return "stable";
  return current > before ? "up" : "down";
}

export function computePercentageChange(before: number | null, current: number | null): number | null {
  if (before === null || current === null) return null;
  if (before === 0) return null;
  return ((current - before) / Math.abs(before)) * 100;
}

/**
 * Build a temporal comparison. When observations are missing, returns honest
 * unavailable claims — never fabricates numbers, causes, or plans.
 */
export function buildTemporalComparison(input: ComputeTemporalInput): TemporalComparison {
  const fiveYearsAgo =
    input.fiveYearsAgo ??
    unavailableClaim({
      id: `${input.id}:five-years-ago`,
      displayLabel: `${input.subjectLabel} (≈5 years ago)`,
      geographicCoverage: input.geographicScope,
      limitations: ["No verified observation is connected for the five-year comparison window."],
    });
  const current =
    input.current ??
    unavailableClaim({
      id: `${input.id}:current`,
      displayLabel: `${input.subjectLabel} (current / latest verified)`,
      geographicCoverage: input.geographicScope,
      limitations: ["No verified current observation is connected."],
    });

  const beforeN = numericValue(fiveYearsAgo);
  const currentN = numericValue(current);
  const unitsMatch =
    (fiveYearsAgo.unit ?? null) === (current.unit ?? null) ||
    (!fiveYearsAgo.unit && !current.unit);
  const absoluteChange =
    beforeN !== null && currentN !== null && unitsMatch ? currentN - beforeN : null;
  const percentageChange =
    beforeN !== null && currentN !== null && unitsMatch
      ? computePercentageChange(beforeN, currentN)
      : null;

  const defaultGaps = [
    "Verified time-series observations are not connected for this indicator.",
    "Documented causes of change are unknown until official sources or peer-reviewed evidence are linked.",
  ];

  return {
    id: input.id,
    subjectLabel: input.subjectLabel,
    geographicScope: input.geographicScope,
    fiveYearsAgo,
    current,
    trendDirection: computeTrendDirection(
      unitsMatch ? beforeN : null,
      unitsMatch ? currentN : null,
    ),
    absoluteChange,
    percentageChange,
    changeFactors: input.changeFactors ?? [],
    supportingSourceIds: input.supportingSourceIds ?? [],
    conflictingInterpretations: input.conflictingInterpretations ?? [],
    officialPlans: input.officialPlans ?? [],
    scenarios: input.scenarios ?? [],
    knowledgeGaps: input.knowledgeGaps ?? defaultGaps,
    unit: unitsMatch ? (current.unit ?? fiveYearsAgo.unit ?? null) : null,
  };
}

/** Guard: scenarios must never be presented as official plans. */
export function isOfficialPlan(record: OfficialPlanRecord | ScenarioRecord): record is OfficialPlanRecord {
  return record.materialClass === "official_source";
}

export function isScenario(record: OfficialPlanRecord | ScenarioRecord): record is ScenarioRecord {
  return record.materialClass === "cbai_scenario";
}
