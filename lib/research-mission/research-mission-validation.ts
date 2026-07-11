import type { PlatformValidationResult } from "@/lib/foundation/validation-types";
import { canTransitionMission } from "@/lib/research-mission/research-mission-engine";
import type { ResearchMission } from "@/lib/research-mission/research-mission-engine";

/**
 * Deterministic structural validation only — confirms the ResearchMission record is internally
 * honest, not that its content is correct. Reuses the Platform Core's own
 * PlatformValidationResult (lib/foundation/validation-types.ts, EPIC-10) rather than declaring
 * a ninth independent `{ valid, issues }` interface. Checks identity, that history is a real
 * chain (each transition's previousState matches the one before it, and the final transition
 * lands on currentState), and that every recorded transition was actually legal per the
 * declared graph — the same checks lib/workflow/workflow-validation.ts's
 * validateWorkflowRecord (EPIC-06) already performs for Platform Workflows, applied here to the
 * mission's own state machine.
 */
export function validateResearchMission(mission: ResearchMission): PlatformValidationResult {
  const issues: string[] = [];

  if (!mission.missionId.trim()) {
    issues.push("Research Mission is missing an identity (missionId).");
  }
  if (!mission.goal.trim()) {
    issues.push("Research Mission is missing a goal.");
  }

  mission.history.forEach((transition, index) => {
    const priorTransition = mission.history[index - 1];
    if (priorTransition && transition.previousState !== priorTransition.nextState) {
      issues.push(
        `Transition ${index} ("${transition.previousState}" → "${transition.nextState}") does not follow from the prior transition's next state ("${priorTransition.nextState}").`,
      );
    }
    if (!canTransitionMission(transition.previousState, transition.nextState)) {
      issues.push(
        `Transition ${index} ("${transition.previousState}" → "${transition.nextState}") is not in the declared transition graph.`,
      );
    }
  });

  const finalState = mission.history[mission.history.length - 1]?.nextState;
  if (finalState !== undefined && finalState !== mission.currentState) {
    issues.push(
      `Mission currentState ("${mission.currentState}") does not match the last recorded transition's nextState ("${finalState}").`,
    );
  }

  return { valid: issues.length === 0, issues };
}
