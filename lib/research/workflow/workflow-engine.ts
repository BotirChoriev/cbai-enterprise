import { deriveResearchHealth } from "@/lib/research/health/health-engine";
import { deriveWorkflowNextAction, deriveWorkflowStage } from "@/lib/research/workflow/workflow-stages";
import {
  deriveActionLink,
  deriveAdvancementRequirements,
  deriveUnavailableActions,
} from "@/lib/research/workflow/workflow-derivation";
import { buildWorkflowReason } from "@/lib/research/workflow/workflow-reasons";
import type { WorkflowResult } from "@/lib/research/workflow/workflow-model";

/**
 * Derive the deterministic Research Workflow result for a topic. Consumes only the Research
 * Health Engine (which itself already composes Readiness, which composes Gap/Decision/Review)
 * — no raw evidence, readiness, health, review, gap, or decision logic is re-derived here.
 * This engine only translates that existing output into a workflow-shaped answer: current
 * stage, single next action, why, what blocks it, what must become true to advance, and which
 * later actions remain unavailable. No percentages, no AI, no invented states.
 */
export function deriveResearchWorkflow(topicId: string): WorkflowResult | undefined {
  const health = deriveResearchHealth(topicId);
  if (!health) {
    return undefined;
  }

  const currentStage = deriveWorkflowStage(health.stage);
  const nextAction = deriveWorkflowNextAction(health.recommendedNextAction);

  return {
    topic: health.topic,
    currentStage,
    nextAction,
    reason: buildWorkflowReason(currentStage, nextAction, health.blockingFactors),
    blockingFactors: health.blockingFactors,
    advancementRequirements: deriveAdvancementRequirements(currentStage),
    unavailableActions: deriveUnavailableActions(),
    sourceSignals: ["health.stage", "health.recommendedNextAction", "health.blockingFactors"],
    actionLink: deriveActionLink(topicId, nextAction, health.blockingFactors),
  };
}
