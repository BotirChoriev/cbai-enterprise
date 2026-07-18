/**
 * Genesis Execution OS — meeting → decision → directive → plan → task chain (device-local).
 */

import {
  genesisId,
  notifyGenesisChanged,
  readGenesisList,
  writeGenesisList,
} from "@/lib/genesis/genesis-storage";
import { recordGenesisAudit } from "@/lib/genesis/genesis-audit-store";
import type { ExecutionStatus, GenesisEvidenceRef } from "@/lib/genesis/genesis-types";

const MEETINGS_KEY = "cbai-genesis-meetings";
const DECISIONS_KEY = "cbai-genesis-decisions";
const DIRECTIVES_KEY = "cbai-genesis-directives";
const PLANS_KEY = "cbai-genesis-execution-plans";
const TASKS_KEY = "cbai-genesis-execution-tasks";

const memoryMeetings: GenesisMeeting[] = [];
const memoryDecisions: GenesisDecision[] = [];
const memoryDirectives: GenesisDirective[] = [];
const memoryPlans: GenesisExecutionPlan[] = [];
const memoryTasks: GenesisExecutionTask[] = [];

export type GenesisMeeting = {
  readonly id: string;
  readonly organizationId: string;
  readonly missionId?: string | null;
  readonly projectId?: string | null;
  readonly title: string;
  readonly date: string;
  readonly participants: readonly string[];
  readonly agenda: string;
  readonly notes: string;
  readonly evidenceRefs: readonly GenesisEvidenceRef[];
  readonly followUpDate?: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type GenesisDecision = {
  readonly id: string;
  readonly meetingId: string;
  readonly organizationId: string;
  readonly missionId?: string | null;
  readonly humanDecisionOwner: string;
  readonly decisionText: string;
  readonly rationale: string;
  readonly evidenceRefs: readonly GenesisEvidenceRef[];
  readonly limitations: string;
  readonly reviewStatus: ExecutionStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type GenesisDirective = {
  readonly id: string;
  readonly decisionId?: string | null;
  readonly organizationId: string;
  readonly missionId?: string | null;
  readonly projectId?: string | null;
  readonly title: string;
  readonly description: string;
  readonly issuingAuthority: string;
  readonly responsibleOwner: string;
  readonly teamId?: string | null;
  readonly objective: string;
  readonly expectedResult: string;
  readonly successCriteria: string;
  readonly evidenceRequirement: string;
  readonly issueDate: string;
  readonly deadline: string;
  readonly priority: "low" | "medium" | "high";
  readonly risks: string;
  readonly dependencies: string;
  readonly status: ExecutionStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type GenesisExecutionPlan = {
  readonly id: string;
  readonly directiveId: string;
  readonly organizationId: string;
  readonly milestones: readonly string[];
  readonly expectedOutputs: string;
  readonly expectedOutcomes: string;
  readonly evidenceRequirements: string;
  readonly status: ExecutionStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type GenesisExecutionTask = {
  readonly id: string;
  readonly planId: string;
  readonly directiveId: string;
  readonly organizationId: string;
  readonly missionId?: string | null;
  readonly projectId?: string | null;
  readonly title: string;
  readonly assignee: string;
  readonly accountableOwner: string;
  readonly collaborators: readonly string[];
  readonly priority: "low" | "medium" | "high";
  readonly deadline: string;
  readonly status: ExecutionStatus;
  readonly dependency?: string | null;
  readonly expectedResult: string;
  readonly evidenceRequirement: string;
  readonly progressNote: string;
  readonly blocker?: string | null;
  readonly completionEvidence?: string | null;
  readonly reviewer?: string | null;
  readonly approvalState: "none" | "pending" | "approved" | "rejected";
  readonly createdAt: string;
  readonly updatedAt: string;
};

function isMeeting(v: unknown): v is GenesisMeeting {
  const m = v as GenesisMeeting;
  return typeof m?.id === "string" && typeof m?.organizationId === "string";
}

function isDecision(v: unknown): v is GenesisDecision {
  const d = v as GenesisDecision;
  return typeof d?.id === "string" && typeof d?.meetingId === "string";
}

function isDirective(v: unknown): v is GenesisDirective {
  const d = v as GenesisDirective;
  return typeof d?.id === "string" && typeof d?.organizationId === "string";
}

function isPlan(v: unknown): v is GenesisExecutionPlan {
  const p = v as GenesisExecutionPlan;
  return typeof p?.id === "string" && typeof p?.directiveId === "string";
}

function isTask(v: unknown): v is GenesisExecutionTask {
  const t = v as GenesisExecutionTask;
  return typeof t?.id === "string" && typeof t?.planId === "string";
}

export function loadMeetings(organizationId?: string): GenesisMeeting[] {
  const all = readGenesisList(MEETINGS_KEY, isMeeting, memoryMeetings);
  return organizationId ? all.filter((m) => m.organizationId === organizationId) : all;
}

export function createMeeting(
  input: Omit<GenesisMeeting, "id" | "createdAt" | "updatedAt">,
): GenesisMeeting {
  const now = new Date().toISOString();
  const meeting: GenesisMeeting = { ...input, id: genesisId("meet"), createdAt: now, updatedAt: now };
  writeGenesisList(MEETINGS_KEY, [...readGenesisList(MEETINGS_KEY, isMeeting, memoryMeetings), meeting], memoryMeetings);
  recordGenesisAudit({ domain: "execution", action: "meeting_created", recordType: "meeting", recordId: meeting.id, actorId: input.participants[0] ?? "operator", organizationId: input.organizationId, missionId: input.missionId, projectId: input.projectId, newState: "Draft" });
  notifyGenesisChanged();
  return meeting;
}

export function createDecision(
  input: Omit<GenesisDecision, "id" | "createdAt" | "updatedAt">,
): GenesisDecision {
  const now = new Date().toISOString();
  const decision: GenesisDecision = { ...input, id: genesisId("dec"), createdAt: now, updatedAt: now };
  writeGenesisList(DECISIONS_KEY, [...readGenesisList(DECISIONS_KEY, isDecision, memoryDecisions), decision], memoryDecisions);
  recordGenesisAudit({ domain: "execution", action: "decision_recorded", recordType: "decision", recordId: decision.id, actorId: input.humanDecisionOwner, organizationId: input.organizationId, missionId: input.missionId, newState: input.reviewStatus });
  notifyGenesisChanged();
  return decision;
}

export function createDirective(
  input: Omit<GenesisDirective, "id" | "createdAt" | "updatedAt">,
): GenesisDirective {
  const now = new Date().toISOString();
  const directive: GenesisDirective = { ...input, id: genesisId("dir"), createdAt: now, updatedAt: now };
  writeGenesisList(DIRECTIVES_KEY, [...readGenesisList(DIRECTIVES_KEY, isDirective, memoryDirectives), directive], memoryDirectives);
  recordGenesisAudit({ domain: "execution", action: "directive_created", recordType: "directive", recordId: directive.id, actorId: input.responsibleOwner, organizationId: input.organizationId, missionId: input.missionId, projectId: input.projectId, newState: input.status });
  notifyGenesisChanged();
  return directive;
}

export function createExecutionPlan(
  input: Omit<GenesisExecutionPlan, "id" | "createdAt" | "updatedAt">,
): GenesisExecutionPlan {
  const now = new Date().toISOString();
  const plan: GenesisExecutionPlan = { ...input, id: genesisId("plan"), createdAt: now, updatedAt: now };
  writeGenesisList(PLANS_KEY, [...readGenesisList(PLANS_KEY, isPlan, memoryPlans), plan], memoryPlans);
  recordGenesisAudit({ domain: "execution", action: "plan_created", recordType: "execution_plan", recordId: plan.id, actorId: "operator", organizationId: input.organizationId, newState: input.status });
  notifyGenesisChanged();
  return plan;
}

export function createExecutionTask(
  input: Omit<GenesisExecutionTask, "id" | "createdAt" | "updatedAt">,
): GenesisExecutionTask {
  const now = new Date().toISOString();
  const task: GenesisExecutionTask = {
    ...input,
    id: genesisId("xtask"),
    createdAt: now,
    updatedAt: now,
  };
  writeGenesisList(TASKS_KEY, [...readGenesisList(TASKS_KEY, isTask, memoryTasks), task], memoryTasks);
  recordGenesisAudit({ domain: "execution", action: "task_created", recordType: "execution_task", recordId: task.id, actorId: input.assignee, organizationId: input.organizationId, missionId: input.missionId, projectId: input.projectId, newState: input.status });
  notifyGenesisChanged();
  return task;
}

export function updateExecutionTask(
  taskId: string,
  patch: Partial<
    Pick<
      GenesisExecutionTask,
      "status" | "progressNote" | "blocker" | "completionEvidence" | "approvalState" | "reviewer"
    >
  >,
): GenesisExecutionTask | null {
  const all = readGenesisList(TASKS_KEY, isTask, memoryTasks);
  const idx = all.findIndex((t) => t.id === taskId);
  if (idx < 0) return null;
  const prev = all[idx]!;
  if (patch.status === "Completed" && !patch.completionEvidence && !prev.completionEvidence) {
    return null;
  }
  const updated: GenesisExecutionTask = {
    ...prev,
    ...patch,
    updatedAt: new Date().toISOString(),
  };
  const next = [...all];
  next[idx] = updated;
  writeGenesisList(TASKS_KEY, next, memoryTasks);
  recordGenesisAudit({
    domain: "execution",
    action: "task_updated",
    recordType: "execution_task",
    recordId: taskId,
    actorId: updated.assignee,
    organizationId: updated.organizationId,
    missionId: updated.missionId,
    projectId: updated.projectId,
    previousState: prev.status,
    newState: updated.status,
  });
  notifyGenesisChanged();
  return updated;
}

export function loadDecisions(organizationId?: string): GenesisDecision[] {
  const all = readGenesisList(DECISIONS_KEY, isDecision, memoryDecisions);
  return organizationId ? all.filter((d) => d.organizationId === organizationId) : all;
}

export function loadDirectives(organizationId?: string): GenesisDirective[] {
  const all = readGenesisList(DIRECTIVES_KEY, isDirective, memoryDirectives);
  return organizationId ? all.filter((d) => d.organizationId === organizationId) : all;
}

export function loadExecutionPlans(organizationId?: string): GenesisExecutionPlan[] {
  const all = readGenesisList(PLANS_KEY, isPlan, memoryPlans);
  return organizationId ? all.filter((p) => {
    const dir = readGenesisList(DIRECTIVES_KEY, isDirective, memoryDirectives).find((d) => d.id === p.directiveId);
    return dir?.organizationId === organizationId;
  }) : all;
}

export function loadExecutionTask(taskId: string): GenesisExecutionTask | null {
  return readGenesisList(TASKS_KEY, isTask, memoryTasks).find((t) => t.id === taskId) ?? null;
}

export function loadExecutionTasks(organizationId?: string): GenesisExecutionTask[] {
  const all = readGenesisList(TASKS_KEY, isTask, memoryTasks);
  return organizationId ? all.filter((t) => t.organizationId === organizationId) : all;
}

export function loadExecutionChain(directiveId: string): {
  directive: GenesisDirective | null;
  plan: GenesisExecutionPlan | null;
  tasks: GenesisExecutionTask[];
} {
  const directive = readGenesisList(DIRECTIVES_KEY, isDirective, memoryDirectives).find((d) => d.id === directiveId) ?? null;
  const plan = readGenesisList(PLANS_KEY, isPlan, memoryPlans).find((p) => p.directiveId === directiveId) ?? null;
  const tasks = plan
    ? readGenesisList(TASKS_KEY, isTask, memoryTasks).filter((t) => t.planId === plan.id)
    : [];
  return { directive, plan, tasks };
}
