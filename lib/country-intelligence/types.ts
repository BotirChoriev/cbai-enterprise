/**
 * Canonical Country Intelligence model (additive, backward-compatible).
 * Never fabricates scores, forecasts, or causal claims.
 */

import type { Country, CountryRegion } from "@/lib/countries";

export const COUNTRY_INTELLIGENCE_SCHEMA_VERSION = 1 as const;

/** The twelve required intelligence domains (Phase 2). */
export const COUNTRY_INTELLIGENCE_DOMAINS = [
  "rule_of_law",
  "justice",
  "democratic_processes",
  "human_rights",
  "economy",
  "social_conditions",
  "education_research",
  "health",
  "infrastructure",
  "digital_access",
  "environment",
  "public_administration",
] as const;

export type CountryIntelligenceDomainId = (typeof COUNTRY_INTELLIGENCE_DOMAINS)[number];

export type EvidenceStatus =
  | "verified"
  | "not_independently_verified"
  | "disputed"
  | "insufficient"
  | "not_available";

export type ComparabilityStatus =
  | "comparable"
  | "not_comparable"
  | "methodology_break"
  | "unknown";

export type FreshnessStatus = "current" | "dated" | "stale" | "unknown";

export type ProvenanceClassification =
  | "official_source"
  | "user_provided"
  | "cbai_summary"
  | "cbai_inference"
  | "cbai_scenario"
  | "official_commitment"
  | "uncertainty";

export type SourceCapabilityStatus =
  | "connected"
  | "available_not_connected"
  | "user_provided"
  | "public_web"
  | "restricted"
  | "authentication_required"
  | "not_available";

export type FlagMetadata = {
  readonly isoAlpha2: string;
  /** Unicode regional-indicator emoji derived from ISO alpha-2. */
  readonly emoji: string;
  readonly altTextKey: "flagAlt";
};

export type EmblemMetadata = {
  readonly available: boolean;
  readonly assetPath: string | null;
  readonly source: string | null;
  readonly license: string | null;
  readonly reasonIfUnavailable: "not_licensed" | "not_verified" | "not_found";
};

export type IndicatorObservation = {
  readonly id: string;
  readonly domainId: CountryIntelligenceDomainId;
  readonly indicatorId: string;
  readonly localizedLabelKey: string;
  readonly officialSourceLabel: string | null;
  /** Null when no verified observation exists — never zero as a stand-in. */
  readonly value: number | string | null;
  readonly unit: string | null;
  readonly observationDate: string | null;
  readonly geographicCoverage: string | null;
  readonly sourceOrganization: string | null;
  readonly sourceUrl: string | null;
  readonly datasetName: string | null;
  readonly releaseDate: string | null;
  readonly methodologyUrl: string | null;
  readonly methodologyNote: string | null;
  readonly evidenceStatus: EvidenceStatus;
  readonly comparabilityStatus: ComparabilityStatus;
  readonly freshnessStatus: FreshnessStatus;
  readonly missingDataReason: string | null;
  readonly revisionNote: string | null;
  readonly provenance: ProvenanceClassification;
  readonly officialTarget: { readonly value: string; readonly year: string | null; readonly sourceUrl: string | null } | null;
  readonly scenarioValue: { readonly label: string; readonly note: string } | null;
};

export type HistoricalObservation = {
  readonly year: number;
  readonly value: number | string | null;
  readonly evidenceStatus: EvidenceStatus;
  readonly comparabilityStatus: ComparabilityStatus;
  readonly sourceOrganization: string | null;
  readonly methodologyBreak: boolean;
  readonly gap: boolean;
  readonly revisionNote: string | null;
};

export type IndicatorSeries = {
  readonly indicatorId: string;
  readonly domainId: CountryIntelligenceDomainId;
  readonly unit: string | null;
  readonly observations: readonly HistoricalObservation[];
  readonly latest: IndicatorObservation;
};

export type CauseClassification =
  | "directly_supported"
  | "plausible_association"
  | "disputed"
  | "insufficient_evidence";

export type CauseExplanation = {
  readonly id: string;
  readonly statement: string;
  readonly classification: CauseClassification;
  readonly supportingSourceIds: readonly string[];
  readonly alternativeExplanations: readonly string[];
  readonly limitations: readonly string[];
};

export type ThenNowNextPanel = {
  readonly then: {
    readonly baselineYear: string | null;
    readonly summary: string;
    readonly sourceLabel: string | null;
    readonly contextualEvents: readonly string[];
  };
  readonly now: {
    readonly summary: string;
    readonly evidenceState: EvidenceStatus;
    readonly constraints: readonly string[];
    readonly uncertainties: readonly string[];
  };
  readonly next: {
    readonly officialCommitments: readonly string[];
    readonly publishedPlans: readonly string[];
    readonly targets: readonly string[];
    readonly cbaiScenarios: readonly string[];
    readonly risks: readonly string[];
    readonly monitoringSignals: readonly string[];
    readonly notice: string;
  };
};

export type CountryProfile = {
  readonly schemaVersion: typeof COUNTRY_INTELLIGENCE_SCHEMA_VERSION;
  readonly id: string;
  readonly isoAlpha2: string;
  readonly isoAlpha3: string;
  readonly officialName: string;
  readonly displayNameKey: string;
  readonly sourceLanguageName: string | null;
  readonly flag: FlagMetadata;
  readonly emblem: EmblemMetadata;
  readonly capital: string;
  readonly region: CountryRegion;
  readonly subregion: string | null;
  readonly officialLanguages: readonly string[];
  readonly population: { readonly value: number | null; readonly source: string | null; readonly year: string | null };
  readonly currency: string | null;
  readonly governmentForm: { readonly label: string; readonly provenance: "official_source" | "registry" };
  readonly officialWebsite: string | null;
  readonly profileCompleteness: "identity_only" | "partial" | "structured_empty" | "connected";
  readonly lastVerifiedDate: string | null;
  readonly sourceCoverageSummary: {
    readonly connected: number;
    readonly availableNotConnected: number;
    readonly notAvailable: number;
  };
  readonly dataFreshness: FreshnessStatus;
  readonly limitations: readonly string[];
  readonly disputedDataNotice: string | null;
  readonly linkedUniversityIds: readonly string[];
  readonly linkedResearcherIds: readonly string[];
  readonly linkedCompanyIds: readonly string[];
  readonly linkedInstitutionIds: readonly string[];
  readonly linkedResearchIds: readonly string[];
  readonly linkedEvidenceIds: readonly string[];
  readonly linkedOperationalObjectIds: readonly string[];
  /** Registry country — always present for known ids. */
  readonly registry: Country;
  readonly domainSlots: readonly {
    readonly domainId: CountryIntelligenceDomainId;
    readonly latest: IndicatorObservation | null;
    readonly series: IndicatorSeries | null;
    readonly sourceCount: number;
    readonly hasComparableHistory: boolean;
  }[];
  readonly thenNowNext: ThenNowNextPanel;
  readonly causes: readonly CauseExplanation[];
};

export type SourceRegistryEntry = {
  readonly id: string;
  readonly name: string;
  readonly organization: string;
  readonly status: SourceCapabilityStatus;
  readonly website: string | null;
  readonly methodologyUrl: string | null;
  readonly domains: readonly CountryIntelligenceDomainId[];
  readonly licenseNote: string;
};
