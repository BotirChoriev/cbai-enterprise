/**
 * BUILD-028.5 — Source review records and evidence relations.
 */

import { resolveStorageKey } from "@/lib/storage/namespaced-key";
import { notifyMissionDataChanged } from "@/lib/intelligence-os/mission-activation-events";
import { recordConfirmedMutation } from "@/lib/telemetry/workflow-telemetry";
import { saveProjectEvidence } from "@/lib/project/project-store";
import { loadCurrentMission } from "@/lib/intelligence-os/mission-store";
import type {
  ReviewDecision,
  EvidenceRelationKind,
  SourceReviewRecord,
  ReviewedEvidenceRelation,
  LimitationRecord,
  SourceIngestionState,
} from "@/lib/knowledge-ingestion/source-ingestion.types";
import {
  loadSavedKnowledgeSource,
  resolveIngestionActorId,
  updateSavedSourceRecord,
} from "@/lib/knowledge-ingestion/saved-source-store";
import { assertSourceLifecycleTransition } from "@/lib/knowledge-ingestion/source-lifecycle";

const REVIEWS_KEY = "cbai-source-reviews";
const RELATIONS_KEY = "cbai-reviewed-evidence-relations";

const memoryReviews: SourceReviewRecord[] = [];
const memoryRelations: ReviewedEvidenceRelation[] = [];

function isBrowser(): boolean {
  return typeof window !== "undefined";
}

function readList<T>(key: string, isValid: (v: unknown) => v is T): T[] {
  if (!isBrowser()) {
    if (key === REVIEWS_KEY) return memoryReviews.filter(isValid) as T[];
    if (key === RELATIONS_KEY) return memoryRelations.filter(isValid) as T[];
    return [];
  }
  try {
    const raw = window.localStorage.getItem(resolveStorageKey(key));
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isValid);
  } catch {
    return [];
  }
}

function writeList<T>(key: string, items: readonly T[]): void {
  if (!isBrowser()) {
    if (key === REVIEWS_KEY) {
      memoryReviews.length = 0;
      memoryReviews.push(...(items as unknown as SourceReviewRecord[]));
    } else if (key === RELATIONS_KEY) {
      memoryRelations.length = 0;
      memoryRelations.push(...(items as unknown as ReviewedEvidenceRelation[]));
    }
    return;
  }
  window.localStorage.setItem(resolveStorageKey(key), JSON.stringify(items));
}

function isReview(v: unknown): v is SourceReviewRecord {
  const r = v as SourceReviewRecord;
  return typeof r === "object" && r !== null && typeof r.reviewId === "string";
}

function isRelation(v: unknown): v is ReviewedEvidenceRelation {
  const r = v as ReviewedEvidenceRelation;
  return typeof r === "object" && r !== null && typeof r.id === "string";
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function loadSourceReviews(sourceId?: string): SourceReviewRecord[] {
  const all = readList(REVIEWS_KEY, isReview);
  return sourceId ? all.filter((r) => r.sourceId === sourceId) : all;
}

export function loadReviewedEvidenceRelations(missionId?: string): ReviewedEvidenceRelation[] {
  const all = readList(RELATIONS_KEY, isRelation);
  return missionId ? all.filter((r) => r.missionId === missionId) : all;
}

export type CompleteSourceReviewInput = {
  readonly sourceId: string;
  readonly missionId: string;
  readonly reviewerDisplayName: string;
  readonly decision: ReviewDecision;
  readonly relation: EvidenceRelationKind;
  readonly rationale?: string | null;
  readonly questionId?: string | null;
  readonly claimId?: string | null;
  readonly limitations?: readonly LimitationRecord[];
};

export type CompleteSourceReviewResult =
  | { readonly ok: true; readonly review: SourceReviewRecord; readonly sourceId: string }
  | { readonly ok: false; readonly error: string };

export function completeSavedSourceReview(
  input: CompleteSourceReviewInput,
): CompleteSourceReviewResult {
  const source = loadSavedKnowledgeSource(input.sourceId);
  if (!source) return { ok: false, error: "Source not found." };
  if (!source.missionRelations.some((r) => r.missionId === input.missionId)) {
    return { ok: false, error: "Source is not linked to this mission." };
  }
  if (source.lifecycleState !== "awaiting_review") {
    return { ok: false, error: "Source is not awaiting review." };
  }

  const reviewerId = resolveIngestionActorId();
  const now = new Date().toISOString();
  const review: SourceReviewRecord = {
    reviewId: newId("rev"),
    sourceId: input.sourceId,
    missionId: input.missionId,
    reviewerId,
    reviewerDisplayName: input.reviewerDisplayName.trim() || "Self-review",
    decision: input.decision,
    relation: input.relation,
    rationale: input.rationale ?? null,
    questionId: input.questionId ?? null,
    claimId: input.claimId ?? null,
    limitations: input.limitations ?? [],
    sourceSnapshotAt: source.savedAt,
    createdAt: now,
  };

  writeList(REVIEWS_KEY, [...readList(REVIEWS_KEY, isReview), review]);

  const relation: ReviewedEvidenceRelation = {
    id: newId("rel"),
    sourceId: input.sourceId,
    missionId: input.missionId,
    questionId: input.questionId ?? null,
    claimId: input.claimId ?? null,
    relation: input.relation,
    reviewId: review.reviewId,
    limitations: input.limitations ?? [],
    createdBy: reviewerId,
    createdAt: now,
  };
  writeList(RELATIONS_KEY, [...readList(RELATIONS_KEY, isRelation), relation]);

  const fromState = source.lifecycleState;
  let lifecycleState: SourceIngestionState = source.lifecycleState;
  let trustState = source.trustState;
  let humanReviewState = source.humanReviewState;
  let projectEvidenceRefId = source.projectEvidenceRefId ?? null;

  if (input.decision === "accepted_as_evidence") {
    assertSourceLifecycleTransition(fromState, "reviewed_evidence");
    lifecycleState = "reviewed_evidence";
    trustState = input.relation === "contradicts" ? "contradicted" : "supported";
    humanReviewState = "accepted";

    const mission = loadCurrentMission();
    if (mission?.projectId) {
      const evidenceRef = saveProjectEvidence({
        projectId: mission.projectId,
        title: source.title,
        sourceUrl: source.landingPageUrl ?? (source.doi ? `https://doi.org/${source.doi}` : undefined),
        savedSourceId: source.id,
        reviewId: review.reviewId,
        reviewOutcome: "accepted_as_evidence",
        evidenceRelation: input.relation,
      });
      projectEvidenceRefId = evidenceRef.evidenceRefId;
    }
  } else if (input.decision === "rejected") {
    assertSourceLifecycleTransition(fromState, "rejected");
    lifecycleState = "rejected";
    trustState = "rejected";
    humanReviewState = "rejected";
    recordConfirmedMutation("source_review_rejected", {
      objectType: "saved_source",
      objectId: source.id,
    });
  } else {
    lifecycleState = "awaiting_review";
    humanReviewState = "accepted";
    trustState = input.decision === "context_only" ? "partially_supported" : "needs_review";
  }

  const updated = updateSavedSourceRecord(
    {
      ...source,
      lifecycleState,
      trustState,
      humanReviewState,
      latestReviewId: review.reviewId,
      projectEvidenceRefId,
    },
    fromState,
  );

  recordConfirmedMutation("source_review_completed", {
    objectType: "saved_source",
    objectId: source.id,
    metadata: { decision: input.decision },
  });
  notifyMissionDataChanged("evidence");

  return { ok: true, review, sourceId: updated.id };
}

export function clearSourceReviewsForTests(): void {
  memoryReviews.length = 0;
  memoryRelations.length = 0;
  if (!isBrowser()) return;
  window.localStorage.removeItem(resolveStorageKey(REVIEWS_KEY));
  window.localStorage.removeItem(resolveStorageKey(RELATIONS_KEY));
}
