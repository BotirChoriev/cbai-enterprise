/**
 * Canonical University Intelligence model — additive, honest empties.
 * Never fabricates logos, faculties, scientists, publications, or opportunities.
 */

export const UNIVERSITY_INTELLIGENCE_SCHEMA_VERSION = 1 as const;

export type VerificationState =
  | "verified"
  | "not_independently_verified"
  | "awaiting_verification"
  | "not_connected"
  | "not_available"
  | "disputed";

export type ProvenanceLayer =
  | "official_source"
  | "user_provided"
  | "cbai_analysis"
  | "cbai_inference"
  | "human_confirmed";

export type LogoUsageStatus =
  | "permitted"
  | "license_verified"
  | "not_connected"
  | "not_permitted"
  | "unknown";

export type UniversityLogoIdentity = {
  readonly officialLogoUrl: string | null;
  readonly emblemUrl: string | null;
  readonly logoSource: string | null;
  readonly logoLicense: string | null;
  readonly usageStatus: LogoUsageStatus;
  /** True only when a permitted official asset is available. */
  readonly isOfficialAsset: boolean;
};

export type UniversityIdentity = {
  readonly id: string;
  readonly officialName: string;
  readonly alternateNames: readonly string[];
  readonly abbreviation: string;
  readonly countryId: string | null;
  readonly countryName: string;
  readonly countryCode: string | null;
  readonly city: string;
  readonly address: string | null;
  readonly universityType: string;
  readonly officialWebsite: string | null;
  readonly verifiedDomains: readonly string[];
  readonly logo: UniversityLogoIdentity;
  readonly operatingLanguages: readonly string[];
  readonly establishedYear: number | null;
  readonly identifiers: readonly { readonly scheme: string; readonly value: string }[];
  readonly sourceReferences: readonly string[];
  readonly lastVerifiedAt: string | null;
  readonly dataCoverage: "identity_only" | "structured_empty" | "partial" | "connected";
  readonly contentLocale: string | null;
};

export type UniversityStructureSlot = {
  readonly faculties: readonly never[];
  readonly departments: readonly never[];
  readonly laboratories: readonly never[];
  readonly researchCenters: readonly never[];
  readonly institutes: readonly never[];
  readonly facilities: readonly never[];
  readonly equipment: readonly never[];
  readonly officialRelationships: readonly never[];
  readonly notice: string;
};

export type MetricWithProvenance = {
  readonly key: string;
  readonly value: number | null;
  readonly labelKey: string;
  readonly verificationState: VerificationState;
  readonly measurementPeriod: string | null;
  readonly methodologyNote: string | null;
  readonly lastVerifiedAt: string | null;
  readonly coverageLimitation: string | null;
  readonly sourceUrl: string | null;
};

export type UniversityIntelligenceSnapshot = {
  readonly researchThemes: readonly string[];
  readonly metrics: readonly MetricWithProvenance[];
  readonly dataCoverage: UniversityIdentity["dataCoverage"];
  readonly freshness: "unknown" | "current" | "dated" | "stale";
  readonly missingData: readonly string[];
  readonly honestyNotice: string;
};

export type TimelineClassification =
  | "observed_historical"
  | "current_verified"
  | "official_future_plan"
  | "cbai_scenario"
  | "cbai_inference";

export type UniversityResearchTimelineYear = {
  readonly year: number;
  readonly projectsStarted: number | null;
  readonly projectsCompleted: number | null;
  readonly publications: number | null;
  readonly datasets: number | null;
  readonly patents: number | null;
  readonly grants: number | null;
  readonly laboratoriesOpened: number | null;
  readonly collaborationsStarted: number | null;
  readonly verifiedEvents: readonly string[];
  readonly sourceCoverage: VerificationState;
  readonly classification: TimelineClassification;
};

export type CollaborationOpportunityRecord = {
  readonly id: string;
  readonly title: string;
  readonly opportunityType: string;
  readonly researchThemes: readonly string[];
  readonly requiredMethods: readonly string[];
  readonly requiredEquipment: readonly string[];
  readonly requiredExpertise: readonly string[];
  readonly languages: readonly string[];
  readonly location: string | null;
  readonly deadline: string | null;
  readonly fundingState: string | null;
  readonly eligibility: string | null;
  readonly officialSource: string | null;
  readonly sourcePublishedAt: string | null;
  readonly sourceCheckedAt: string | null;
  readonly status: "active" | "expired" | "unconfirmed" | "not_connected";
};

export type PresentationEventRecord = {
  readonly id: string;
  readonly title: string;
  readonly eventType: string;
  readonly institution: string | null;
  readonly speakers: readonly string[];
  readonly date: string | null;
  readonly timezone: string | null;
  readonly languages: readonly string[];
  readonly topics: readonly string[];
  readonly officialSource: string | null;
  readonly attendanceMethod: string | null;
  readonly evidenceState: VerificationState;
};

export type AcademicProfileStub = {
  readonly id: string;
  readonly verifiedName: string | null;
  readonly verificationState: VerificationState;
  readonly notice: string;
};

export type ResearchProjectStub = {
  readonly id: string;
  readonly title: string | null;
  readonly verificationState: VerificationState;
  readonly notice: string;
};

export type UniversityTabId =
  | "overview"
  | "research_areas"
  | "academics"
  | "faculties"
  | "laboratories"
  | "projects"
  | "publications"
  | "patents"
  | "presentations"
  | "opportunities"
  | "collaboration"
  | "evidence";

export type UniversityIntelligenceProfile = {
  readonly schemaVersion: typeof UNIVERSITY_INTELLIGENCE_SCHEMA_VERSION;
  readonly identity: UniversityIdentity;
  readonly structure: UniversityStructureSlot;
  readonly snapshot: UniversityIntelligenceSnapshot;
  readonly timeline: readonly UniversityResearchTimelineYear[];
  readonly academics: readonly AcademicProfileStub[];
  readonly projects: readonly ResearchProjectStub[];
  readonly opportunities: readonly CollaborationOpportunityRecord[];
  readonly presentations: readonly PresentationEventRecord[];
  readonly publications: readonly never[];
  readonly datasets: readonly never[];
  readonly patents: readonly never[];
  readonly linkedCountryId: string | null;
  readonly linkedCompanyIds: readonly string[];
  readonly limitations: readonly string[];
  readonly disputedDataNotice: string | null;
  /** Underlying registry record — unknown fields preserved via migrate. */
  readonly registry: Record<string, unknown>;
};
