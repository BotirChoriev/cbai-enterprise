"use client";

import { useSearchParams } from "next/navigation";
import {
  findTopicEvidenceItemBySlug,
  type TopicEvidenceReview,
} from "@/lib/research/evidence/evidence-topic-builder";
import TopicEvidenceReviewWorkflow from "@/components/research/topic/TopicEvidenceReviewWorkflow";

const EVIDENCE_PARAM = "evidence";

type TopicEvidenceSelectionProps = {
  review: TopicEvidenceReview;
};

// Isolated in its own small client boundary (rather than inside ResearchTopicDetail) so the
// useSearchParams()-driven Suspense fallback only affects this section — the rest of the topic
// detail page stays fully static.
export default function TopicEvidenceSelection({ review }: TopicEvidenceSelectionProps) {
  const searchParams = useSearchParams();
  const requestedSlug = searchParams.get(EVIDENCE_PARAM);

  const matchedEvidence = requestedSlug
    ? findTopicEvidenceItemBySlug(review.evidenceItems, requestedSlug)
    : undefined;

  const selectedEvidence = matchedEvidence ?? review.selectedEvidence;

  return <TopicEvidenceReviewWorkflow review={review} selectedEvidence={selectedEvidence} />;
}
