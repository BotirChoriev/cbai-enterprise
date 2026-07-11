// Research Mission Engine. Extends CBAI Platform RC-1 (frozen), the Research Domain
// (lib/research-domain/, Phase 1/2, frozen), and the Research Workspace Contract
// (lib/research-workspace/, Phase 3, frozen) — none of the three is modified or duplicated.
// `WorkflowActor` (lib/foundation/workflow-types.ts, EPIC-06) is reused directly for transition
// actors; `MissionLifecycleState` is a new, small, closed vocabulary — deliberately distinct
// from Platform's `WorkflowState` (an intelligence process's stages, e.g. "collecting_evidence")
// and from the Research Domain's own `ResearchEntityLifecycleState` (a generic 4-state entity
// lifecycle, too coarse for a mission's real project lifecycle). The transition-graph pattern
// below (`MISSION_STATE_TRANSITIONS`, `canTransitionMission`, `validateMissionTransition`,
// `applyMissionTransition`) mirrors lib/workflow/workflow-transition.ts's proven shape exactly —
// the same architecture applied to a new vocabulary, not a copy of Platform Core code.

import type { WorkflowActor } from "@/lib/foundation/workflow-types";
import type { Evidence, Relationship, TimelineEvent } from "@/lib/foundation/foundation-model";
import type { ReasoningRisk } from "@/lib/foundation/reasoning-types";
import type {
  ResearchMissionEntity,
  ResearchQuestionEntity,
  HypothesisEntity,
} from "@/lib/research-domain/research-entities-intent";
import type {
  DatasetEntity,
  PatentEntity,
  PublicationEntity,
} from "@/lib/research-domain/research-entities-artifacts";
import type { ResearchOutcomeEntity } from "@/lib/research-domain/research-entities-outcomes";
import type { ResearchDomainEntity } from "@/lib/research-domain/research-relationships";
import type { ResearchWorkspaceContract } from "@/lib/research-workspace/research-workspace-contract";

/**
 * The nine reusable mission lifecycle states the mission named, a closed vocabulary (the same
 * discipline as WorkflowState and the Research Domain's lifecycle vocabulary).
 */
export const MISSION_LIFECYCLE_STATES = [
  "draft",
  "planned",
  "active",
  "paused",
  "blocked",
  "review",
  "completed",
  "archived",
  "cancelled",
] as const;

export type MissionLifecycleState = (typeof MISSION_LIFECYCLE_STATES)[number];

export const MISSION_LIFECYCLE_STATE_LABELS: Record<MissionLifecycleState, string> = {
  draft: "Draft",
  planned: "Planned",
  active: "Active",
  paused: "Paused",
  blocked: "Blocked",
  review: "Review",
  completed: "Completed",
  archived: "Archived",
  cancelled: "Cancelled",
};

/**
 * The declared transition graph. Every non-terminal state has a path forward and a path to
 * "cancelled"; both "completed" and "cancelled" route to "archived", the only true terminal
 * state — the same "one honest terminal, real loop-backs" discipline WORKFLOW_TRANSITIONS
 * (EPIC-06) established.
 */
export const MISSION_STATE_TRANSITIONS: Record<MissionLifecycleState, readonly MissionLifecycleState[]> = {
  draft: ["planned", "cancelled"],
  planned: ["active", "cancelled"],
  active: ["paused", "blocked", "review", "cancelled"],
  paused: ["active", "cancelled"],
  blocked: ["active", "cancelled"],
  review: ["active", "completed", "cancelled"],
  completed: ["archived"],
  archived: [],
  cancelled: ["archived"],
};

export function canTransitionMission(from: MissionLifecycleState, to: MissionLifecycleState): boolean {
  return MISSION_STATE_TRANSITIONS[from].includes(to);
}

export type MissionTransitionValidation = { valid: true } | { valid: false; reason: string };

export function validateMissionTransition(
  from: MissionLifecycleState,
  to: MissionLifecycleState,
): MissionTransitionValidation {
  if (from === to) {
    return { valid: true };
  }
  if (!canTransitionMission(from, to)) {
    return {
      valid: false,
      reason: `Mission transition reject: "${from}" → "${to}" is not in the declared transition graph.`,
    };
  }
  return { valid: true };
}

/**
 * One recorded lifecycle change. `evidenceReference` is a required key with an honest nullable
 * value — never fabricated when no real evidence motivated a transition — the same rule
 * WorkflowTransition (EPIC-06) already established.
 */
export interface MissionTransition {
  transitionId: string;
  previousState: MissionLifecycleState;
  nextState: MissionLifecycleState;
  reason: string;
  timestamp: string;
  actor: WorkflowActor;
  evidenceReference: string | null;
}

export const MISSION_MILESTONE_STATUSES = ["pending", "achieved", "missed"] as const;
export type MissionMilestoneStatus = (typeof MISSION_MILESTONE_STATUSES)[number];

/** A real, dated project checkpoint — never a completion percentage, always a categorical status. */
export interface MissionMilestone {
  milestoneId: string;
  label: string;
  status: MissionMilestoneStatus;
  targetDate?: string;
  achievedDate?: string;
  evidenceIds: readonly string[];
}

export const MISSION_DELIVERABLE_STATUSES = ["planned", "in_progress", "delivered", "cancelled"] as const;
export type MissionDeliverableStatus = (typeof MISSION_DELIVERABLE_STATUSES)[number];

/** A concrete output the mission is expected to produce — status only, never a quality score. */
export interface MissionDeliverable {
  deliverableId: string;
  label: string;
  status: MissionDeliverableStatus;
  relatedEntityIds: readonly string[];
}

/**
 * A Research Mission — the mission's own real project lifecycle plus every "Support:" concern
 * the mission named. Every field below except goal/scope/currentState/history/milestones/
 * deliverables is a direct reference into Research Domain (Phase 1/2) or Workspace Contract
 * (Phase 3) output — never re-derived, never fabricated. Missing/unknown data is always an
 * empty array or an absent optional field, never a guessed value.
 */
export interface ResearchMission {
  missionId: string;
  goal: string;
  scope: string;
  currentState: MissionLifecycleState;
  history: readonly MissionTransition[];

  researchQuestions: readonly ResearchQuestionEntity[];
  hypotheses: readonly HypothesisEntity[];
  expectedOutcomes: readonly ResearchOutcomeEntity[];
  evidence: readonly Evidence[];
  timeline: readonly TimelineEvent[];
  /** Relationships of type "depends_on" among this mission's own Knowledge Network — real dependency edges, not a new concept. */
  dependencies: readonly Relationship[];
  participants: readonly ResearchDomainEntity[];
  organizations: readonly ResearchDomainEntity[];
  risks: readonly ReasoningRisk[];
  milestones: readonly MissionMilestone[];
  deliverables: readonly MissionDeliverable[];
  relatedPublications: readonly PublicationEntity[];
  relatedPatents: readonly PatentEntity[];
  relatedDatasets: readonly DatasetEntity[];

  /** Traceability to Research Domain — present only when a real ResearchMissionEntity exists for this mission. */
  researchMissionEntity?: ResearchMissionEntity;
  /** Traceability to the Workspace Contract — present only when one could be resolved for this mission. */
  workspaceContract?: ResearchWorkspaceContract;
}

export interface ApplyMissionTransitionInput {
  nextState: MissionLifecycleState;
  reason: string;
  timestamp: string;
  actor: WorkflowActor;
  evidenceReference: string | null;
}

export type ApplyMissionTransitionResult =
  | { ok: true; mission: ResearchMission; transition: MissionTransition }
  | { ok: false; reason: string };

/**
 * Apply one transition to a ResearchMission. Pure — returns a new mission with the transition
 * appended to history, never mutates the input. Rejects (without mutating anything) when the
 * transition is not in MISSION_STATE_TRANSITIONS — no fabricated progress is ever recorded.
 */
export function applyMissionTransition(
  mission: ResearchMission,
  input: ApplyMissionTransitionInput,
): ApplyMissionTransitionResult {
  const validation = validateMissionTransition(mission.currentState, input.nextState);
  if (!validation.valid) {
    return { ok: false, reason: validation.reason };
  }

  const transition: MissionTransition = {
    transitionId: `${mission.missionId}:transition:${mission.history.length}`,
    previousState: mission.currentState,
    nextState: input.nextState,
    reason: input.reason,
    timestamp: input.timestamp,
    actor: input.actor,
    evidenceReference: input.evidenceReference,
  };

  return {
    ok: true,
    mission: {
      ...mission,
      currentState: input.nextState,
      history: [...mission.history, transition],
    },
    transition,
  };
}
