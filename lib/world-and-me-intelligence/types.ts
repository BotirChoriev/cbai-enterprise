/**
 * World and Me Intelligence Map — canonical domain (additive, versioned).
 * Never fabricate live activity. Never invent relationships without evidence.
 */

export const WIM_SCHEMA_VERSION = 1 as const;

export const WIM_ENTITY_KINDS = [
  "user",
  "role",
  "domain",
  "goal",
  "project",
  "operational_object",
  "country",
  "region",
  "company",
  "university",
  "faculty",
  "department",
  "scientist",
  "researcher",
  "laboratory",
  "research_center",
  "research_project",
  "publication",
  "dataset",
  "patent",
  "methodology",
  "scientific_claim",
  "evidence_record",
  "counter_evidence",
  "replication",
  "scientific_debate",
  "grant",
  "conference",
  "collaboration_opportunity",
  "law",
  "standard",
  "risk",
  "monitoring_indicator",
  "report",
  "human_decision_point",
] as const;
export type WimEntityKind = (typeof WIM_ENTITY_KINDS)[number];

export const WIM_RELATIONSHIP_TYPES = [
  "works_at",
  "member_of",
  "authored",
  "published_by",
  "researches",
  "uses_method",
  "supports_claim",
  "challenges_claim",
  "replicated",
  "failed_to_replicate",
  "funds",
  "regulates",
  "partners_with",
  "seeks_collaboration",
  "located_in",
  "relevant_to",
  "monitors",
  "depends_on",
  "linked_to_project",
  "linked_to_user",
  "watched_by",
  "derived_from",
  "supersedes",
  "contradicts",
  "requires_human_approval",
] as const;
export type WimRelationshipType = (typeof WIM_RELATIONSHIP_TYPES)[number];

export const LIVE_FRESHNESS_STATES = [
  "verified_current",
  "partially_covered",
  "awaiting_verification",
  "stale",
  "conflicting",
  "unknown",
  "source_unavailable",
  "no_verified_live_source",
] as const;
export type LiveFreshnessState = (typeof LIVE_FRESHNESS_STATES)[number];

export const WIM_VIEW_MODES = ["map", "relationships", "timeline", "compare", "my_world"] as const;
export type WimViewMode = (typeof WIM_VIEW_MODES)[number];

export type ClassificationLayer = "official_source" | "cbai_inference" | "user_entered" | "unknown";

export type WimEntityNode = {
  readonly id: string;
  readonly kind: WimEntityKind;
  readonly officialName: string;
  readonly fullLabel: string;
  readonly shortCode: string | null;
  readonly abbreviationForbiddenAlone: true;
  readonly contentLocale: string;
  readonly sourceLanguage: string | null;
  readonly geographicCoverage: string | null;
  readonly evidenceStatus: "connected" | "partial" | "unknown" | "not_connected";
  readonly classification: ClassificationLayer;
  readonly lastVerifiedDate: string | null;
  readonly href: string | null;
  readonly unknownFields?: Readonly<Record<string, unknown>>;
};

export type WimRelationship = {
  readonly id: string;
  readonly type: WimRelationshipType;
  readonly labelKey: string;
  readonly sourceNodeId: string;
  readonly targetNodeId: string;
  readonly evidenceStatus: "evidence_available" | "evidence_missing" | "unknown";
  readonly provenanceRefs: readonly string[];
  readonly validFrom: string | null;
  readonly validTo: string | null;
  readonly observedAt: string | null;
  readonly lastVerifiedDate: string | null;
  readonly confidenceOrCoverage: "verified" | "partial" | "unknown";
  readonly classification: ClassificationLayer;
  readonly relevanceExplanation: string | null;
  readonly unknownFields?: Readonly<Record<string, unknown>>;
};

export type LiveIntelligenceRecord = {
  readonly id: string;
  readonly category:
    | "new_research_result"
    | "conflicting_evidence"
    | "replication_result"
    | "new_laboratory"
    | "verified_grant"
    | "collaboration_call"
    | "conference"
    | "law_or_standard_change"
    | "financial_market_change"
    | "environmental_risk"
    | "social_infrastructure_change"
    | "official_institutional_plan";
  readonly title: string;
  readonly sourceName: string | null;
  readonly sourceUrl: string | null;
  readonly publisher: string | null;
  readonly publicationDate: string | null;
  readonly observedDate: string | null;
  readonly lastVerificationDate: string | null;
  readonly expectedRefreshFrequency: string | null;
  readonly geographicCoverage: string | null;
  readonly temporalCoverage: string | null;
  readonly methodology: string | null;
  readonly evidenceStatus: string;
  readonly officialMaterial: string | null;
  readonly cbaiSummary: string | null;
  readonly freshness: LiveFreshnessState;
  readonly uncertainty: string | null;
  readonly limitations: string | null;
  readonly conflictingEvidence: readonly string[];
  readonly userGoalRelevance: string | null;
  readonly contentLocale: string;
  readonly sourceLanguage: string | null;
};

export type MyWorldConsentProfile = {
  readonly role: string | null;
  readonly field: string | null;
  readonly goals: readonly string[];
  readonly watchedEntityIds: readonly string[];
  readonly consentGiven: boolean;
  readonly contentLocale: string;
};

export type WimProjection = {
  readonly schemaVersion: typeof WIM_SCHEMA_VERSION;
  readonly nodes: readonly WimEntityNode[];
  readonly relationships: readonly WimRelationship[];
  readonly liveRecords: readonly LiveIntelligenceRecord[];
  readonly liveSourceStatus: LiveFreshnessState;
  readonly honestyNotice: string;
  readonly listFallback: readonly { readonly label: string; readonly detail: string }[];
};
