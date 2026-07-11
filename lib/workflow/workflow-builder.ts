import type {
  Evidence,
  Execution,
  Mission,
  Question,
  Relationship,
} from "@/lib/foundation/foundation-model";
import type { ReasoningResult } from "@/lib/foundation/reasoning-types";
import type { Workflow } from "@/lib/foundation/workflow-types";

export interface CreateWorkflowInput {
  workflowId: string;
  subjectId: string;
  question?: Question;
  mission?: Mission;
  evidence?: readonly Evidence[];
  relationships?: readonly Relationship[];
  reasoning?: ReasoningResult;
  execution?: Execution;
}

/**
 * Create a new Workflow in its honest initial state — "not_started", with empty history.
 * Entering the initial state is not itself a recorded transition (there is no real previous
 * state to transition from); the first real WorkflowTransition is produced by
 * applyWorkflowTransition once the caller has a real reason, actor, and timestamp for it.
 */
export function createWorkflow(input: CreateWorkflowInput): Workflow {
  return {
    workflowId: input.workflowId,
    subjectId: input.subjectId,
    question: input.question,
    mission: input.mission,
    evidence: input.evidence ?? [],
    relationships: input.relationships ?? [],
    reasoning: input.reasoning,
    execution: input.execution,
    currentState: "not_started",
    history: [],
  };
}
