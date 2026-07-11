import type { TopicEvidenceCatalogItem } from "@/lib/research/evidence/evidence-topic-builder";
import type { UnavailableAction, WorkflowActionLink } from "@/lib/research/workflow/workflow-model";
import type { WorkflowNextAction, WorkflowStage } from "@/lib/research/workflow/workflow-types";
import { getResearchTopicPath } from "@/lib/research/research-topics";

const ADVANCEMENT_REQUIREMENTS_BY_STAGE: Record<WorkflowStage, readonly string[]> = {
  evidence_connection_required: [
    "At least one catalog evidence category must be connected to a source.",
  ],
  evidence_ready_for_review: ["A research review must be opened for this topic."],
  review_required: ["Human review of this topic's workspace readiness must be completed."],
  monitoring_required: [],
  unknown: ["Topic could not be identified."],
};

export function deriveAdvancementRequirements(stage: WorkflowStage): readonly string[] {
  return ADVANCEMENT_REQUIREMENTS_BY_STAGE[stage];
}

// Universal facts, true for every topic today: no review has ever been opened and no findings
// have ever been recorded anywhere in this platform, so these later-stage actions are always
// unavailable regardless of the current topic's stage.
const UNAVAILABLE_ACTIONS: readonly UnavailableAction[] = [
  {
    action: "continue_review",
    reason: "No research review has been opened for this topic yet.",
  },
  {
    action: "record_findings",
    reason: "Findings cannot be recorded until a review has been opened and completed.",
  },
  {
    action: "monitor_for_new_evidence",
    reason: "Monitoring is only available once evidence review and findings are complete.",
  },
];

export function deriveUnavailableActions(): readonly UnavailableAction[] {
  return UNAVAILABLE_ACTIONS;
}

/**
 * Build a real, working link for the recommended action, or undefined when no supported route
 * exists — the UI must render an honest non-interactive requirement in that case, never a dead
 * button. "connect_evidence" links directly to the specific blocking evidence category via the
 * existing ?evidence= URL selection; "open_evidence_review" links to the existing Review
 * Workspace section on the same page. No new route or persistence is introduced.
 */
export function deriveActionLink(
  topicId: string,
  nextAction: WorkflowNextAction,
  blockingFactors: readonly TopicEvidenceCatalogItem[],
): WorkflowActionLink | undefined {
  const topicPath = getResearchTopicPath(topicId);

  switch (nextAction) {
    case "connect_evidence": {
      const target = blockingFactors[0];
      if (!target) {
        return undefined;
      }
      return {
        href: `${topicPath}?evidence=${target.slug}`,
        label: `Connect ${target.label}`,
      };
    }
    case "open_evidence_review":
      return {
        href: `${topicPath}#topic-review-workspace-heading`,
        label: "Open evidence review",
      };
    case "continue_review":
    case "monitor_for_new_evidence":
    case "no_valid_action":
    case "unknown":
      return undefined;
  }
}
