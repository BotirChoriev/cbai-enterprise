/**
 * World Bank WDI mapping gate — additional codes require full review.
 * Name similarity alone is never sufficient.
 */

export type WdiMappingCandidate = {
  readonly code: string;
  readonly officialName: string;
  readonly unit: string;
  readonly expectedPeriodicity: "annual" | "quarterly" | "monthly";
  readonly jurisdictionRule: "iso2-country";
  readonly cbaiIndicatorSlug: string | null;
  readonly semanticReview: string;
  readonly unitValidation: string;
  readonly periodValidation: string;
  readonly jurisdictionValidation: string;
  readonly duplicateCheck: string;
  readonly provenanceRetention: string;
  readonly approvedForLive: boolean;
};

/** Baseline live set (already validated in prior Preview work). */
export const WDI_BASELINE_APPROVED: readonly WdiMappingCandidate[] = [
  {
    code: "NY.GDP.MKTP.CD",
    officialName: "GDP (current US$)",
    unit: "current US$",
    expectedPeriodicity: "annual",
    jurisdictionRule: "iso2-country",
    cbaiIndicatorSlug: "national-accounts",
    semanticReview: "National accounts GDP at current USD — matches CBAI national-accounts intent",
    unitValidation: "WDI metadata unit is current US$; no percent conversion",
    periodValidation: "WDI date field is calendar year YYYY",
    jurisdictionValidation: "Requires ISO2 country code; aggregates (WLD) rejected by country registry lookup",
    duplicateCheck: "Identity world-bank::entity::NY.GDP.MKTP.CD::period",
    provenanceRetention: "sourceUrl includes indicator path; retrievedAt/lastCheckedAt set at fetch",
    approvedForLive: true,
  },
  {
    code: "SP.POP.TOTL",
    officialName: "Population, total",
    unit: "people",
    expectedPeriodicity: "annual",
    jurisdictionRule: "iso2-country",
    cbaiIndicatorSlug: null,
    semanticReview: "Total population headcount — not labor force or household survey proxy",
    unitValidation: "Absolute count (people)",
    periodValidation: "Annual YYYY",
    jurisdictionValidation: "ISO2 country only",
    duplicateCheck: "Identity world-bank::entity::SP.POP.TOTL::period",
    provenanceRetention: "Full provenance on publish",
    approvedForLive: true,
  },
  {
    code: "FP.CPI.TOTL.ZG",
    officialName: "Inflation, consumer prices (annual %)",
    unit: "percent",
    expectedPeriodicity: "annual",
    jurisdictionRule: "iso2-country",
    cbaiIndicatorSlug: "national-accounts",
    semanticReview: "CPI inflation annual % — distinct from CPI index level",
    unitValidation: "Percent, not index points",
    periodValidation: "Annual YYYY",
    jurisdictionValidation: "ISO2 country only",
    duplicateCheck: "Identity world-bank::entity::FP.CPI.TOTL.ZG::period",
    provenanceRetention: "Full provenance on publish",
    approvedForLive: true,
  },
  {
    code: "SL.UEM.TOTL.ZS",
    officialName: "Unemployment, total (% of total labor force)",
    unit: "percent of labor force",
    expectedPeriodicity: "annual",
    jurisdictionRule: "iso2-country",
    cbaiIndicatorSlug: "labour-market-statistics",
    semanticReview: "ILO-modeled unemployment rate — not employment count",
    unitValidation: "Percent of labor force",
    periodValidation: "Annual YYYY",
    jurisdictionValidation: "ISO2 country only",
    duplicateCheck: "Identity world-bank::entity::SL.UEM.TOTL.ZS::period",
    provenanceRetention: "Full provenance on publish",
    approvedForLive: true,
  },
];

/**
 * Phase 4 additional mapping — approved only after the six-gate review below.
 * NE.EXP.GNFS.CD is exports of goods and services (current US$), not merchandise-only.
 */
export const WDI_PHASE4_CANDIDATES: readonly WdiMappingCandidate[] = [
  {
    code: "NE.EXP.GNFS.CD",
    officialName: "Exports of goods and services (current US$)",
    unit: "current US$",
    expectedPeriodicity: "annual",
    jurisdictionRule: "iso2-country",
    cbaiIndicatorSlug: "national-accounts",
    semanticReview:
      "National accounts exports of goods AND services in current USD — not trade balance, not merchandise-only TX.VAL.MRCH.CD.WT",
    unitValidation: "current US$ absolute; reject if API returns null or non-finite",
    periodValidation: "Require YYYY reference period from WDI date field",
    jurisdictionValidation: "Must resolve to CBAI country registry via ISO2",
    duplicateCheck: "dedupeKey + sourceHash; prior versions retained",
    provenanceRetention: "sourceUrl, retrievedAt, lastCheckedAt, unit, transformationNotes required",
    approvedForLive: true,
  },
];

export function listApprovedLiveWdiCodes(): readonly WdiMappingCandidate[] {
  return [...WDI_BASELINE_APPROVED, ...WDI_PHASE4_CANDIDATES].filter((c) => c.approvedForLive);
}

export function assertWdiMappingGates(candidate: WdiMappingCandidate): string[] {
  const failures: string[] = [];
  if (!candidate.semanticReview.trim()) failures.push("semantic mapping review missing");
  if (!candidate.unitValidation.trim()) failures.push("unit validation missing");
  if (!candidate.periodValidation.trim()) failures.push("period validation missing");
  if (!candidate.jurisdictionValidation.trim()) failures.push("jurisdiction validation missing");
  if (!candidate.duplicateCheck.trim()) failures.push("duplicate check missing");
  if (!candidate.provenanceRetention.trim()) failures.push("provenance retention missing");
  if (!candidate.approvedForLive) failures.push("not approved for live");
  return failures;
}
