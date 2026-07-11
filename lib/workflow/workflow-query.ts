import type {
  Workflow,
  WorkflowActorType,
  WorkflowState,
  WorkflowTransition,
} from "@/lib/foundation/workflow-types";
import { WORKFLOW_STATE_LABELS } from "@/lib/foundation/workflow-types";

/** Only "archived" is truly terminal — "completed" can still evolve back into collection. */
export function isWorkflowStateTerminal(state: WorkflowState): boolean {
  return state === "archived";
}

export function latestWorkflowTransition(workflow: Workflow): WorkflowTransition | undefined {
  return workflow.history[workflow.history.length - 1];
}

/** Every transition performed by a given actor type — for a human/system audit split. */
export function findWorkflowTransitionsByActor(
  workflow: Workflow,
  actorType: WorkflowActorType,
): readonly WorkflowTransition[] {
  return workflow.history.filter((transition) => transition.actor.actorType === actorType);
}

/** Every transition that entered a given state — e.g. every time this workflow stalled. */
export function findWorkflowTransitionsToState(
  workflow: Workflow,
  state: WorkflowState,
): readonly WorkflowTransition[] {
  return workflow.history.filter((transition) => transition.nextState === state);
}

/** A single deterministic sentence describing where the workflow stands — never a summary AI. */
export function describeWorkflowProgress(workflow: Workflow): string {
  const stateLabel = WORKFLOW_STATE_LABELS[workflow.currentState];
  return `Currently "${stateLabel}", with ${workflow.history.length} recorded transition(s).`;
}
