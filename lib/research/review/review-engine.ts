import type {
  ResearchReview,
  ReviewAssignment,
  ReviewDecision,
} from "@/lib/research/review/review-model";
import type {
  ResearchReviewStatus,
  ReviewRecommendation,
} from "@/lib/research/review/review-types";
import {
  createReviewAssignment,
  createReviewDecision,
} from "@/lib/research/review/review-builder";

function assertTransition(
  review: ResearchReview,
  allowedStatuses: readonly ResearchReviewStatus[],
  action: string,
): void {
  if (!allowedStatuses.includes(review.status)) {
    throw new Error(
      `Cannot ${action} review "${review.reviewId}" from status "${review.status}".`,
    );
  }
}

/** Submit a draft review, moving it into the pending review queue. */
export function submitReview(review: ResearchReview): ResearchReview {
  assertTransition(review, ["draft"], "submit");
  return { ...review, status: "pending_review" };
}

/** Assign a reviewer to a pending review and move it into active review. */
export function assignReviewer(
  review: ResearchReview,
  input: { assigneeId: string; assigneeName: string },
): { review: ResearchReview; assignment: ReviewAssignment } {
  assertTransition(review, ["pending_review"], "assign a reviewer to");

  const assignment = createReviewAssignment({
    reviewId: review.reviewId,
    assigneeId: input.assigneeId,
    assigneeName: input.assigneeName,
    status: "in_review",
  });

  return {
    review: { ...review, status: "in_review" },
    assignment,
  };
}

/** Approve an in-review review, recording the decision and closing it out. */
export function approveReview(
  review: ResearchReview,
  input: {
    rationale: string;
    recommendation: ReviewRecommendation;
    humanReviewRequired: boolean;
  },
): { review: ResearchReview; decision: ReviewDecision } {
  assertTransition(review, ["in_review"], "approve");

  const decision = createReviewDecision({
    reviewId: review.reviewId,
    decision: "approved",
    recommendation: input.recommendation,
    rationale: input.rationale,
    humanReviewRequired: input.humanReviewRequired,
  });

  return {
    review: { ...review, status: "completed" },
    decision,
  };
}

/** Reject an in-review review, recording the decision and closing it out. */
export function rejectReview(
  review: ResearchReview,
  input: {
    rationale: string;
    recommendation: ReviewRecommendation;
    humanReviewRequired: boolean;
  },
): { review: ResearchReview; decision: ReviewDecision } {
  assertTransition(review, ["in_review"], "reject");

  const decision = createReviewDecision({
    reviewId: review.reviewId,
    decision: "rejected",
    recommendation: input.recommendation,
    rationale: input.rationale,
    humanReviewRequired: input.humanReviewRequired,
  });

  return {
    review: { ...review, status: "completed" },
    decision,
  };
}

/** Archive a completed review. */
export function archiveReview(review: ResearchReview): ResearchReview {
  assertTransition(review, ["completed"], "archive");
  return { ...review, status: "archived" };
}

/** Restore an archived review back to completed. */
export function restoreReview(review: ResearchReview): ResearchReview {
  assertTransition(review, ["archived"], "restore");
  return { ...review, status: "completed" };
}
