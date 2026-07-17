import type { ResearchReadinessState } from "@/lib/research/intelligence/intelligence-types";
import type { ResearchHealthState } from "@/lib/research/health/health-types";

const HEALTH_BY_STAGE: Record<ResearchReadinessState, ResearchHealthState> = {
  ready: "healthy",
  partially_ready: "stable",
  needs_evidence: "weak",
  review_required: "critical",
  unknown: "critical",
};

export function deriveHealthState(
  stage: ResearchReadinessState,
  hasLiveConnectedEvidence: boolean,
): ResearchHealthState {
  if (stage === "partially_ready" && !hasLiveConnectedEvidence) {
    return "weak";
  }
  return HEALTH_BY_STAGE[stage];
}
