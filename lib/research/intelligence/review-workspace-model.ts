import type { ResearchTopic } from "@/lib/research/research-topics";
import type { EvidenceGapIntelligence } from "@/lib/research/intelligence/intelligence-model";
import type { ResearchDecision } from "@/lib/research/intelligence/decision-types";
import type { ResearchReadinessState } from "@/lib/research/intelligence/intelligence-types";

/**
 * A process-level question about this topic's research review state — never a scientific
 * claim or hypothesis. Distinct from the curated OpenResearchQuestion catalog in
 * lib/research/open-questions/, which is pre-authored content unrelated to live gap state.
 */
export interface ReviewOpenQuestion {
  questionId: string;
  question: string;
}

/** Foundation for future structured research notes. No persistence exists anywhere in this
 * platform yet, so this is always empty today — architecture only, no fabricated content. */
export interface ResearchNote {
  noteId: string;
  topicId: string;
  body: string;
  createdAt: string;
}

/** Foundation for future research findings. No persistence exists anywhere in this platform
 * yet, so this is always empty today — architecture only, no fabricated content. */
export interface ResearchFinding {
  findingId: string;
  topicId: string;
  summary: string;
  createdAt: string;
}

/** Deterministic counts only — never a percentage or invented completion score. */
export interface ReviewProgress {
  connectedCount: number;
  totalCount: number;
  readiness: ResearchReadinessState;
}

export interface ResearchReviewWorkspaceState {
  topic: ResearchTopic;
  intelligence: EvidenceGapIntelligence;
  decision: ResearchDecision;
  openQuestions: readonly ReviewOpenQuestion[];
  notes: readonly ResearchNote[];
  findings: readonly ResearchFinding[];
  progress: ReviewProgress;
}
