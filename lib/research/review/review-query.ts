import type {
  ResearchReview,
  ReviewAssignment,
  ReviewDecision,
  ReviewHistory,
  ReviewRevision,
} from "@/lib/research/review/review-model";
import type { ResearchReviewStatus } from "@/lib/research/review/review-types";

/** Find a single review by its ID. */
export function getReviewById(
  reviews: readonly ResearchReview[],
  reviewId: string,
): ResearchReview | undefined {
  return reviews.find((review) => review.reviewId === reviewId);
}

/** List all reviews related to a research topic. */
export function getReviewsByTopic(
  reviews: readonly ResearchReview[],
  topicId: string,
): readonly ResearchReview[] {
  return reviews.filter((review) => review.relatedTopicIds.includes(topicId));
}

/** List all reviews with a given status. */
export function getReviewsByStatus(
  reviews: readonly ResearchReview[],
  status: ResearchReviewStatus,
): readonly ResearchReview[] {
  return reviews.filter((review) => review.status === status);
}

/** List all reviews assigned to a given reviewer. */
export function getReviewsByReviewer(
  reviews: readonly ResearchReview[],
  assignments: readonly ReviewAssignment[],
  assigneeId: string,
): readonly ResearchReview[] {
  const assignedReviewIds = new Set(
    assignments
      .filter((assignment) => assignment.assigneeId === assigneeId)
      .map((assignment) => assignment.reviewId),
  );
  return reviews.filter((review) => assignedReviewIds.has(review.reviewId));
}

/** Find the highest-numbered revision recorded for a review. */
export function getLatestRevision(
  revisions: readonly ReviewRevision[],
  reviewId: string,
): ReviewRevision | undefined {
  return revisions
    .filter((revision) => revision.reviewId === reviewId)
    .reduce<ReviewRevision | undefined>((latest, revision) => {
      if (!latest || revision.revisionNumber > latest.revisionNumber) {
        return revision;
      }
      return latest;
    }, undefined);
}

/** List all history entries recorded for a review. */
export function getReviewHistory(
  history: readonly ReviewHistory[],
  reviewId: string,
): readonly ReviewHistory[] {
  return history.filter((entry) => entry.reviewId === reviewId);
}

/** List all reviews awaiting review action. */
export function getPendingReviews(
  reviews: readonly ResearchReview[],
): readonly ResearchReview[] {
  return reviews.filter((review) => review.status === "pending_review");
}

/** List all reviews with at least one approved decision. */
export function getApprovedReviews(
  reviews: readonly ResearchReview[],
  decisions: readonly ReviewDecision[],
): readonly ResearchReview[] {
  const approvedReviewIds = new Set(
    decisions
      .filter((decision) => decision.decision === "approved")
      .map((decision) => decision.reviewId),
  );
  return reviews.filter((review) => approvedReviewIds.has(review.reviewId));
}
