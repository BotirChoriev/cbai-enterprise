// Universal Intelligence Workflow shapes — domain-agnostic, shared by every ecosystem. A
// Workflow is not project management and not task management: it is the process record that
// connects a subject's Question, Mission, Evidence, Relationships, Reasoning, and Execution
// into one auditable state machine. lib/workflow/ is the only engine that constructs or
// transitions a Workflow; every transition it produces carries a real reason, actor, timestamp,
// and evidence reference (explicitly null when honestly absent — never omitted, never guessed).

import type {
  Evidence,
  Execution,
  Mission,
  Question,
  Relationship,
} from "@/lib/foundation/foundation-model";
import type { ReasoningResult } from "@/lib/foundation/reasoning-types";

/**
 * The twelve reusable workflow states. Treated as a closed, canonical vocabulary (the same
 * discipline as RELATIONSHIP_TYPES) rather than open-ended free text, so every domain describes
 * process state the same way. "Evolution" (naming a workflow returning to evidence collection
 * after monitoring surfaces new information) is represented as a transition capability of this
 * graph, not a thirteenth state — see lib/workflow/workflow-transition.ts.
 */
export const WORKFLOW_STATES = [
  "not_started",
  "collecting_evidence",
  "review_in_progress",
  "waiting_for_information",
  "ready_for_reasoning",
  "reasoning_complete",
  "waiting_for_human_decision",
  "approved",
  "executing",
  "monitoring",
  "completed",
  "archived",
] as const;

export type WorkflowState = (typeof WORKFLOW_STATES)[number];

export const WORKFLOW_STATE_LABELS: Record<WorkflowState, string> = {
  not_started: "Not started",
  collecting_evidence: "Collecting evidence",
  review_in_progress: "Review in progress",
  waiting_for_information: "Waiting for information",
  ready_for_reasoning: "Ready for reasoning",
  reasoning_complete: "Reasoning complete",
  waiting_for_human_decision: "Waiting for human decision",
  approved: "Approved",
  executing: "Executing",
  monitoring: "Monitoring",
  completed: "Completed",
  archived: "Archived",
};

/** Who performed a transition — this platform ships without authentication (see constitution), so identity is honestly minimal. */
export type WorkflowActorType = "human" | "system";

export interface WorkflowActor {
  actorType: WorkflowActorType;
  /** Real identifier when known — omitted, never guessed, when no identity system is connected. */
  actorId?: string;
}

/**
 * One recorded state change. Every field the mission requires is present on every transition;
 * `evidenceReference` is a required key but an honest `null` when no real evidence record
 * motivated this particular transition — never fabricated, never silently dropped.
 */
export interface WorkflowTransition {
  transitionId: string;
  previousState: WorkflowState;
  nextState: WorkflowState;
  reason: string;
  timestamp: string;
  actor: WorkflowActor;
  evidenceReference: string | null;
}

/**
 * The universal Intelligence Workflow — the process record that connects every capability
 * already built (Question, Mission, Evidence, Relationships, Reasoning, Execution) to one
 * auditable state machine. Not project management, not task management: there are no assignees,
 * due dates, or subtasks here, only an evidence-traceable record of how a subject's intelligence
 * process actually progressed. `history` is append-only — see lib/workflow/workflow-transition.ts.
 */
export interface Workflow {
  workflowId: string;
  subjectId: string;
  question?: Question;
  mission?: Mission;
  evidence: readonly Evidence[];
  relationships: readonly Relationship[];
  reasoning?: ReasoningResult;
  execution?: Execution;
  currentState: WorkflowState;
  history: readonly WorkflowTransition[];
}
