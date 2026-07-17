/** BUILD-028.5 — Saved source ingestion lifecycle contracts. */

import type {
  KnowledgeProviderId,
  KnowledgeTrustState,
  ProvenanceRecord,
} from "@/lib/knowledge-connectors/types";

export const SAVED_SOURCE_SCHEMA_VERSION = 1;

export type SourceIngestionState =
  | "search_result"
  | "inspected"
  | "saved_source"
  | "linked_to_mission"
  | "awaiting_review"
  | "reviewed_evidence"
  | "rejected"
  | "superseded"
  | "archived";

export type AbstractAvailability =
  | "provider_supplied"
  | "not_supplied"
  | "restricted"
  | "unknown";

export type HumanReviewState =
  | "not_requested"
  | "awaiting_review"
  | "in_review"
  | "accepted"
  | "rejected"
  | "changes_requested";

export type ReviewDecision =
  | "accepted_as_evidence"
  | "context_only"
  | "insufficient"
  | "rejected";

export type EvidenceRelationKind = "supports" | "contradicts" | "contextual" | "insufficient";

export type LimitationRecord = {
  readonly message: string;
};

export type SavedSourceAuthor = {
  readonly givenName?: string | null;
  readonly familyName?: string | null;
  readonly displayName: string;
};

export type MissionSourceRelation = {
  readonly missionId: string;
  readonly linkedAt: string;
  readonly linkedBy: string;
  readonly relevanceNote?: string | null;
};

export type SavedKnowledgeSource = {
  readonly id: string;
  readonly schemaVersion: number;
  readonly canonicalId: string | null;
  readonly provider: KnowledgeProviderId;
  readonly providerRecordId: string | null;
  readonly sourceType: string;
  readonly title: string;
  readonly authors: readonly SavedSourceAuthor[];
  readonly publisher?: string | null;
  readonly publicationDate?: string | null;
  readonly updatedDate?: string | null;
  readonly doi?: string | null;
  readonly landingPageUrl?: string | null;
  readonly retrievedAt: string;
  readonly savedAt: string;
  readonly savedBy: string;
  readonly provenance: ProvenanceRecord;
  readonly lifecycleState: SourceIngestionState;
  readonly trustState: KnowledgeTrustState;
  readonly abstract?: string | null;
  readonly abstractAvailability: AbstractAvailability;
  readonly limitations: readonly LimitationRecord[];
  readonly missionRelations: readonly MissionSourceRelation[];
  readonly humanReviewState: HumanReviewState;
  readonly latestReviewId?: string | null;
  readonly projectEvidenceRefId?: string | null;
};

export type SourceLifecycleTransition = {
  readonly sourceId: string;
  readonly fromState: SourceIngestionState;
  readonly toState: SourceIngestionState;
  readonly actor: string;
  readonly timestamp: string;
  readonly reason?: string | null;
  readonly missionId?: string | null;
};

export type SourceReviewRecord = {
  readonly reviewId: string;
  readonly sourceId: string;
  readonly missionId: string;
  readonly reviewerId: string;
  readonly reviewerDisplayName: string;
  readonly decision: ReviewDecision;
  readonly relation: EvidenceRelationKind;
  readonly rationale?: string | null;
  readonly questionId?: string | null;
  readonly claimId?: string | null;
  readonly limitations: readonly LimitationRecord[];
  readonly sourceSnapshotAt: string;
  readonly createdAt: string;
};

export type ReviewedEvidenceRelation = {
  readonly id: string;
  readonly sourceId: string;
  readonly missionId: string;
  readonly questionId?: string | null;
  readonly claimId?: string | null;
  readonly relation: EvidenceRelationKind;
  readonly reviewId: string;
  readonly limitations: readonly LimitationRecord[];
  readonly createdBy: string;
  readonly createdAt: string;
};
