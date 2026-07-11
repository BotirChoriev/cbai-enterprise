import type { ResearchTopic } from "@/lib/research/research-topics";
import type { TopicEvidenceCatalogItem } from "@/lib/research/evidence/evidence-topic-builder";
import type { WorkflowNextAction, WorkflowStage } from "@/lib/research/workflow/workflow-types";

/** A later-stage action that is not yet possible, and the deterministic reason why. */
export interface UnavailableAction {
  action: string;
  reason: string;
}

/** A real, working, server-compatible link — only ever present when a real route exists. */
export interface WorkflowActionLink {
  href: string;
  label: string;
}

export interface WorkflowResult {
  topic: ResearchTopic;
  currentStage: WorkflowStage;
  nextAction: WorkflowNextAction;
  /** Single deterministic explanation for why nextAction was recommended. */
  reason: string;
  blockingFactors: readonly TopicEvidenceCatalogItem[];
  advancementRequirements: readonly string[];
  unavailableActions: readonly UnavailableAction[];
  /** Names the existing capability-output fields that produced this result, for explainability. */
  sourceSignals: readonly string[];
  /** Present only when nextAction maps to a real existing route/section; otherwise undefined. */
  actionLink: WorkflowActionLink | undefined;
}
