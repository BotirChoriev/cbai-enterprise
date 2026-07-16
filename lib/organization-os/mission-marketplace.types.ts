/**
 * EPIC-05 — Mission Marketplace foundation (architecture only).
 * Organizations publish missions — not jobs.
 */

export type ResearchMaturity =
  | "exploratory"
  | "hypothesis"
  | "evidence_gathering"
  | "validation"
  | "impact_review"
  | "publication_ready";

export type PublishedMissionListing = {
  readonly id: string;
  readonly organizationId: string;
  readonly missionTitle: string;
  readonly requiredKnowledge: readonly string[];
  readonly missingCapability: readonly string[];
  readonly neededDisciplines: readonly string[];
  readonly expectedImpact: string;
  readonly researchMaturity: ResearchMaturity;
  readonly publishedAt: string;
  readonly limitation: string;
};

export type MissionMarketplaceSnapshot = {
  readonly listings: readonly PublishedMissionListing[];
  readonly externalMarketplaceConnected: false;
  readonly limitation: string;
};

export function emptyMissionMarketplace(): MissionMarketplaceSnapshot {
  return {
    listings: [],
    externalMarketplaceConnected: false,
    limitation:
      "Mission marketplace is architecture-only. No external listings, applicants, or availability claims are shown.",
  };
}
