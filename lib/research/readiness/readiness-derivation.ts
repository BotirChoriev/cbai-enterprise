import type { EvidenceGapIntelligence } from "@/lib/research/intelligence/intelligence-model";
import type { ResearchReviewWorkspaceState } from "@/lib/research/intelligence/review-workspace-model";
import type { ResearchDecision } from "@/lib/research/intelligence/decision-types";
import type { Milestone } from "@/lib/research/readiness/readiness-model";
import { MILESTONE_LABELS, type MilestoneId } from "@/lib/research/readiness/readiness-types";

function toMilestone(id: MilestoneId, complete: boolean): Milestone {
  return { id, label: MILESTONE_LABELS[id], complete };
}

/**
 * Derive the six research milestones from existing engine output only. Every boolean here
 * traces directly to a real field already produced by the Gap Engine, Decision Engine, or
 * Review Workspace Engine — nothing is computed independently of them.
 */
export function deriveMilestones(
  intelligence: EvidenceGapIntelligence,
  workspace: ResearchReviewWorkspaceState,
  decision: ResearchDecision,
): readonly Milestone[] {
  return [
    toMilestone("question_defined", intelligence.topic.description.trim().length > 0),
    toMilestone("evidence_catalogued", intelligence.topic.relatedEvidenceTypes.length > 0),
    toMilestone("evidence_connected", intelligence.hasLiveConnectedEvidence),
    toMilestone("review_opened", intelligence.reviewStatus.reviewOpened),
    toMilestone("findings_recorded", workspace.findings.length > 0),
    toMilestone(
      "decision_reached",
      workspace.findings.length > 0 && decision === "no_action_required",
    ),
  ];
}
