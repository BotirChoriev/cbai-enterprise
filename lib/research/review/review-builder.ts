import type {
  ResearchReview,
  ReviewAssignment,
  ReviewComment,
  ReviewDecision,
  ReviewHistory,
  ReviewRevision,
} from "@/lib/research/review/review-model";

/** Construct a new research review with a generated ID and timestamp. */
export function createResearchReview(
  input: Omit<ResearchReview, "reviewId" | "createdAt">,
): ResearchReview {
  return {
    reviewId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };
}

/** Construct a new review assignment with a generated ID and timestamp. */
export function createReviewAssignment(
  input: Omit<ReviewAssignment, "assignmentId" | "createdAt">,
): ReviewAssignment {
  return {
    assignmentId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };
}

/** Construct a new review comment with a generated ID and timestamp. */
export function createReviewComment(
  input: Omit<ReviewComment, "commentId" | "createdAt">,
): ReviewComment {
  return {
    commentId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };
}

/** Construct a new review decision with a generated ID and timestamp. */
export function createReviewDecision(
  input: Omit<ReviewDecision, "decisionId" | "createdAt">,
): ReviewDecision {
  return {
    decisionId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };
}

/** Construct a new review revision with a generated ID and timestamp. */
export function createReviewRevision(
  input: Omit<ReviewRevision, "revisionId" | "createdAt">,
): ReviewRevision {
  return {
    revisionId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };
}

/** Return a new history list with a generated, timestamped entry appended. */
export function appendReviewHistory(
  history: readonly ReviewHistory[],
  input: Omit<ReviewHistory, "historyId" | "createdAt">,
): readonly ReviewHistory[] {
  const entry: ReviewHistory = {
    historyId: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    ...input,
  };
  return [...history, entry];
}
