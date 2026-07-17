/** BUILD-030A — Canonical Living Object Network contracts. */

import type { KnowledgeTrustState, ProvenanceRecord } from "@/lib/knowledge-connectors/types";
import type { LimitationRecord } from "@/lib/knowledge-ingestion/source-ingestion.types";

export type LivingObjectType =
  | "user"
  | "organization"
  | "mission"
  | "project"
  | "research_topic"
  | "research_question"
  | "hypothesis"
  | "source"
  | "evidence"
  | "claim"
  | "finding"
  | "note"
  | "dataset"
  | "publication"
  | "patent"
  | "report"
  | "impact_review"
  | "country"
  | "company"
  | "collaboration";

export type LivingObjectReference = {
  readonly objectType: LivingObjectType;
  readonly objectId: string;
  readonly objectVersion?: number | null;
};

export type LivingRelationshipType =
  | "member_of"
  | "owns"
  | "created"
  | "participates_in"
  | "works_on"
  | "contains"
  | "belongs_to"
  | "linked_to"
  | "derived_from"
  | "retrieved_from"
  | "reviewed_by"
  | "supports"
  | "contradicts"
  | "contextualizes"
  | "answers"
  | "investigates"
  | "uses_method"
  | "cites"
  | "references"
  | "produced_report"
  | "affects"
  | "located_in"
  | "associated_with"
  | "shared_with"
  | "supersedes";

export type LivingRelationshipStatus =
  | "suggested"
  | "asserted"
  | "human_confirmed"
  | "contradicted"
  | "superseded"
  | "rejected"
  | "archived";

export type LivingRelationshipProvenanceKind =
  | "system_derived"
  | "external_asserted"
  | "user_asserted"
  | "ai_suggested"
  | "human_confirmed";

export type LivingRelationship = {
  readonly id: string;
  readonly source: LivingObjectReference;
  readonly target: LivingObjectReference;
  readonly relationshipType: LivingRelationshipType;
  readonly direction: "directed" | "undirected";
  readonly status: LivingRelationshipStatus;
  readonly provenanceKind: LivingRelationshipProvenanceKind;
  readonly provenance: readonly ProvenanceRecord[];
  readonly supportingEvidenceIds: readonly string[];
  readonly contradictingEvidenceIds: readonly string[];
  readonly missionId?: string | null;
  readonly organizationId?: string | null;
  readonly collaborationId?: string | null;
  readonly createdBy: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly reviewedBy?: string | null;
  readonly reviewedAt?: string | null;
  readonly limitations: readonly LimitationRecord[];
  readonly version: number;
};

export type ResolvedLivingObject = {
  readonly reference: LivingObjectReference;
  readonly label: string;
  readonly lifecycleState: string;
  readonly trustState: KnowledgeTrustState;
  readonly provenanceAvailable: boolean;
  readonly limitations: readonly string[];
  readonly missionRelevance: string | null;
  readonly nextAction: string | null;
  readonly accessDenied: boolean;
};

export type LivingObjectResolveResult =
  | { readonly ok: true; readonly object: ResolvedLivingObject; readonly relationships: readonly LivingRelationship[] }
  | { readonly ok: false; readonly code: "not_found" | "not_authorized"; readonly message: string };
