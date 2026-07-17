import { deriveResearchReadiness } from "@/lib/research/readiness/readiness-engine";
import { deriveEvidenceGapIntelligence } from "@/lib/research/intelligence/intelligence-engine";
import { deriveHealthState } from "@/lib/research/health/health-derivation";
import { buildHealthReasons } from "@/lib/research/health/health-reasons";
import type { ResearchHealth } from "@/lib/research/health/health-model";

/**
 * Derive the deterministic Research Health for a topic — answers "how healthy is this
 * research mission?", nothing more.
 *
 * Reuses the Research Readiness Engine (which itself reuses the Gap Engine, Decision Engine,
 * and Review Workspace Engine) rather than re-deriving any signal. This is the single call a
 * consumer like Mission Control needs — stage, health state, strengths, weaknesses, blocking
 * factors, next action, and reasons all come from this one function. No percentages, no
 * scoring, no AI.
 */
export function deriveResearchHealth(topicId: string): ResearchHealth | undefined {
  const readiness = deriveResearchReadiness(topicId);
  if (!readiness) {
    return undefined;
  }

  const intelligence = deriveEvidenceGapIntelligence(topicId);
  const state = deriveHealthState(
    readiness.stage,
    intelligence?.hasLiveConnectedEvidence ?? false,
  );

  return {
    topic: readiness.topic,
    stage: readiness.stage,
    state,
    strengths: readiness.completedMilestones,
    weaknesses: readiness.remainingMilestones,
    blockingFactors: readiness.blockingIssues,
    recommendedNextAction: readiness.recommendedNextAction,
    reasons: buildHealthReasons(readiness.stage, state, readiness.reasons),
  };
}
