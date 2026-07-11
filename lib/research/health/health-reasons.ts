import { RESEARCH_READINESS_LABELS } from "@/lib/research/intelligence/intelligence-types";
import type { ResearchReadinessState } from "@/lib/research/intelligence/intelligence-types";
import { RESEARCH_HEALTH_LABELS } from "@/lib/research/health/health-types";
import type { ResearchHealthState } from "@/lib/research/health/health-types";

/**
 * Build deterministic reasons for the current health state — always traced to the real
 * readiness stage and the Readiness Engine's own reasons, never guessed or generated.
 */
export function buildHealthReasons(
  stage: ResearchReadinessState,
  health: ResearchHealthState,
  readinessReasons: readonly string[],
): readonly string[] {
  return [
    `Research stage is "${RESEARCH_READINESS_LABELS[stage]}", which maps to ${RESEARCH_HEALTH_LABELS[health]} health.`,
    ...readinessReasons,
  ];
}
