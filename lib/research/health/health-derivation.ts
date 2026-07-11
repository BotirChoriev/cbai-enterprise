import type { ResearchReadinessState } from "@/lib/research/intelligence/intelligence-types";
import type { ResearchHealthState } from "@/lib/research/health/health-types";

// Deterministic: each existing readiness stage maps to exactly one health state — no separate
// derivation from raw evidence/review data, per "the new engine must consume existing engines."
// No topic reaches "healthy" today because the "ready" readiness stage never occurs with
// current data (no review is ever opened, no findings are ever recorded anywhere in this
// platform) — reserved honestly for a future state, same as the readiness engine's own
// unreachable "ready"/"unknown" stages.
const HEALTH_BY_STAGE: Record<ResearchReadinessState, ResearchHealthState> = {
  ready: "healthy",
  partially_ready: "stable",
  needs_evidence: "weak",
  review_required: "critical",
  unknown: "critical",
};

export function deriveHealthState(stage: ResearchReadinessState): ResearchHealthState {
  return HEALTH_BY_STAGE[stage];
}
