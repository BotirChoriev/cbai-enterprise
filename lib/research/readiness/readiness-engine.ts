import { deriveEvidenceGapIntelligence } from "@/lib/research/intelligence/intelligence-engine";
import { deriveResearchDecision } from "@/lib/research/intelligence/decision-engine";
import { buildResearchReviewWorkspace } from "@/lib/research/intelligence/review-workspace-engine";
import { deriveMilestones } from "@/lib/research/readiness/readiness-derivation";
import { buildReadinessReasons } from "@/lib/research/readiness/readiness-reasons";
import type { ResearchReadinessReport } from "@/lib/research/readiness/readiness-model";

/**
 * Derive the deterministic Research Readiness report for a topic — the single question this
 * answers is "what is the current state of this research mission?", nothing more.
 *
 * Reuses the Evidence Gap Intelligence Engine, Research Decision Engine, and Review Workspace
 * Engine rather than re-deriving any of their signals; this engine only interprets that
 * existing output into a stage, milestone list, blocking issues, one recommendation, and
 * deterministic reasons. No percentages, no scoring, no AI — every field traces back to real
 * platform state.
 */
export function deriveResearchReadiness(topicId: string): ResearchReadinessReport | undefined {
  const intelligence = deriveEvidenceGapIntelligence(topicId);
  const decision = deriveResearchDecision(topicId);
  const workspace = buildResearchReviewWorkspace(topicId);
  if (!intelligence || !decision || !workspace) {
    return undefined;
  }

  const milestones = deriveMilestones(intelligence, workspace, decision);
  const completedMilestones = milestones.filter((milestone) => milestone.complete);
  const remainingMilestones = milestones.filter((milestone) => !milestone.complete);
  const blockingIssues = [
    ...intelligence.catalogDocumentedEvidence,
    ...intelligence.disconnectedEvidence,
    ...intelligence.reviewGatedEvidence,
  ];

  return {
    topic: intelligence.topic,
    stage: intelligence.researchReadiness,
    completedMilestones,
    remainingMilestones,
    blockingIssues,
    recommendedNextAction: decision,
    reasons: buildReadinessReasons(remainingMilestones, blockingIssues),
  };
}
