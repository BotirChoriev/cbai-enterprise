import { WORKFLOW_NEXT_ACTION_LABELS, WORKFLOW_STAGE_LABELS } from "@/lib/research/workflow/workflow-types";
import type { WorkflowNextAction, WorkflowStage } from "@/lib/research/workflow/workflow-types";
import type { TopicEvidenceCatalogItem } from "@/lib/research/evidence/evidence-topic-builder";

/**
 * Build the single deterministic reason for the recommended next action — always traced to
 * the real stage and, when present, the specific blocking evidence category. Never AI, never
 * a free-text summary.
 */
export function buildWorkflowReason(
  stage: WorkflowStage,
  nextAction: WorkflowNextAction,
  blockingFactors: readonly TopicEvidenceCatalogItem[],
): string {
  const stageLabel = WORKFLOW_STAGE_LABELS[stage];
  const actionLabel = WORKFLOW_NEXT_ACTION_LABELS[nextAction];

  if (blockingFactors.length > 0) {
    return `Stage is "${stageLabel}" with ${blockingFactors.length} blocking factor${blockingFactors.length === 1 ? "" : "s"} — recommended action is "${actionLabel}".`;
  }

  return `Stage is "${stageLabel}" — recommended action is "${actionLabel}".`;
}
