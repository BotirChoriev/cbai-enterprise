import type {
  Workflow,
  WorkflowActor,
  WorkflowState,
  WorkflowTransition,
} from "@/lib/foundation/workflow-types";

/**
 * The deterministic transition graph every Workflow obeys. Deliberately not a strict linear
 * pipeline: "waiting_for_information" is reachable from every active phase (real work stalls
 * for real reasons), and "monitoring" can loop back to "collecting_evidence" — this loop is how
 * Evolution is represented: a workflow that has shipped can still honestly reopen evidence
 * collection when the world changes, without inventing a thirteenth state. "archived" is the
 * only terminal state; "completed" can still evolve back into collection before archiving.
 */
export const WORKFLOW_TRANSITIONS: Record<WorkflowState, readonly WorkflowState[]> = {
  not_started: ["collecting_evidence"],
  collecting_evidence: ["review_in_progress", "waiting_for_information"],
  review_in_progress: ["ready_for_reasoning", "waiting_for_information"],
  waiting_for_information: [
    "collecting_evidence",
    "review_in_progress",
    "ready_for_reasoning",
    "executing",
  ],
  ready_for_reasoning: ["reasoning_complete"],
  reasoning_complete: ["waiting_for_human_decision"],
  waiting_for_human_decision: ["approved", "collecting_evidence"],
  approved: ["executing"],
  executing: ["monitoring", "waiting_for_information"],
  monitoring: ["completed", "collecting_evidence"],
  completed: ["archived", "collecting_evidence"],
  archived: [],
};

/** Pure lookup — never mutates, never fabricates a path not in the declared graph. */
export function canTransitionWorkflow(from: WorkflowState, to: WorkflowState): boolean {
  return WORKFLOW_TRANSITIONS[from].includes(to);
}

export type WorkflowTransitionValidation =
  | { valid: true }
  | { valid: false; reason: string };

/** Deterministic structural validation of a proposed transition — never a judgment call. */
export function validateWorkflowTransition(
  from: WorkflowState,
  to: WorkflowState,
): WorkflowTransitionValidation {
  if (from === to) {
    return { valid: true };
  }
  if (!canTransitionWorkflow(from, to)) {
    return {
      valid: false,
      reason: `Workflow transition reject: "${from}" → "${to}" is not in the declared transition graph.`,
    };
  }
  return { valid: true };
}

export interface ApplyWorkflowTransitionInput {
  nextState: WorkflowState;
  reason: string;
  timestamp: string;
  actor: WorkflowActor;
  /** The Evidence.evidenceId this transition is based on — explicit null when honestly absent. */
  evidenceReference: string | null;
}

export type ApplyWorkflowTransitionResult =
  | { ok: true; workflow: Workflow; transition: WorkflowTransition }
  | { ok: false; reason: string };

/**
 * Apply one transition to a Workflow. Pure — returns a new Workflow with the transition
 * appended to history, never mutates the input. Rejects (without mutating anything) when the
 * transition is not in WORKFLOW_TRANSITIONS; the caller decides what an invalid attempt means
 * for their domain, this engine only enforces the graph.
 */
export function applyWorkflowTransition(
  workflow: Workflow,
  input: ApplyWorkflowTransitionInput,
): ApplyWorkflowTransitionResult {
  const validation = validateWorkflowTransition(workflow.currentState, input.nextState);
  if (!validation.valid) {
    return { ok: false, reason: validation.reason };
  }

  const transition: WorkflowTransition = {
    transitionId: `${workflow.workflowId}:transition:${workflow.history.length}`,
    previousState: workflow.currentState,
    nextState: input.nextState,
    reason: input.reason,
    timestamp: input.timestamp,
    actor: input.actor,
    evidenceReference: input.evidenceReference,
  };

  return {
    ok: true,
    workflow: {
      ...workflow,
      currentState: input.nextState,
      history: [...workflow.history, transition],
    },
    transition,
  };
}
