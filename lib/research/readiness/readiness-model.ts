import type { ResearchTopic } from "@/lib/research/research-topics";
import type { ResearchReadinessState } from "@/lib/research/intelligence/intelligence-types";
import type { ResearchDecision } from "@/lib/research/intelligence/decision-types";
import type { TopicEvidenceCatalogItem } from "@/lib/research/evidence/evidence-topic-builder";
import type { MilestoneId } from "@/lib/research/readiness/readiness-types";

export interface Milestone {
  id: MilestoneId;
  label: string;
  complete: boolean;
}

export interface ResearchReadinessReport {
  topic: ResearchTopic;
  /** Reuses the existing ResearchReadinessState from the Gap Engine — not a duplicate enum. */
  stage: ResearchReadinessState;
  completedMilestones: readonly Milestone[];
  remainingMilestones: readonly Milestone[];
  blockingIssues: readonly TopicEvidenceCatalogItem[];
  /** Reuses the existing ResearchDecision from the Decision Engine — not re-derived. */
  recommendedNextAction: ResearchDecision;
  /** Deterministic explanations, one per remaining milestone or blocking issue. Never AI, never guessed. */
  reasons: readonly string[];
}
