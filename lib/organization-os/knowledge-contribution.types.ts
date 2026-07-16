/**
 * EPIC-05 — Knowledge Contribution architecture.
 * Explainable contributions only — no points, rankings, or gamification.
 */

export type KnowledgeContributionType =
  | "evidence_review"
  | "question"
  | "reasoning"
  | "validation"
  | "methodology"
  | "research"
  | "teaching"
  | "mentoring"
  | "documentation"
  | "impact_review";

export type KnowledgeContribution = {
  readonly id: string;
  readonly type: KnowledgeContributionType;
  readonly missionId: string | null;
  readonly organizationId: string | null;
  readonly summary: string;
  readonly evidenceBasis: string | null;
  readonly explanation: string;
  readonly contributorRef: string | null;
  readonly occurredAt: string;
};

export const KNOWLEDGE_CONTRIBUTION_TYPES: readonly KnowledgeContributionType[] = [
  "evidence_review",
  "question",
  "reasoning",
  "validation",
  "methodology",
  "research",
  "teaching",
  "mentoring",
  "documentation",
  "impact_review",
];

export const KNOWLEDGE_CONTRIBUTION_RULES = {
  points: false,
  rankings: false,
  gamification: false,
  explainabilityRequired: true,
} as const;
