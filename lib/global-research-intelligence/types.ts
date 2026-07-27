/**
 * Global Research Intelligence — canonical kinds (additive).
 * Never fabricates scientific records.
 */

export const GRI_SCHEMA_VERSION = 1 as const;

export const RESEARCH_LIFECYCLE_STATES = [
  "idea",
  "research_question",
  "protocol",
  "ethics_review",
  "planned",
  "active",
  "data_collection",
  "analysis",
  "peer_review",
  "published",
  "replication",
  "applied_outcome",
  "completed",
  "paused",
  "stopped",
  "cancelled",
  "inconclusive",
  "not_replicated",
] as const;

export type ResearchLifecycleState = (typeof RESEARCH_LIFECYCLE_STATES)[number];

export type StoppedReasonClass =
  | "insufficient_funding"
  | "insufficient_data"
  | "methodological_limitation"
  | "ethics_or_safety_restriction"
  | "equipment_limitation"
  | "recruitment_failure"
  | "unresolved_contradiction"
  | "no_independent_replication"
  | "withdrawn_or_superseded"
  | "not_stated_in_source";

export type ProvenanceLayer =
  | "official_source"
  | "user_provided"
  | "cbai_synthesis"
  | "assumption"
  | "unknown"
  | "human_confirmed";

export type EvidenceStatus =
  | "verified"
  | "catalog_available"
  | "not_connected"
  | "not_available"
  | "awaiting_verification"
  | "disputed"
  | "stale"
  | "withdrawn"
  | "superseded";

export type GriCanonicalKind =
  | "ResearchOrganization"
  | "ResearchCenter"
  | "Faculty"
  | "Department"
  | "Laboratory"
  | "Researcher"
  | "AcademicIdentity"
  | "ResearchProject"
  | "ResearchQuestion"
  | "Hypothesis"
  | "ResearchProtocol"
  | "Experiment"
  | "Methodology"
  | "MeasurementDefinition"
  | "Dataset"
  | "Publication"
  | "Thesis"
  | "Book"
  | "TeachingMaterial"
  | "Seminar"
  | "Conference"
  | "Patent"
  | "GrantOpportunity"
  | "CollaborationOpportunity"
  | "ResearchPresentation"
  | "ResearchOutcome"
  | "ReplicationRecord"
  | "EvidenceRecord"
  | "SourceRecord"
  | "ResearchMeeting"
  | "ResearchDecision"
  | "ResearchOperationalObject"
  | "ResearchTopicCatalog";

export type GriBaseRecord = {
  readonly id: string;
  readonly kind: GriCanonicalKind;
  readonly officialName: string;
  readonly sourceUrl: string | null;
  readonly officialSourceName: string | null;
  readonly sourceLanguage: string | null;
  readonly contentLocale: string | null;
  readonly publicationOrUpdateDate: string | null;
  readonly lastVerifiedDate: string | null;
  readonly geographicCoverage: string | null;
  readonly methodology: string | null;
  readonly provenance: ProvenanceLayer;
  readonly evidenceStatus: EvidenceStatus;
  readonly uncertainty: string | null;
  readonly relatedIds: readonly string[];
  readonly createdAt: string | null;
  readonly updatedAt: string | null;
};

export type ResearchIntelligenceProfile = {
  readonly schemaVersion: typeof GRI_SCHEMA_VERSION;
  readonly id: string;
  readonly kind: GriCanonicalKind;
  readonly officialIdentity: {
    readonly officialName: string;
    readonly alternateNames: readonly string[];
    readonly catalogTopicId: string | null;
    readonly domainId: string | null;
    readonly domainName: string | null;
  };
  readonly researchQuestion: string | null;
  readonly hypothesis: string | null;
  readonly authorsAndInstitutions: readonly string[];
  readonly locationAndPeriod: { readonly location: string | null; readonly period: string | null };
  readonly methodology: string | null;
  readonly sampleParticipants: string | null;
  readonly measurementsAndUnits: readonly string[];
  readonly equipment: readonly string[];
  readonly datasets: readonly string[];
  readonly mainResults: string | null;
  readonly statisticalUncertainty: string | null;
  readonly limitations: readonly string[];
  readonly contradictoryEvidence: readonly string[];
  readonly replicationStatus: EvidenceStatus;
  readonly practicalOutcomes: readonly string[];
  readonly funding: string | null;
  readonly conflictOfInterest: string | null;
  readonly officialSources: readonly string[];
  readonly lastVerificationDate: string | null;
  readonly missingInformation: readonly string[];
  readonly openQuestions: readonly string[];
  readonly relatedOperationalObjectIds: readonly string[];
  readonly humanDecisionCheckpoints: readonly string[];
  readonly lifecycleState: ResearchLifecycleState;
  readonly stoppedReason: StoppedReasonClass | null;
  readonly layers: {
    readonly officialSource: readonly string[];
    readonly userEntered: readonly string[];
    readonly cbaiSynthesis: readonly string[];
    readonly assumptions: readonly string[];
    readonly unknown: readonly string[];
    readonly recommendations: readonly string[];
  };
  readonly catalog: Record<string, unknown>;
};

export type GriOpportunity = {
  readonly id: string;
  readonly title: string;
  readonly kind: "grant" | "call" | "conference" | "seminar" | "position" | "lab_access" | "dataset" | "collaboration" | "other";
  readonly officialIssuer: string | null;
  readonly sourceUrl: string | null;
  readonly openingDate: string | null;
  readonly deadline: string | null;
  readonly eligibility: string | null;
  readonly topic: string | null;
  readonly geography: string | null;
  readonly language: string | null;
  readonly fundingOrSupport: string | null;
  readonly verificationDate: string | null;
  readonly status: "active" | "expired" | "unknown" | "not_connected";
};

export type GriLibraryRecord = {
  readonly id: string;
  readonly kind: "publication" | "book" | "thesis" | "preprint" | "protocol" | "dataset" | "patent" | "indicator";
  readonly officialTitle: string;
  readonly authors: readonly string[];
  readonly publisherOrRegistry: string | null;
  readonly date: string | null;
  readonly version: string | null;
  readonly license: string | null;
  readonly sourceLanguage: string | null;
  readonly methodologyCoverage: string | null;
  readonly lastVerifiedDate: string | null;
  readonly status: EvidenceStatus;
};
