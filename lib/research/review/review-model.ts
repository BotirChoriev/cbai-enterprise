import type {
  ResearchReviewDecision,
  ResearchReviewKind,
  ResearchReviewStatus,
  ResearchReviewVisibility,
  ReviewPriority,
  ReviewRecommendation,
} from "@/lib/research/review/review-types";

export interface ResearchReview {
  reviewId: string;
  relatedTopicIds: readonly string[];
  kind: ResearchReviewKind;
  status: ResearchReviewStatus;
  priority: ReviewPriority;
  visibility: ResearchReviewVisibility;
  title: string;
  summary: string;
  humanReviewRequired: boolean;
}

export interface ReviewAssignment {
  assignmentId: string;
  reviewId: string;
  assigneeId: string;
  assigneeName: string;
  status: ResearchReviewStatus;
}

export interface ReviewComment {
  commentId: string;
  reviewId: string;
  authorId: string;
  authorName: string;
  body: string;
  visibility: ResearchReviewVisibility;
}

export interface ReviewDecision {
  decisionId: string;
  reviewId: string;
  decision: ResearchReviewDecision;
  recommendation: ReviewRecommendation;
  rationale: string;
  humanReviewRequired: boolean;
}

export interface ReviewRevision {
  revisionId: string;
  reviewId: string;
  revisionNumber: number;
  summary: string;
  status: ResearchReviewStatus;
}

export interface ReviewHistory {
  historyId: string;
  reviewId: string;
  status: ResearchReviewStatus;
  changeSummary: string;
}
