import type { Workflow } from "@/lib/foundation/workflow-types";
import { canTransitionWorkflow } from "@/lib/workflow/workflow-transition";

export interface WorkflowValidationResult {
  valid: boolean;
  issues: readonly string[];
}

/**
 * Deterministic structural validation only — confirms the Workflow record is internally
 * honest, not that its content is correct. Checks identity, that history is a real chain
 * (each transition's previousState matches the one before it, and the final transition lands
 * on currentState), and that every recorded transition was actually legal per the declared
 * graph — a Workflow built any other way than through this engine could otherwise drift.
 */
export function validateWorkflowRecord(workflow: Workflow): WorkflowValidationResult {
  const issues: string[] = [];

  if (!workflow.workflowId.trim()) {
    issues.push("Workflow is missing an identity (workflowId).");
  }
  if (!workflow.subjectId.trim()) {
    issues.push("Workflow is missing a subjectId.");
  }

  workflow.history.forEach((transition, index) => {
    const priorTransition = workflow.history[index - 1];
    if (priorTransition && transition.previousState !== priorTransition.nextState) {
      issues.push(
        `Transition ${index} ("${transition.previousState}" → "${transition.nextState}") does not follow from the prior transition's next state ("${priorTransition.nextState}").`,
      );
    }
    if (!canTransitionWorkflow(transition.previousState, transition.nextState)) {
      issues.push(
        `Transition ${index} ("${transition.previousState}" → "${transition.nextState}") is not in the declared transition graph.`,
      );
    }
  });

  const finalState = workflow.history[workflow.history.length - 1]?.nextState;
  if (finalState !== undefined && finalState !== workflow.currentState) {
    issues.push(
      `Workflow currentState ("${workflow.currentState}") does not match the last recorded transition's nextState ("${finalState}").`,
    );
  }

  return { valid: issues.length === 0, issues };
}
