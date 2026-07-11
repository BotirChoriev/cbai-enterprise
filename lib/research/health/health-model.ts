import type { ResearchTopic } from "@/lib/research/research-topics";
import type { ResearchReadinessState } from "@/lib/research/intelligence/intelligence-types";
import type { ResearchDecision } from "@/lib/research/intelligence/decision-types";
import type { Milestone } from "@/lib/research/readiness/readiness-model";
import type { TopicEvidenceCatalogItem } from "@/lib/research/evidence/evidence-topic-builder";
import type { ResearchHealthState } from "@/lib/research/health/health-types";

export interface ResearchHealth {
  topic: ResearchTopic;
  /** Pass-through from the Research Readiness Engine — not re-derived. */
  stage: ResearchReadinessState;
  state: ResearchHealthState;
  /** Completed milestones from the Readiness Engine, reframed as strengths. */
  strengths: readonly Milestone[];
  /** Remaining milestones from the Readiness Engine, reframed as weaknesses. */
  weaknesses: readonly Milestone[];
  /** Blocking evidence items from the Gap Engine, via the Readiness Engine. */
  blockingFactors: readonly TopicEvidenceCatalogItem[];
  /** Pass-through from the Research Decision Engine — not re-derived. */
  recommendedNextAction: ResearchDecision;
  /** Deterministic explanations, never AI, never guessed. */
  reasons: readonly string[];
}
