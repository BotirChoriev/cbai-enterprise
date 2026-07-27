/**
 * Country comparison eligibility — never ranks “best country”.
 * Blocks incompatible methodologies/units.
 */

import type { CountryIntelligenceDomainId, CountryProfile } from "@/lib/country-intelligence/types";

export type ComparisonEligibility =
  | { readonly ok: true; readonly reason: null }
  | { readonly ok: false; readonly reason: string; readonly alternatives: readonly string[] };

export type CountryComparisonRequest = {
  readonly countryIds: readonly string[];
  readonly domainId: CountryIntelligenceDomainId;
  readonly indicatorId?: string | null;
  readonly windowYears: 5 | 10 | 20;
};

export type CountryComparisonResult = {
  readonly request: CountryComparisonRequest;
  readonly profiles: readonly CountryProfile[];
  readonly eligibility: ComparisonEligibility;
  readonly coverageMatrix: readonly {
    readonly countryId: string;
    readonly domainId: CountryIntelligenceDomainId;
    readonly hasValue: boolean;
    readonly evidenceStatus: string;
    readonly unit: string | null;
    readonly methodologyNote: string | null;
  }[];
  readonly latestValues: readonly {
    readonly countryId: string;
    readonly value: number | string | null;
    readonly observationDate: string | null;
    readonly sourceOrganization: string | null;
  }[];
  readonly rankingForbiddenNotice: string;
};

const RANKING_NOTICE =
  "CBAI never produces a simplistic “best country” ranking. Compare compatible indicators only; the human decides.";

export function validateComparisonSelection(countryIds: readonly string[]): ComparisonEligibility {
  const unique = [...new Set(countryIds.filter(Boolean))];
  if (unique.length < 2) {
    return {
      ok: false,
      reason: "Select at least two countries to compare.",
      alternatives: ["Add another country from the directory."],
    };
  }
  if (unique.length > 4) {
    return {
      ok: false,
      reason: "Compare at most four countries at once.",
      alternatives: ["Remove countries until 2–4 remain."],
    };
  }
  return { ok: true, reason: null };
}

/**
 * Check whether every selected country has a comparable observation for the domain.
 * With no connected values, comparison of numeric values is blocked — coverage matrix still shown.
 */
export function assessDomainComparability(
  profiles: readonly CountryProfile[],
  domainId: CountryIntelligenceDomainId,
): ComparisonEligibility {
  const slots = profiles.map((p) => p.domainSlots.find((s) => s.domainId === domainId) ?? null);
  const units = new Set(
    slots.map((s) => s?.latest?.unit ?? null).filter((u): u is string => Boolean(u)),
  );
  if (units.size > 1) {
    return {
      ok: false,
      reason: "Selected countries use incompatible units for this domain.",
      alternatives: [
        "Choose a domain with matching units.",
        "Open each profile’s source methodology separately.",
      ],
    };
  }

  const methodologies = new Set(
    slots
      .map((s) => s?.latest?.methodologyNote ?? s?.latest?.methodologyUrl ?? null)
      .filter((m): m is string => Boolean(m)),
  );
  if (methodologies.size > 1) {
    return {
      ok: false,
      reason: "Methodologies differ across selected countries for this indicator.",
      alternatives: [
        "Do not treat these values as equivalent.",
        "Request compatible series via an Evidence Request.",
      ],
    };
  }

  const anyValue = slots.some((s) => s?.latest?.value !== null && s?.latest?.value !== undefined);
  if (!anyValue) {
    return {
      ok: false,
      reason:
        "No verified observations are connected for this domain across the selected countries. Numeric comparison is blocked.",
      alternatives: [
        "Review the data coverage matrix below.",
        "Create an Evidence Request for compatible series.",
        "Create a Comparative Study draft to structure the human review.",
      ],
    };
  }

  const missing = slots.filter((s) => !s?.latest || s.latest.value === null);
  if (missing.length > 0) {
    return {
      ok: false,
      reason: "At least one selected country has no verified value for this domain.",
      alternatives: [
        "Remove countries without data.",
        "Create an Evidence Request for missing series.",
      ],
    };
  }

  const incomparable = slots.some(
    (s) =>
      s?.latest?.comparabilityStatus === "not_comparable" ||
      s?.latest?.comparabilityStatus === "methodology_break",
  );
  if (incomparable) {
    return {
      ok: false,
      reason: "One or more series are marked not comparable (methodology break).",
      alternatives: ["Select a different indicator group.", "Inspect methodology notes per country."],
    };
  }

  return { ok: true, reason: null };
}

export function buildCountryComparison(
  profiles: readonly CountryProfile[],
  request: CountryComparisonRequest,
): CountryComparisonResult {
  const selection = validateComparisonSelection(request.countryIds);
  const domainCheck = selection.ok
    ? assessDomainComparability(profiles, request.domainId)
    : selection;

  const coverageMatrix = profiles.map((p) => {
    const slot = p.domainSlots.find((s) => s.domainId === request.domainId);
    return {
      countryId: p.id,
      domainId: request.domainId,
      hasValue: slot?.latest?.value != null,
      evidenceStatus: slot?.latest?.evidenceStatus ?? "not_available",
      unit: slot?.latest?.unit ?? null,
      methodologyNote: slot?.latest?.methodologyNote ?? null,
    };
  });

  const latestValues = profiles.map((p) => {
    const slot = p.domainSlots.find((s) => s.domainId === request.domainId);
    return {
      countryId: p.id,
      value: slot?.latest?.value ?? null,
      observationDate: slot?.latest?.observationDate ?? null,
      sourceOrganization: slot?.latest?.sourceOrganization ?? null,
    };
  });

  return {
    request,
    profiles,
    eligibility: domainCheck,
    coverageMatrix,
    latestValues,
    rankingForbiddenNotice: RANKING_NOTICE,
  };
}
