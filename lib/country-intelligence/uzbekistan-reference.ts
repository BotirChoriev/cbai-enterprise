/**
 * Uzbekistan reference profile — full information architecture with honest empties.
 * Does not invent statistics to fill the layout.
 */

import { countries } from "@/lib/countries";
import { DOMAIN_DEFINITIONS } from "@/lib/country-intelligence/domains";
import { buildCountryProfile } from "@/lib/country-intelligence/profile";
import type { CountryIntelligenceDomainId, CountryProfile } from "@/lib/country-intelligence/types";

/** Domains Uzbekistan acceptance requires to have usable views (even if empty). */
export const UZBEKISTAN_REFERENCE_DOMAINS: readonly CountryIntelligenceDomainId[] = [
  "rule_of_law",
  "justice",
  "democratic_processes",
  "economy",
  "social_conditions",
  "education_research",
  "health",
  "infrastructure",
  "digital_access",
  "environment",
  "public_administration",
  "human_rights",
];

export type UzbekistanReferenceBundle = {
  readonly profile: CountryProfile;
  readonly domainViews: readonly {
    readonly domainId: CountryIntelligenceDomainId;
    readonly hasVerifiedSeries: boolean;
    readonly fiveYearAvailable: boolean;
    readonly previousState: null;
    readonly presentState: null;
    readonly difference: null;
    readonly officialPlan: null;
    readonly scenario: null;
    readonly missingDataNotice: string;
  }[];
  readonly honestyNotice: string;
};

export function buildUzbekistanReferenceProfile(): UzbekistanReferenceBundle | null {
  const country = countries.find((c) => c.id === "uzbekistan");
  if (!country) return null;
  const profile = buildCountryProfile(country);

  const domainViews = UZBEKISTAN_REFERENCE_DOMAINS.map((domainId) => {
    const def = DOMAIN_DEFINITIONS.find((d) => d.id === domainId);
    return {
      domainId,
      hasVerifiedSeries: false,
      fiveYearAvailable: false,
      previousState: null,
      presentState: null,
      difference: null,
      officialPlan: null,
      scenario: null,
      missingDataNotice: def
        ? `No verified data available for ${domainId} in Uzbekistan. UI structure is complete; values stay empty until a licensed source is connected.`
        : "No verified data available",
    };
  });

  return {
    profile,
    domainViews,
    honestyNotice:
      "Uzbekistan is the acceptance reference for information architecture. CBAI does not invent demo statistics. Missing observations show “No verified data available”.",
  };
}
