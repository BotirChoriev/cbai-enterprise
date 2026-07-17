import { buildTopicEvidenceReview } from "@/lib/research/evidence/evidence-topic-builder";
import type { TopicEvidenceReview } from "@/lib/research/evidence/evidence-topic-builder";
import type { ResearchTopicStatus } from "@/lib/research/research-topics";
import type { EvidenceGapIntelligence } from "@/lib/research/intelligence/intelligence-model";
import type {
  ResearchNextAction,
  ResearchReadinessState,
} from "@/lib/research/intelligence/intelligence-types";
import { loadEvidenceLifecycle } from "@/lib/research/research-workspace-store";

const LINKED_LIFECYCLE_STAGES = new Set(["linked", "compared", "referenced", "included_in_report"]);

// Deterministic: each real ResearchTopicStatus maps to exactly one readiness state.
const READINESS_BY_TOPIC_STATUS: Record<ResearchTopicStatus, ResearchReadinessState> = {
  catalog_available: "partially_ready",
  evidence_not_connected: "needs_evidence",
  workspace_not_available: "review_required",
};

const NEXT_ACTION_BY_READINESS: Record<ResearchReadinessState, ResearchNextAction> = {
  ready: "review_existing_evidence",
  partially_ready: "open_evidence_review",
  needs_evidence: "connect_evidence_source",
  review_required: "review_existing_evidence",
  unknown: "review_existing_evidence",
};

function deriveIntelligenceFromReview(review: TopicEvidenceReview): EvidenceGapIntelligence {
  const lifecycle = loadEvidenceLifecycle(review.topic.topicId);

  const catalogDocumentedEvidence = review.evidenceItems.filter(
    (item) => item.status === "catalog_available",
  );
  const disconnectedEvidence = review.evidenceItems.filter(
    (item) => item.status === "source_not_connected",
  );
  const reviewGatedEvidence = review.evidenceItems.filter(
    (item) => item.status === "human_review_required",
  );

  const connectedEvidence = review.evidenceItems.filter((item) => {
    const record = lifecycle[item.evidenceItemId];
    return record !== undefined && LINKED_LIFECYCLE_STAGES.has(record.stage);
  });

  const hasLiveConnectedEvidence = connectedEvidence.length > 0;

  let researchReadiness = READINESS_BY_TOPIC_STATUS[review.topic.status];
  if (researchReadiness === "partially_ready" && !hasLiveConnectedEvidence) {
    researchReadiness = "needs_evidence";
  }

  const missingEvidenceCategories = [
    ...catalogDocumentedEvidence.map((item) => item.label),
    ...disconnectedEvidence.map((item) => item.label),
  ];

  return {
    topic: review.topic,
    catalogDocumentedEvidence,
    connectedEvidence,
    disconnectedEvidence,
    reviewGatedEvidence,
    reviewStatus: review.reviewReadiness,
    missingEvidenceCategories,
    hasLiveConnectedEvidence,
    researchReadiness,
    nextAction: NEXT_ACTION_BY_READINESS[researchReadiness],
  };
}

/**
 * Derive deterministic evidence-gap intelligence for a topic from real platform state only.
 * No AI, no probability, no invented scoring — every field traces back to the existing
 * ResearchTopic and TopicEvidenceReview data already used by the Evidence and Research
 * Mission workspaces.
 */
export function deriveEvidenceGapIntelligence(
  topicId: string,
): EvidenceGapIntelligence | undefined {
  const review = buildTopicEvidenceReview(topicId);
  if (!review) {
    return undefined;
  }
  return deriveIntelligenceFromReview(review);
}
